import type { Prisma } from "@prisma/client";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";

// Customers = User rows self-registered through the public portal (C1),
// distinct from admin/staff accounts. `role` is a flat, indexed-by-usage
// string copy of userType.slug set once at signup (see auth.ts's
// databaseHooks) — cheap to filter on directly, no join needed.
export const GET = adminRoute(async (req) => {
  const p = parseListParams(req, {
    sortable: ["createdAt", "name", "email"],
    defaultSort: "createdAt",
  });

  const where: Prisma.UserWhereInput = {
    role: "user",
    ...(p.search
      ? {
          OR: [
            { name: { contains: p.search } },
            { email: { contains: p.search } },
            { phone: { contains: p.search } },
          ],
        }
      : {}),
  };

  const [rows, total] = await db.$transaction([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { [p.sort]: p.dir },
      skip: p.skip,
      take: p.take,
    }),
    db.user.count({ where }),
  ]);

  // Quotes are anonymous rows joined only by the denormalized contact email
  // (same rule the customer's own /account dashboard uses) — no FK, so a
  // second grouped query rather than a Prisma relation count.
  const emails = rows.map((r) => r.email);
  const quoteCounts = emails.length
    ? await db.quote.groupBy({ by: ["email"], where: { email: { in: emails } }, _count: { _all: true } })
    : [];
  const countByEmail = new Map(quoteCounts.map((c) => [c.email, c._count._all]));

  return listResponse(
    rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      email: r.email,
      phone: r.phone,
      emailVerified: r.emailVerified,
      createdAt: r.createdAt,
      quoteCount: countByEmail.get(r.email) ?? 0,
    })),
    total,
    p,
  );
});
