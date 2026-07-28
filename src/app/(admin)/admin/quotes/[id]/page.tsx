import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  EnvelopeSimpleOpenIcon,
  MapPinLineIcon,
  PackageIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { isUnitedStates } from "@/lib/countries";
import { parseId } from "@/lib/list-query";
import { formatPackageTypes } from "@/lib/package-type";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { QuoteStatusControl } from "@/components/admin/quote-status-control";
import { QuoteNextStep } from "@/components/admin/quote-next-step";
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

function CardTitleWithIcon({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={18} className="text-tys-blue" />
      <CardTitle>{children}</CardTitle>
    </div>
  );
}

// One section of the summary strip — a plain padded div rather than its own
// Card, so all four sit inside one bordered card divided by rules instead of
// four separate floating cards of mismatched height.
function SummarySection({
  icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <CardTitleWithIcon icon={icon}>{title}</CardTitleWithIcon>
      {children}
    </div>
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
          <div key={i} className="rounded-md border border-l-2 border-l-tys-blue p-3">
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
  // Envelope/furniture ship at fixed FedEx defaults (no user-entered
  // dimensions) — the public wizard never creates PackageDetail rows or a
  // chargeable weight for them, by design, not a data-fetch bug. Only
  // box/television/auto get real per-package rows.
  const noDetailTypes = new Set(["envelope", "envelop", "furniture"]);
  const requestedTypes = q.packageType
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const isFixedRateOnly =
    requestedTypes.length > 0 && requestedTypes.every((t) => noDetailTypes.has(t));
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0" aria-label="Back to quotes">
            <Link href="/admin/quotes">
              <ArrowLeftIcon size={18} />
            </Link>
          </Button>
          <div>
            <h1 className="text-h2">Quote #{q.id}</h1>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              Created <LocalDateTime iso={q.createdAt} /> <QuoteStatusBadge status={q.status} />
            </p>
          </div>
        </div>
        <QuoteStatusControl quoteId={q.id} status={q.status} className="w-40" />
      </div>

      {/* Always-visible "what do I do now" — the whole point of this page in
          a fast-moving support queue. Tabs would hide the pricing tools
          behind a click; this puts the current step front and center and
          leaves everything else visible below for reference. */}
      <QuoteNextStep
        quote={{
          id: q.id,
          status: q.status,
          hasPrice: q.estimatedCost != null,
          fromCountry: q.fromCountry,
          fromZip: q.fromZip,
          toCountry: q.toCountry,
          toZip: q.toZip,
          contactName: q.contact.name,
          contactEmail: q.contact.email,
          contactPhone: q.contact.phone,
        }}
      />

      <Card size="sm" className="py-0">
        <div className="grid grid-cols-1 divide-y divide-tys-mist md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          <SummarySection icon={MapPinLineIcon} title="Route">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
              <Row label="From" value={`${q.fromZip} ${q.fromCountry}`} />
              <Row label="To" value={`${q.toZip} ${q.toCountry}`} />
              <Row label="Location" value={q.isResidence ? "Residential" : "Commercial"} />
              <Row label="Package types" value={formatPackageTypes(q.packageType)} />
              <Row label="Rating" value={domestic ? "Domestic (US↔US)" : "International (manual)"} />
            </dl>
          </SummarySection>

          <SummarySection icon={UserIcon} title="Contact">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
              <Row label="Name" value={q.contact.name} />
              <Row label="Email" value={q.contact.email} />
              <Row
                label="Phone"
                value={[q.contact.countryCode, q.contact.phone].filter(Boolean).join(" ") || null}
              />
            </dl>
          </SummarySection>

          <SummarySection icon={CurrencyDollarIcon} title="Totals">
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
              <Row
                label="Chargeable weight"
                value={
                  q.totalChargeableWeight ??
                  (isFixedRateOnly ? (
                    <span className="text-muted-foreground">
                      N/A — {formatPackageTypes(q.packageType)} ships at a fixed rate
                    </span>
                  ) : null)
                }
              />
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
          </SummarySection>

          <SummarySection icon={EnvelopeSimpleOpenIcon} title="Email tracking">
            {q.emailStatistic ? (
              <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
                <Row label="Open count" value={q.emailStatistic.openCount} />
                <Row label="First opened" value={<LocalDateTime iso={q.emailStatistic.emailOpenedAt} />} />
                <Row label="Last opened" value={<LocalDateTime iso={q.emailStatistic.lastOpenedAt} />} />
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Not sent yet.</p>
            )}
          </SummarySection>
        </div>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitleWithIcon icon={PackageIcon}>Packages</CardTitleWithIcon>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {q.packages.length ? (
            <>
              <PackageGroup title="Box details" rows={boxRows} />
              <PackageGroup title="Television details" rows={tvRows} />
              <PackageGroup title="Auto details" rows={autoRows} />
            </>
          ) : isFixedRateOnly ? (
            <p className="text-sm text-muted-foreground">
              {formatPackageTypes(q.packageType)} — fixed FedEx dimensions, no package rows to show.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No package rows.</p>
          )}
        </CardContent>
      </Card>

      <div id="pricing" className="flex flex-col gap-6 scroll-mt-6">
        <QuoteWorkstation
          quoteId={q.id}
          isResidence={q.isResidence}
          currency={q.currency ?? "USD"}
          estimatedCost={q.estimatedCost}
          sendTo={q.contact.email}
          packageType={q.packageType}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Last updated <LocalDateTime iso={q.updatedAt} />
      </p>
    </div>
  );
}
