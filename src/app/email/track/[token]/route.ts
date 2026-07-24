import { recordEmailOpen } from "@/lib/email-tracking";

// PUBLIC, unauthenticated, CSRF-exempt (apex host per proxy.ts) — the ONE
// intentionally open route. Byte-identical to Laravel's EmailTrackingController:
// record the open (swallow ALL errors), always return a 1×1 transparent GIF
// with no-cache headers. The URL is baked into already-sent emails — keep it.
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: Request, ctx: Ctx): Promise<Response> {
  try {
    await recordEmailOpen((await ctx.params).token);
  } catch {
    // Never expose tracking errors — the pixel must always return.
  }
  return new Response(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
