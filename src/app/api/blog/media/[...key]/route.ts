import path from "node:path";
import { getFile } from "@/lib/storage";

type Ctx = { params: Promise<{ key: string[] }> };

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Serves blog hero images. Public, no auth — unlike the admin document
 * download route (private, per-shipment) this content is meant to render
 * on public pages.
 *
 * No DB lookup: `buildStorageKey`'s UUID filename is already content-
 * addressed, so a re-uploaded hero image gets a brand new key/URL and this
 * route can cache forever without ever going stale. The `blog/` prefix
 * check is defense in depth — it stops this route being repurposed to read
 * anything else under STORAGE_ROOT (FedEx labels, other future document
 * types), even though the key itself isn't guessable (it's a UUID).
 */
export async function GET(_req: Request, ctx: Ctx) {
  const segments = (await ctx.params).key;
  // Normalized before the prefix check, not after: the raw key
  // "blog/../shipments/<uuid>.pdf" passes startsWith("blog/") but resolves
  // to a FedEx label, and storage.ts's own guard only rejects keys that
  // escape STORAGE_ROOT entirely — this one stays inside it. Next.js strips
  // ".." from URL paths today, so that was never reachable over HTTP, but
  // that's an upstream implementation detail rather than a documented
  // security boundary, and the check above claims to stand on its own.
  const key = path.posix.normalize(segments.join("/"));
  if (!key.startsWith("blog/") || key.split("/").includes("..")) {
    return new Response("Not found.", { status: 404 });
  }

  const bytes = await getFile(key);
  if (!bytes) {
    return new Response("Not found.", { status: 404 });
  }

  const extension = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(bytes.byteLength),
      // Matches staticAssetCacheHeaders in next.config.ts — safe because a
      // changed image always gets a new key (see above), never a stale one
      // sitting behind the same URL.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
