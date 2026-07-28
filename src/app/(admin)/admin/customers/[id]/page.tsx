import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  PhoneIcon,
  ShippingContainerIcon,
  UserIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { formatPackageTypes } from "@/lib/package-type";
import { QUOTE_STATUS_LABELS } from "@/lib/quote-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { UnderConstruction } from "@/components/admin/under-construction";
import {
  DetailTabs,
  DetailTabsContent,
  DetailTabsList,
  DetailTabsTrigger,
} from "@/components/admin/detail-tabs";

export const metadata: Metadata = { title: "Customer — TYS Global Logistics" };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value ?? "—"}</dd>
    </>
  );
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const id = parseId((await params).id);
  const customer =
    id !== null ? await db.user.findFirst({ where: { id, role: "user" } }) : null;
  if (!customer) notFound();

  // Same join rule as the customer's own /account dashboard: quotes are
  // anonymous rows, the denormalized contact email is the only link — no FK.
  const quotes = await db.quote.findMany({
    where: { email: customer.email },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0" aria-label="Back to customers">
            <Link href="/admin/customers">
              <ArrowLeftIcon size={18} />
            </Link>
          </Button>
          <div>
            <h1 className="text-h2">{customer.name}</h1>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              Joined <LocalDateTime iso={customer.createdAt} />
            </p>
          </div>
        </div>
        <Button variant="outline" disabled title="Needs real FedEx booking (Ship API) first">
          <ShippingContainerIcon size={16} />
          Book shipment — coming soon
        </Button>
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon size={18} className="text-tys-blue" />
            Basic info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <Row
              label="Email"
              value={
                <span className="flex items-center gap-1.5">
                  <EnvelopeSimpleIcon size={14} />
                  {customer.email}
                  {customer.emailVerified ? (
                    <Badge variant="outline" className="gap-1 text-emerald-600">
                      <CheckCircleIcon size={12} weight="fill" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <XCircleIcon size={12} /> Unverified
                    </Badge>
                  )}
                </span>
              }
            />
            <Row
              label="Phone"
              value={
                customer.phone ? (
                  <span className="flex items-center gap-1.5">
                    <PhoneIcon size={14} />
                    {customer.phone}
                  </span>
                ) : null
              }
            />
          </dl>
        </CardContent>
      </Card>

      <DetailTabs defaultValue="quotes">
        <DetailTabsList className="grid-cols-3">
          <DetailTabsTrigger value="quotes">Quotes</DetailTabsTrigger>
          <DetailTabsTrigger value="shipments">Shipments</DetailTabsTrigger>
          <DetailTabsTrigger value="documents">Documents</DetailTabsTrigger>
        </DetailTabsList>

        <DetailTabsContent value="quotes" className="pt-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon size={18} className="text-tys-blue" />
                Quote history ({quotes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No quote requests from this email address yet.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-tys-mist">
                  {quotes.map((q) => (
                    <Link
                      key={String(q.id)}
                      href={`/admin/quotes/${Number(q.id)}`}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:bg-muted/30"
                    >
                      <div>
                        <span className="font-medium">
                          {q.fromZip} {q.fromCountry} → {q.toZip} {q.toCountry}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          {formatPackageTypes(q.packageType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {q.estimatedCost != null && (
                          <span className="font-medium">
                            {q.estimatedCost.toString()} {q.currency ?? ""}
                          </span>
                        )}
                        <Badge variant="outline">{QUOTE_STATUS_LABELS[q.status] ?? q.status}</Badge>
                        <LocalDateTime iso={q.createdAt} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </DetailTabsContent>

        <DetailTabsContent value="shipments" className="pt-4">
          <UnderConstruction
            title="Shipment history — under construction"
            description="This will list the customer's booked shipments once real FedEx booking and tracking are wired up. Nothing is faked here in the meantime."
          />
        </DetailTabsContent>

        <DetailTabsContent value="documents" className="pt-4">
          <UnderConstruction
            title="Documents — under construction"
            description="Invoices and shipment documents will appear here once file storage is set up."
          />
        </DetailTabsContent>
      </DetailTabs>
    </div>
  );
}
