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

  // CRM segments (2026-10-05): All · Verified · Has booked · New (30 days).
  const segment = new URL(req.url).searchParams.get("segment");
  const where: Prisma.UserWhereInput = {
    role: "user",
    ...(segment === "verified" ? { emailVerified: true } : {}),
    ...(segment === "booked" ? { shipments: { some: {} } } : {}),
    ...(segment === "new" ? { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } : {}),
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
        accounts: { select: { providerId: true } },
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
  const ids = rows.map((r) => r.id);
  const [quoteCounts, bookingCounts] = await Promise.all([
    emails.length
      ? db.quote.groupBy({ by: ["email"], where: { email: { in: emails } }, _count: { _all: true }, _max: { createdAt: true } })
      : [],
    ids.length
      ? db.shipment.groupBy({ by: ["userId"], where: { userId: { in: ids } }, _count: { _all: true }, _max: { createdAt: true } })
      : [],
  ]);
  const quotesByEmail = new Map(quoteCounts.map((c) => [c.email, c]));
  const bookingsByUser = new Map(bookingCounts.map((c) => [String(c.userId), c]));
  const latest = (...ds: Array<Date | null | undefined>) =>
    ds.filter((d): d is Date => !!d).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  return listResponse(
    rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      email: r.email,
      phone: r.phone,
      emailVerified: r.emailVerified,
      createdAt: r.createdAt,
      quoteCount: quotesByEmail.get(r.email)?._count._all ?? 0,
      bookingCount: bookingsByUser.get(String(r.id))?._count._all ?? 0,
      lastActivity: latest(
        quotesByEmail.get(r.email)?._max.createdAt,
        bookingsByUser.get(String(r.id))?._max.createdAt,
        r.createdAt,
      ),
      signIn: r.accounts.some((a) => a.providerId === "google") ? "google" : "password",
    })),
    total,
    p,
  );
});
