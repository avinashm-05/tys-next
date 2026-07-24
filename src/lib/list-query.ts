/**
 * Server-side list pagination contract shared by every admin list API
 * (vendor-types now; vendors/quotes later — that's why it's server-paginated
 * despite today's tiny volume). Routes parse params here, build their own
 * Prisma `where`, and answer with listResponse → { rows, total, page, pageSize }.
 */

export type ListParams = {
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  search: string;
  skip: number;
  take: number;
};

export function parseListParams(
  req: Request,
  opts: { sortable: string[]; defaultSort: string; defaultDir?: "asc" | "desc" },
): ListParams {
  const q = new URL(req.url).searchParams;
  const page = Math.max(1, Number(q.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(q.get("pageSize")) || 10));
  const sortParam = q.get("sort") ?? "";
  const sort = opts.sortable.includes(sortParam) ? sortParam : opts.defaultSort;
  const dirParam = q.get("dir");
  const dir =
    dirParam === "asc" || dirParam === "desc"
      ? dirParam
      : (opts.defaultDir ?? (sort === opts.defaultSort ? "desc" : "asc"));
  // Strip LIKE metacharacters (% _ \) so every list search matches them
  // literally — Prisma `contains` does NOT escape them (A3.3 review). Other
  // characters (unicode, emails, punctuation) pass through untouched.
  const search = (q.get("search") ?? "")
    .replace(/[%_\\]/g, "")
    .trim()
    .slice(0, 255);
  return { page, pageSize, sort, dir, search, skip: (page - 1) * pageSize, take: pageSize };
}

export function listResponse<T>(rows: T[], total: number, p: ListParams): Response {
  return Response.json({ rows, total, page: p.page, pageSize: p.pageSize });
}

/** Route-param id: digits only → bigint, anything else is a 404-shaped null. */
export function parseId(param: string): bigint | null {
  return /^\d+$/.test(param) ? BigInt(param) : null;
}
