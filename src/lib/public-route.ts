import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/ratelimit";
import { toErrorResponse } from "@/lib/validation/errors";

// Public (anonymous, apex) API wrapper. The new stack has no CSRF, so the
// guardrails for the only public write path (R16) are: a same-origin check +
// per-IP rate limiting (the shared MySQL limiter, src/lib/ratelimit).
//
// ⚠️ TODO(captcha) — TAKE SERIOUSLY BEFORE PUBLIC LAUNCH. POST /api/quotes both
// creates a row AND sends email: a customer confirmation to any address typed
// in, plus an admin notification. Even with the IP limit fixed, a distributed
// attacker can email-bomb an arbitrary victim from our return address. The
// per-IP limit slows a single host; a challenge (hCaptcha/Turnstile) on the
// store endpoint is the real fix. Wire it here.

/**
 * Same-origin = the request's Origin (or Referer) host equals the host it was
 * served on. Compared against the request's OWN host so it holds in every
 * environment (localhost in dev, the apex in prod) without hardcoding a URL.
 * A cross-origin browser fetch always sends Origin, so this blocks it. A
 * header-less request (non-browser client) is allowed through — it isn't a
 * substitute for the rate limit; it's a cheap cross-origin filter (R16).
 */
export function isSameOrigin(req: Request): boolean {
  const host = req.headers.get("host");
  if (!host) return true;
  const source = req.headers.get("origin") ?? req.headers.get("referer");
  if (!source) return true;
  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}

type Handler = (req: Request) => Promise<Response>;

/**
 * Wrap a public API handler with the same-origin check, per-IP rate limiting
 * (fixed window, default 60s, via the shared MySQL limiter), and the shared
 * error contract. `name` scopes the rate-limit bucket per route so the three
 * public endpoints don't share a quota.
 */
export function publicApiRoute(
  opts: { name: string; limit: number; windowSeconds?: number },
  handler: Handler,
): Handler {
  return async (req: Request): Promise<Response> => {
    try {
      if (!isSameOrigin(req)) {
        return Response.json({ message: "Cross-origin requests are not allowed." }, { status: 403 });
      }
      const { allowed, retryAfterSeconds } = await rateLimit(
        `${opts.name}:${clientIp(req)}`,
        opts.limit,
        opts.windowSeconds ?? 60,
      );
      if (!allowed) {
        // Matches the admin throttle body ("Too Many Attempts.").
        return Response.json(
          { message: "Too Many Attempts." },
          { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
        );
      }
      return await handler(req);
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}
