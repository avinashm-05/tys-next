import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { auth, ADMIN_ROLES } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientIp } from "@/lib/client-ip";
import { rateLimit, rateLimitPeek, rateLimitHit, rateLimitClear } from "@/lib/ratelimit";
import { sendAdminSecurityAlert } from "@/lib/mail";
import { audit } from "@/lib/audit";
import { validationError } from "@/lib/validation/errors";

const handlers = toNextJsHandler(auth);

export const GET = handlers.GET;

// Anonymous endpoints that SEND EMAIL (verification / reset) or create rows
// (sign-up). C1 opens sign-up to the public, so these get per-IP fixed-window
// limits — same posture as the public quote endpoints (R16).
const EMAIL_SENDING_LIMITS: Array<[suffix: string, name: string, limit: number]> = [
  ["/sign-up/email", "auth.signup", 5],
  ["/send-verification-email", "auth.send-verification", 5],
  ["/request-password-reset", "auth.request-reset", 5],
  ["/forget-password", "auth.request-reset", 5], // legacy alias of request-password-reset
  // Staff 2-step email code (re)sends. Only works after a correct password
  // (it needs the pending 2-step cookie), but still capped so the resend
  // button can't flood an inbox.
  ["/two-factor/send-otp", "auth.2fa-send-otp", 5],
];

// Sign-in hardening (security audit, 2026-09-30). Before this, sign-in BY
// USERNAME (the username() plugin's /sign-in/username) had no limit at all,
// and the email limit keyed only on email|IP, so rotating IPs or usernames
// allowed unlimited password guessing. Now, in layers:
//  1. Every auth POST: 30 per minute per IP (covers every Better Auth
//     endpoint, including /is-username-available, which confirms usernames).
//  2. Per account + IP: 5 failed sign-ins per minute (Laravel's old limiter).
//  3. Per account, from ANY IP: 10 failed sign-ins in 15 minutes locks that
//     account for the rest of the window. When an ADMIN account locks,
//     staff get an email alert. Keyed on the identifier as typed (see below).
const ALL_AUTH_POSTS_PER_MIN = 30;
const PAIR_FAILS = 5;
const PAIR_WINDOW = 60;
const ACCOUNT_FAILS = 10;
const ACCOUNT_WINDOW = 15 * 60;

function tooMany(retryAfterSeconds: number) {
  return Response.json(
    { message: "Too Many Attempts." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const ip = clientIp(req);

  // Layer 1: a blanket per-IP cap on every auth POST.
  const all = await rateLimit(`auth.post:${ip}`, ALL_AUTH_POSTS_PER_MIN, 60);
  if (!all.allowed) return tooMany(all.retryAfterSeconds);

  for (const [suffix, name, limit] of EMAIL_SENDING_LIMITS) {
    if (path.endsWith(suffix)) {
      const { allowed, retryAfterSeconds } = await rateLimit(`${name}:${ip}`, limit, 60);
      if (!allowed) return tooMany(retryAfterSeconds);
      return handlers.POST(req);
    }
  }

  const byEmail = path.endsWith("/sign-in/email");
  const byUsername = path.endsWith("/sign-in/username");
  if (byEmail || byUsername) {
    let identifier = "";
    try {
      const body = (await req.clone().json()) as { email?: string; username?: string };
      identifier = String((byEmail ? body.email : body.username) ?? "").trim().toLowerCase();
    } catch {
      // non-JSON body — Better Auth will reject it below
    }
    // Keyed on the identifier EXACTLY as typed (privacy audit 2026-09-30).
    // It used to resolve a username to its email so both paths shared one
    // counter, but that made the lock an oracle: lock "jsmith" by username,
    // then try an email and see whether it's locked too, and you learn the
    // two belong to the same account. Separate counters give an attacker at
    // most 10 guesses per 15 minutes per spelling, still negligible.
    const account = identifier ? `${byUsername ? "username:" : ""}${identifier}` : "(empty)";
    const field = byEmail ? "email" : "username";

    // Customer sign-in forms (header X-TYS-Portal: customer) never sign
    // in STAFF accounts: staff use /login. Same generic answer as a wrong
    // password, so it reveals nothing about which accounts are staff.
    if (req.headers.get("x-tys-portal") === "customer" && identifier) {
      const staff = await db.user.findFirst({
        where: byUsername ? { username: identifier } : { email: identifier },
        select: { role: true },
      });
      if (staff && isAdminRole(staff.role)) {
        return Response.json(
          { message: "Invalid email or password", code: "INVALID_EMAIL_OR_PASSWORD" },
          { status: 401 },
        );
      }
    }

    // Staff 2-step (2026-10-05): every staff account signs in with password
    // AND an emailed code. Switching twoFactorEnabled on here (before the
    // password check) is what makes Better Auth hold the session back and
    // ask for the code, for every staff member, old or new, with no setup.
    if (identifier && req.headers.get("x-tys-portal") !== "customer") {
      const staffUser = await db.user.findFirst({
        where: byUsername ? { username: identifier } : { email: identifier },
        select: { id: true, role: true, twoFactorEnabled: true },
      });
      if (staffUser && isAdminRole(staffUser.role) && !staffUser.twoFactorEnabled) {
        await db.user.update({ where: { id: staffUser.id }, data: { twoFactorEnabled: true } });
      }
    }

    // Layer 3 check first: is this account locked right now?
    const lock = await rateLimitPeek(`login.account:${account}`, ACCOUNT_FAILS, ACCOUNT_WINDOW);
    if (!lock.allowed) {
      const minutes = Math.ceil(lock.retryAfterSeconds / 60);
      return validationError({
        [field]: [
          `This account is temporarily locked after too many failed sign-ins. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        ],
      });
    }
    // Layer 2: per account + IP.
    const pairKey = `login:${account}|${ip}`;
    const pair = await rateLimitPeek(pairKey, PAIR_FAILS, PAIR_WINDOW);
    if (!pair.allowed) {
      return validationError({
        [field]: [`Too many login attempts. Please try again in ${pair.retryAfterSeconds} seconds.`],
      });
    }

    const res = await handlers.POST(req);
    // Activity log for STAFF accounts only (customers aren't logged).
    void logStaffSignIn(identifier, byUsername, res.clone(), ip).catch(() => {});
    if (res.ok) {
      await rateLimitClear(pairKey);
    } else if (res.status === 400 || res.status === 401 || res.status === 422) {
      await rateLimitHit(pairKey, PAIR_WINDOW);
      await rateLimitHit(`login.account:${account}`, ACCOUNT_WINDOW);
      const after = await rateLimitPeek(`login.account:${account}`, ACCOUNT_FAILS, ACCOUNT_WINDOW);
      // Alert once, on the failure that engages the lock.
      if (!after.allowed && after.remaining === 0 && lock.remaining === 1) {
        void alertIfAdmin(account, ip).catch((err) =>
          console.error("[auth] security alert failed", err instanceof Error ? err.message : err),
        );
      }
    }
    return res;
  }

  // 2-step sign-in events (staff activity log).
  const twoStep = TWO_STEP_EVENTS.find(([suffix]) => path.endsWith(suffix));
  if (twoStep) {
    const pending = (req.headers.get("cookie") ?? "").includes("two_factor");
    const sessionUser = twoStep[1].startsWith("two_factor.verify")
      ? null
      : (await auth.api.getSession({ headers: req.headers }).catch(() => null))?.user ?? null;
    const res = await handlers.POST(req);
    void logTwoStep(twoStep[1], res.clone(), sessionUser?.id ?? null, pending, ip).catch(() => {});
    return res;
  }

  return handlers.POST(req);
}

const TWO_STEP_EVENTS: Array<[suffix: string, action: string]> = [
  ["/two-factor/verify-otp", "two_factor.verify_email_code"],
  ["/two-factor/verify-totp", "two_factor.verify"],
  ["/two-factor/verify-backup-code", "two_factor.verify_backup_code"],
  ["/two-factor/enable", "two_factor.enable_started"],
  ["/two-factor/disable", "two_factor.disabled"],
];

function isAdminRole(role: string | null | undefined) {
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

async function logStaffSignIn(identifier: string, byUsername: boolean, res: Response, ip: string) {
  if (!identifier) return;
  const user = await db.user.findFirst({
    where: byUsername ? { username: identifier } : { email: identifier },
    select: { id: true, role: true },
  });
  if (!user || !isAdminRole(user.role)) return;
  let action = "sign_in.failed";
  if (res.ok) {
    const body = (await res.json().catch(() => ({}))) as { twoFactorRedirect?: boolean };
    action = body.twoFactorRedirect ? "sign_in.password_ok_code_pending" : "sign_in.success";
  } else if (res.status === 422) {
    action = "sign_in.blocked";
  }
  await audit({ userId: user.id, action, method: "POST", path: byUsername ? "/sign-in/username" : "/sign-in/email", statusCode: res.status, ip });
}

async function logTwoStep(action: string, res: Response, sessionUserId: string | null, pending: boolean, ip: string) {
  if (action.startsWith("two_factor.verify")) {
    if (res.ok) {
      const body = (await res.json().catch(() => ({}))) as { user?: { id?: string | number; role?: string } };
      if (!isAdminRole(body.user?.role)) return;
      await audit({ userId: body.user?.id ?? null, action: `${action}.success`, statusCode: res.status, ip });
    } else if (pending) {
      // Only when a password step really happened (the pending cookie), so
      // anonymous junk requests can't fill the log.
      await audit({ action: `${action}.failed`, statusCode: res.status, ip });
    }
    return;
  }
  if (!res.ok || !sessionUserId) return;
  await audit({ userId: sessionUserId, action, statusCode: res.status, ip });
}

async function alertIfAdmin(account: string, ip: string) {
  const user = account.startsWith("username:")
    ? await db.user.findFirst({ where: { username: account.slice("username:".length) }, select: { id: true, role: true } })
    : await db.user.findFirst({ where: { email: account }, select: { id: true, role: true } });
  if (!user || !isAdminRole(user.role)) return;
  await audit({ userId: user.id, action: "sign_in.locked", ip, detail: `${ACCOUNT_FAILS} failed attempts; locked ${ACCOUNT_WINDOW / 60} min` });
  await sendAdminSecurityAlert({ account, ip, failures: ACCOUNT_FAILS, lockMinutes: ACCOUNT_WINDOW / 60 });
}
