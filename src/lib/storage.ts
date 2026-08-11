import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * File storage for shipment/vendor documents, backed by the server's own
 * disk (the Hostinger box).
 *
 * The interface is deliberately tiny — put/get/remove over an opaque string
 * key — so swapping the backing store for S3/R2 later is a rewrite of this
 * one file and nothing else. Callers never see a filesystem path.
 *
 * STORAGE_ROOT must point somewhere OUTSIDE the deployed app directory in
 * production. Deploys are a manual zip upload that replaces the app folder
 * wholesale (see the Hostinger deploy notes), so anything written inside it
 * is destroyed on the next release. The dev default sits in the repo and is
 * gitignored.
 */
function storageRoot(): string {
  return process.env.STORAGE_ROOT || path.join(process.cwd(), "storage");
}

/**
 * Disk storage cannot work on Vercel: the deployment filesystem is read-only
 * apart from /tmp, and /tmp is per-invocation, so a write would either throw
 * EROFS or "succeed" and vanish before the next request could read it back.
 *
 * Failing loudly here beats letting a blog hero image or a FedEx label upload
 * look like it worked. Everything that doesn't touch files — the admin, the
 * portal, the blog CMS minus hero images — runs on Vercel unaffected. Swapping
 * this module for Vercel Blob or S3 is the fix, and the put/get/remove
 * interface exists precisely so that stays a one-file change.
 */
function assertWritableTarget(): void {
  if (process.env.VERCEL && !process.env.STORAGE_ROOT) {
    throw new Error(
      "File storage is not available on Vercel — the filesystem is ephemeral. " +
        "This preview deployment can do everything except upload or read stored " +
        "files (blog hero images, FedEx labels). Point STORAGE_ROOT at a writable " +
        "volume, or swap src/lib/storage.ts for Vercel Blob / S3.",
    );
  }
}

/**
 * Builds a key for a new file. The caller supplies a prefix describing what
 * owns the file; the filename itself is always a fresh UUID rather than
 * anything user-supplied, so an uploaded name like "../../.env" or a
 * duplicate name can never decide where bytes land.
 */
export function buildStorageKey(prefix: string, extension: string): string {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9/_-]/g, "");
  const safeExt = extension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `${safePrefix}/${randomUUID()}${safeExt ? `.${safeExt}` : ""}`;
}

/**
 * Resolves a key to an absolute path, refusing anything that escapes the
 * root. Keys we generate are always safe; this guards the case where a key
 * read back out of the database has been tampered with, so a traversal can
 * never turn into an arbitrary file read.
 */
function resolveKey(key: string): string {
  const root = path.resolve(storageRoot());
  const full = path.resolve(root, key);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error("Storage key escapes the storage root.");
  }
  return full;
}

export async function putFile(key: string, bytes: Buffer): Promise<void> {
  assertWritableTarget();
  const full = resolveKey(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
}

/** Returns null when the key has no file, rather than throwing ENOENT. */
export async function getFile(key: string): Promise<Buffer | null> {
  try {
    return await readFile(resolveKey(key));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

/** Best-effort delete — a already-missing file is not an error. */
export async function deleteFile(key: string): Promise<void> {
  try {
    await unlink(resolveKey(key));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
