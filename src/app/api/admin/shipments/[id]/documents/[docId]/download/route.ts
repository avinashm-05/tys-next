import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { getFile } from "@/lib/storage";
import { HttpError } from "@/lib/validation/errors";

type Ctx = { params: Promise<{ id: string; docId: string }> };

/** Filenames go out in a Content-Disposition header, so anything that could
 * break out of the quoted string (or inject a second header) is stripped. */
function safeFilename(name: string | null, fallback: string): string {
  const base = (name ?? "").replace(/[^a-zA-Z0-9 ._-]/g, "").trim();
  return base || fallback;
}

/**
 * Streams a stored document back to an authenticated admin.
 *
 * The storage key never leaves the server and is never accepted from the
 * client — it's looked up from the document row, which is itself scoped to
 * the shipment in the URL. That pairing matters: without the shipmentId in
 * the where-clause, any admin-guessable docId would serve any file.
 */
export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const { id, docId } = await ctx.params;
  const shipmentId = parseId(id);
  const documentId = parseId(docId);
  if (shipmentId === null || documentId === null) throw new HttpError(404, "Document not found.");

  const doc = await db.shipmentDocument.findFirst({
    where: { id: documentId, shipmentId },
  });
  if (!doc) throw new HttpError(404, "Document not found.");
  if (!doc.storageKey) throw new HttpError(404, "This document has no file attached yet.");

  const bytes = await getFile(doc.storageKey);
  // Row exists but the file is gone — a restored database against a fresh
  // disk, or a STORAGE_ROOT that moved. Say so plainly instead of a 500.
  if (!bytes) throw new HttpError(404, "The stored file is missing from disk.");

  const extension = doc.storageKey.split(".").pop() ?? "bin";
  const filename = safeFilename(doc.documentName, `document-${documentId}`);

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": doc.contentType ?? "application/octet-stream",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `inline; filename="${filename}.${extension}"`,
      // Documents are per-shipment and admin-only — never let a shared cache
      // hold a copy.
      "Cache-Control": "private, no-store",
    },
  });
});
