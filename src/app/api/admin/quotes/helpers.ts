import type { Prisma } from "@prisma/client";
import { decimal2 } from "@/lib/serialize";

export const QUOTE_INCLUDE = {
  contacts: { orderBy: { id: "asc" } },
  emailStatistic: true,
} satisfies Prisma.QuoteInclude;

export const QUOTE_DETAIL_INCLUDE = {
  contacts: { orderBy: { id: "asc" } },
  emailStatistic: true,
  packages: { orderBy: { id: "asc" } },
} satisfies Prisma.QuoteInclude;

/**
 * Exact CSV-member match — Laravel's FIND_IN_SET, without raw SQL. A value X
 * is a member of a comma-list C iff C equals X, starts with "X,", ends with
 * ",X", or contains ",X," (the commas make it a whole-member match, never the
 * forbidden bare substring). The wizard normalizes "boxes"→"box" at store
 * time, but live data may carry either, so a "box" filter matches both
 * (`boxes matches box|boxes`, 03-logic).
 */
function csvMemberConditions(field: "packageType", value: string): Prisma.QuoteWhereInput[] {
  return [
    { [field]: value },
    { [field]: { startsWith: `${value},` } },
    { [field]: { endsWith: `,${value}` } },
    { [field]: { contains: `,${value},` } },
  ];
}

export function packageTypeWhere(value: string): Prisma.QuoteWhereInput {
  const aliases = value === "box" ? ["box", "boxes"] : [value];
  return { OR: aliases.flatMap((a) => csvMemberConditions("packageType", a)) };
}

type QuoteContactRow = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
};

type QuoteWithRelations = Prisma.QuoteGetPayload<{ include: typeof QUOTE_INCLUDE }> & {
  packages?: Prisma.PackageDetailGetPayload<object>[];
};

/** First QuoteContact row is THE contact; fall back to the denormalized fields. */
function resolveContact(q: QuoteWithRelations) {
  const c = q.contacts[0] as QuoteContactRow | undefined;
  return c
    ? { name: c.name, email: c.email, countryCode: c.countryCode, phone: c.phone }
    : { name: q.name ?? null, email: q.email ?? null, countryCode: null, phone: q.mobileNumber ?? null };
}

function serializeEmailStat(q: QuoteWithRelations) {
  const s = q.emailStatistic;
  if (!s) return null;
  return {
    openCount: s.openCount,
    emailOpenedAt: s.emailOpenedAt,
    lastOpenedAt: s.lastOpenedAt,
  };
}

/** List-row shape: route parts, contact, CSV package_type, string decimals. */
export function serializeQuoteRow(q: QuoteWithRelations) {
  return {
    id: Number(q.id),
    fromCountry: q.fromCountry,
    fromZip: q.fromZip,
    toCountry: q.toCountry,
    toZip: q.toZip,
    isResidence: q.isResidence,
    packageType: q.packageType,
    status: q.status,
    totalChargeableWeight: decimal2(q.totalChargeableWeight),
    estimatedCost: decimal2(q.estimatedCost),
    currency: q.currency,
    contact: resolveContact(q),
    emailStatistic: serializeEmailStat(q),
    createdAt: q.createdAt,
  };
}

function serializePackage(p: Prisma.PackageDetailGetPayload<object>) {
  return {
    id: Number(p.id),
    packageType: p.packageType,
    quantity: p.quantity,
    weight: decimal2(p.weight),
    weightUnit: p.weightUnit,
    length: decimal2(p.length),
    width: decimal2(p.width),
    height: decimal2(p.height),
    chargeableWeight: decimal2(p.chargeableWeight),
    brandName: p.brandName,
    tvModel: p.tvModel,
    carModel: p.carModel,
    carYear: p.carYear, // string in the DB (R8) — passed through as-is
  };
}

/** Detail shape: everything in the row + packages + raw category JSON + timestamps. */
export function serializeQuoteDetail(q: QuoteWithRelations) {
  return {
    ...serializeQuoteRow(q),
    boxData: q.boxData,
    televisionData: q.televisionData,
    autoData: q.autoData,
    packages: (q.packages ?? []).map(serializePackage),
    updatedAt: q.updatedAt,
  };
}
