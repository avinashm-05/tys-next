import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { auth, ADMIN_ROLES } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientIp } from "@/lib/client-ip";
import { rateLimit, rateLimitPeek, rateLimitHit, rateLimitClear } from "@/lib/ratelimit";
import { sendAdminSecurityAlert } from "@/lib/mail";
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
//     staff get an email alert. Both sign-in paths (email and username)
//     share the same account key, so switching paths doesn't reset it.
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
    // One account key for both paths: resolve a username to its email when
    // the account exists, so email and username attempts count together.
    const account = await accountKey(identifier, byUsername);
    const field = byEmail ? "email" : "username";

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

  return handlers.POST(req);
}

/** Lower-cased email for the account behind this identifier, or the identifier itself. */
async function accountKey(identifier: string, isUsername: boolean): Promise<string> {
  if (!identifier) return "(empty)";
  if (!isUsername) return identifier;
  const user = await db.user.findFirst({ where: { username: identifier }, select: { email: true } });
  return user?.email?.toLowerCase() ?? `username:${identifier}`;
}

async function alertIfAdmin(account: string, ip: string) {
  if (!account.includes("@")) return;
  const user = await db.user.findFirst({ where: { email: account }, select: { role: true } });
  if (!user || !ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) return;
  await sendAdminSecurityAlert({ account, ip, failures: ACCOUNT_FAILS, lockMinutes: ACCOUNT_WINDOW / 60 });
}
