/**
 * Client fetch wrapper for /api/admin/*. Non-2xx responses become ApiError
 * carrying the Laravel-shaped body ({ message, errors }) so forms can map
 * 422s to fields and dialogs can show 409 guard messages.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function adminApi<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  // A FormData body (file uploads — see the blog hero uploader) must NOT get
  // an explicit Content-Type: the browser needs to set its own
  // multipart/form-data; boundary=... value from the FormData object itself.
  // Forcing application/json here silently breaks the server's
  // req.formData() parse — confirmed live: identical requests succeeded via
  // a raw fetch() (no Content-Type) and failed through this wrapper before
  // this fix, with no client-visible sign beyond the upload having no
  // effect.
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(path, {
    ...init,
    headers: isFormData ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.ok) return res.json() as Promise<T>;
  const body = (await res.json().catch(() => ({}))) as {
    message?: string;
    errors?: Record<string, string[]>;
  };
  throw new ApiError(res.status, body.message ?? `Request failed (${res.status}).`, body.errors);
}

export type ListResponse<T> = { rows: T[]; total: number; page: number; pageSize: number };
