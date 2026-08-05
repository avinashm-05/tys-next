import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PackageIcon, TelevisionIcon, CarIcon } from "@phosphor-icons/react/dist/ssr";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { decimal2 } from "@/lib/serialize";
import { formatPackageTypes } from "@/lib/package-type";
import { QuoteStatusPill } from "@/components/public/account/account-nav";

export const metadata: Metadata = { title: "Quote details — TYS Global Logistics" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex gap-2 text-sm">
      <span className="min-w-[170px] text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

const CARD = "rounded-2xl border border-brand-light bg-white p-6";

// Read-only quote detail. IDOR protection (critical): the query itself
// requires quote.email === the verified session email — a guessed id that
// belongs to someone else can never match and 404s. No mutations here.
export default async function MyQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCustomerPage();
  const id = parseId((await params).id);

  const quote =
    id !== null
      ? await db.quote.findFirst({
          where: { id, email: session.user.email }, // ownership in the WHERE — not after
          include: { packages: true },
        })
      : null;
  if (!quote) notFound();

  const boxes = quote.packages.filter((p) => p.packageType === "box" || p.packageType === "boxes");
  const tvs = quote.packages.filter((p) => p.packageType === "television");
  const autos = quote.packages.filter((p) => p.packageType === "auto");
  const unit = (quote.packages[0]?.weightUnit ?? "lb").toUpperCase();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-2xl font-bold text-ink">Quote #{Number(quote.id)}</h1>
        <QuoteStatusPill status={quote.status} />
        <Link
          href="/account/quotes"
          className="ml-auto flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          <ArrowLeftIcon size={14} />
          All quotes
        </Link>
      </div>

      <div className={`${CARD} mb-5`}>
        <h2 className="mb-3 text-base font-bold text-ink">Shipment</h2>
        <Row label="Route" value={`${quote.fromCountry} (${quote.fromZip}) → ${quote.toCountry} (${quote.toZip})`} />
        <Row label="Delivery type" value={quote.isResidence ? "Residential" : "Commercial"} />
        <Row label="Packages" value={formatPackageTypes(quote.packageType)} />
        {quote.totalChargeableWeight != null && (
          <Row label="Total chargeable weight" value={`${decimal2(quote.totalChargeableWeight)} ${unit}`} />
        )}
        <Row
          label="Estimated cost"
          value={
            quote.estimatedCost != null ? (
              <strong>
                {decimal2(quote.estimatedCost)} {quote.currency ?? "USD"}
              </strong>
            ) : (
              "Awaiting price — our team will contact you"
            )
          }
        />
        {quote.createdAt && <Row label="Submitted" value={`${dateFmt.format(quote.createdAt)} UTC`} />}
      </div>

      {boxes.length > 0 && (
        <div className={`${CARD} mb-5`}>
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
            <PackageIcon size={18} className="text-brand" />
            Boxes
          </h2>
          {boxes.map((p, i) => (
            <p key={String(p.id)} className="m-0 mb-2 text-sm text-ink">
              <strong>Box #{i + 1}</strong> — qty {p.quantity}, {decimal2(p.weight) ?? "N/A"}{" "}
              {(p.weightUnit ?? "lb").toUpperCase()}, {decimal2(p.length) ?? "–"} ×{" "}
              {decimal2(p.width) ?? "–"} × {decimal2(p.height) ?? "–"}
              {p.chargeableWeight != null && (
                <span className="text-ink-muted"> · chargeable {decimal2(p.chargeableWeight)}</span>
              )}
            </p>
          ))}
        </div>
      )}

      {tvs.length > 0 && (
        <div className={`${CARD} mb-5`}>
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
            <TelevisionIcon size={18} className="text-brand" />
            Televisions
          </h2>
          {tvs.map((p, i) => (
            <p key={String(p.id)} className="m-0 mb-2 text-sm text-ink">
              <strong>Television #{i + 1}</strong> — {p.brandName ?? "N/A"} {p.tvModel ?? ""},{" "}
              {decimal2(p.weight) ?? "N/A"} {(p.weightUnit ?? "lb").toUpperCase()},{" "}
              {decimal2(p.length) ?? "–"} × {decimal2(p.width) ?? "–"} × {decimal2(p.height) ?? "–"}
            </p>
          ))}
        </div>
      )}

      {autos.length > 0 && (
        <div className={CARD}>
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
            <CarIcon size={18} className="text-brand" />
            Vehicles
          </h2>
          {autos.map((p, i) => (
            <p key={String(p.id)} className="m-0 mb-2 text-sm text-ink">
              <strong>Vehicle #{i + 1}</strong> — {p.brandName ?? "N/A"} {p.carModel ?? ""}
              {p.carYear ? ` (${p.carYear})` : ""}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
