import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { isUnitedStates } from "@/lib/countries";
import { parseId } from "@/lib/list-query";
import { formatDateTime } from "@/lib/format";
import { formatPackageTypes } from "@/lib/package-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { QuoteStatusControl } from "@/components/admin/quote-status-control";
import { QuoteWorkstation } from "@/components/admin/quote-workstation";
import { QUOTE_DETAIL_INCLUDE, serializeQuoteDetail } from "@/app/api/admin/quotes/helpers";

export const metadata: Metadata = { title: "Quote — TYS Global Logistics" };

type Pkg = ReturnType<typeof serializeQuoteDetail>["packages"][number];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value ?? "—"}</dd>
    </>
  );
}

// Rendered breakdown per package type (replaces the old raw-JSON <pre>),
// mirroring the wizard/email structure. Decimals are already strings (R3);
// carYear is a string (R8).
function PackageGroup({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: React.ReactNode }[][];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((fields, i) => (
          <div key={i} className="rounded-md border border-l-2 border-l-tys-orange p-3">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-xs">
              {fields.map((f) => (
                <Row key={f.label} label={f.label} value={f.value} />
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

const dim = (p: Pkg) =>
  [p.length, p.width, p.height].every((d) => d == null)
    ? "—"
    : `${p.length ?? "—"} × ${p.width ?? "—"} × ${p.height ?? "—"}`;

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const id = parseId((await params).id);
  const row =
    id !== null
      ? await db.quote.findUnique({ where: { id }, include: QUOTE_DETAIL_INCLUDE })
      : null;
  if (!row) notFound();
  const q = serializeQuoteDetail(row);

  const unit = row.packages[0]?.weightUnit ?? "";
  const boxes = q.packages.filter((p) => p.packageType === "box" || p.packageType === "boxes");
  const tvs = q.packages.filter((p) => p.packageType === "television");
  const autos = q.packages.filter((p) => p.packageType === "auto");

  const boxRows = boxes.map((p) => [
    { label: "Quantity", value: p.quantity },
    { label: "Weight", value: p.weight == null ? "—" : `${p.weight} ${unit}`.trim() },
    { label: "Size", value: dim(p) },
    { label: "Chargeable", value: p.chargeableWeight == null ? "—" : `${p.chargeableWeight} ${unit}`.trim() },
  ]);
  const tvRows = tvs.map((p) => [
    { label: "Brand", value: p.brandName },
    { label: "Model", value: p.tvModel },
    { label: "Quantity", value: p.quantity },
    { label: "Weight", value: p.weight == null ? "—" : `${p.weight} ${unit}`.trim() },
    { label: "Size", value: dim(p) },
  ]);
  const autoRows = autos.map((p) => [
    { label: "Vehicle", value: p.brandName },
    { label: "Model", value: p.carModel },
    { label: "Year", value: p.carYear },
    { label: "Quantity", value: p.quantity },
  ]);

  const domestic = isUnitedStates(row.fromCountry) && isUnitedStates(row.toCountry);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2">Quote #{q.id}</h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDateTime(q.createdAt)} · <QuoteStatusBadge status={q.status} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuoteStatusControl quoteId={q.id} status={q.status} className="w-40" />
          <Button asChild variant="outline">
            <Link href="/admin/quotes">Back to quotes</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Route</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
              <Row label="From" value={`${q.fromZip} ${q.fromCountry}`} />
              <Row label="To" value={`${q.toZip} ${q.toCountry}`} />
              <Row label="Location" value={q.isResidence ? "Residential" : "Commercial"} />
              <Row label="Package types" value={formatPackageTypes(q.packageType)} />
              <Row label="Rating" value={domestic ? "Domestic (US↔US)" : "International (manual)"} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
              <Row label="Name" value={q.contact.name} />
              <Row label="Email" value={q.contact.email} />
              <Row
                label="Phone"
                value={[q.contact.countryCode, q.contact.phone].filter(Boolean).join(" ") || null}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
              <Row label="Chargeable weight" value={q.totalChargeableWeight} />
              {/* R26: estimatedCost may legitimately be NULL (not yet priced). */}
              <Row
                label="Quoted price"
                value={
                  q.estimatedCost == null ? (
                    <span className="text-muted-foreground">Not yet priced</span>
                  ) : (
                    <span className="font-medium">{`${q.estimatedCost} ${q.currency ?? ""}`.trim()}</span>
                  )
                }
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email tracking</CardTitle>
          </CardHeader>
          <CardContent>
            {q.emailStatistic ? (
              <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
                <Row label="Open count" value={q.emailStatistic.openCount} />
                <Row label="First opened" value={formatDateTime(q.emailStatistic.emailOpenedAt)} />
                <Row label="Last opened" value={formatDateTime(q.emailStatistic.lastOpenedAt)} />
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Not sent yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packages</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {q.packages.length ? (
            <>
              <PackageGroup title="Box details" rows={boxRows} />
              <PackageGroup title="Television details" rows={tvRows} />
              <PackageGroup title="Auto details" rows={autoRows} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No package rows.</p>
          )}
        </CardContent>
      </Card>

      <QuoteWorkstation
        quoteId={q.id}
        isResidence={q.isResidence}
        currency={q.currency ?? "USD"}
        hasPrice={q.estimatedCost != null}
        sendTo={q.contact.email}
      />

      <p className="text-xs text-muted-foreground">Last updated {formatDateTime(q.updatedAt)}</p>
    </div>
  );
}
