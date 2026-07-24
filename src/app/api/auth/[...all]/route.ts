import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { clientIp } from "@/lib/client-ip";
import { rateLimit, rateLimitPeek, rateLimitHit, rateLimitClear } from "@/lib/ratelimit";
import { validationError } from "@/lib/validation/errors";

const handlers = toNextJsHandler(auth);

export const GET = handlers.GET;

// Anonymous endpoints that SEND EMAIL (verification / reset) or create rows
// (sign-up). C1 opens sign-up to the public, so these get per-IP fixed-window
// limits — same posture as the public quote endpoints (R16). Sign-in keeps its
// own Laravel-exact limiter below.
const EMAIL_SENDING_LIMITS: Array<[suffix: string, name: string, limit: number]> = [
  ["/sign-up/email", "auth.signup", 5],
  ["/send-verification-email", "auth.send-verification", 5],
  ["/request-password-reset", "auth.request-reset", 5],
  ["/forget-password", "auth.request-reset", 5], // legacy alias of request-password-reset
];

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname;

  for (const [suffix, name, limit] of EMAIL_SENDING_LIMITS) {
    if (path.endsWith(suffix)) {
      const { allowed, retryAfterSeconds } = await rateLimit(`${name}:${clientIp(req)}`, limit, 60);
      if (!allowed) {
        return Response.json(
          { message: "Too Many Attempts." },
          { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
        );
      }
      return handlers.POST(req);
    }
  }

  if (path.endsWith("/sign-in/email")) {
    // Laravel's login limiter, exact semantics (R33): 5 FAILED attempts per
    // lower(email)|ip per 60s — peek first, hit only on failure, clear on
    // success so successful logins never count against the limit.
    let email = "";
    try {
      const body = (await req.clone().json()) as { email?: string };
      email = String(body.email ?? "").toLowerCase();
    } catch {
      // non-JSON body — Better Auth will reject it below
    }
    const key = `login:${email}|${clientIp(req)}`;

    const { allowed, retryAfterSeconds } = await rateLimitPeek(key, 5, 60);
    if (!allowed) {
      // Laravel returns the throttle message as a 422 on the email field.
      const message = `Too many login attempts. Please try again in ${retryAfterSeconds} seconds.`;
      return validationError({ email: [message] });
    }

    const res = await handlers.POST(req);
    if (res.ok) await rateLimitClear(key);
    else if (res.status === 401 || res.status === 422) await rateLimitHit(key, 60);
    return res;
  }

  return handlers.POST(req);
}
