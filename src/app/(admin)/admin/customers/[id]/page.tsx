import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  PackageIcon,
  PaperPlaneTiltIcon,
  PhoneIcon,
  UserPlusIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { countryName } from "@/lib/countries";
import { parseId } from "@/lib/list-query";
import { formatPackageTypes } from "@/lib/package-type";
import { quoteRef } from "@/lib/quote-ref";
import { EMAIL_NOTE_PREFIX } from "@/lib/quote-email";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { CustomerAvatar, GoogleMark, relativeTime } from "@/components/admin/customer-bits";
import { UnderlineTabs, UnderlineTabsContent, UnderlineTabsList, UnderlineTabsTrigger } from "@/components/admin/underline-tabs";
import { ShipmentStatusBadge } from "../../shipments/shipment-status-badge";
import type { ShipmentStatus } from "../../shipments/types";

export const metadata: Metadata = { title: "Customer — TYS Global Logistics" };
export const dynamic = "force-dynamic";

const TZ = "America/New_York";
const dateTime = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: TZ });
const dateOnly = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: TZ });
const money = (n: number, c: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 2 }).format(n);
const route = (from: string, to: string) =>
  !from && !to ? "Route not set" : `${countryName(from) || "?"} → ${countryName(to) || "?"}`;

type Event = { at: Date; kind: "joined" | "quote" | "email" | "booking"; title: string; meta: string; href?: string };

const EVENT_ICON = {
  joined: { icon: UserPlusIcon, tone: "bg-slate-100 text-slate-600" },
  quote: { icon: FileTextIcon, tone: "bg-amber-50 text-amber-700" },
  email: { icon: PaperPlaneTiltIcon, tone: "bg-blue-50 text-tys-blue" },
  booking: { icon: PackageIcon, tone: "bg-emerald-50 text-emerald-700" },
} as const;

// Customer profile, standard CRM layout (2026-10-05): identity + contact
// actions on the left, everything that happened with them on the right.
// Quotes join by the contact email (quotes are anonymous rows, no FK);
// bookings join by the real userId.
export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const id = parseId((await params).id);
  const customer =
    id !== null
      ? await db.user.findFirst({
          where: { id, role: "user" },
          // Only what the page shows (privacy audit 2026-09-30): never load
          // the legacy password hash / remember token into the render.
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            phone: true,
            createdAt: true,
            accounts: { select: { providerId: true } },
          },
        })
      : null;
  if (!customer) notFound();

  const [quotes, bookings] = await Promise.all([
    db.quote.findMany({
      where: { email: customer.email },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, status: true, fromCountry: true, toCountry: true, packageType: true, estimatedCost: true, currency: true, createdAt: true },
    }),
    db.shipment.findMany({
      where: { userId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, status: true, trackingNumber: true, fromCountry: true, toCountry: true, recipientCity: true, createdAt: true },
    }),
  ]);
  const emails = quotes.length
    ? await db.quoteNote.findMany({
        where: { quoteId: { in: quotes.map((q) => q.id) }, comment: { startsWith: EMAIL_NOTE_PREFIX } },
        orderBy: { id: "desc" },
        take: 100,
        select: { id: true, quoteId: true, comment: true, createdAt: true },
      })
    : [];

  const events: Event[] = [
    ...(customer.createdAt ? [{ at: customer.createdAt, kind: "joined" as const, title: "Created their account", meta: "" }] : []),
    ...quotes.flatMap((q) =>
      q.createdAt
        ? [{ at: q.createdAt, kind: "quote" as const, title: `Requested quote #${quoteRef(q.id)}`, meta: `${formatPackageTypes(q.packageType)} · ${route(q.fromCountry, q.toCountry)}`, href: `/admin/quotes/${q.id}` }]
        : [],
    ),
    ...emails.flatMap((n) => {
      if (!n.createdAt) return [];
      const m = n.comment.match(/^Email sent: (.+?) to \S+\. Subject: "(.*)"$/);
      return [{ at: n.createdAt, kind: "email" as const, title: m ? `We emailed: ${m[1]}` : "We emailed them", meta: m ? m[2] : "", href: `/admin/quotes/${n.quoteId}` }];
    }),
    ...bookings.flatMap((b) =>
      b.createdAt
        ? [{ at: b.createdAt, kind: "booking" as const, title: `Booked shipment #${b.id}`, meta: `${route(b.fromCountry, b.toCountry)}${b.recipientCity ? ` · to ${b.recipientCity}` : ""}`, href: `/admin/shipments/${b.id}/edit` }]
        : [],
    ),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  const quotedValue = quotes
    .filter((q) => q.estimatedCost != null && (q.currency ?? "USD") === "USD")
    .reduce((s, q) => s + Number(q.estimatedCost), 0);
  const google = customer.accounts.some((a) => a.providerId === "google");
  const phoneDigits = customer.phone?.replace(/[^\d+]/g, "") ?? "";

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon size={14} /> Customers
      </Link>

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Identity */}
        <aside className="flex flex-col gap-5 rounded-2xl border bg-background p-5 lg:sticky lg:top-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <CustomerAvatar name={customer.name} size="lg" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{customer.name}</h1>
              <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                {customer.email}
                {customer.emailVerified && <CheckCircleIcon size={14} weight="fill" className="text-emerald-600" aria-label="Verified" />}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Action href={`mailto:${customer.email}`} icon={EnvelopeSimpleIcon} label="Email" />
            <Action href={phoneDigits ? `tel:${phoneDigits}` : undefined} icon={PhoneIcon} label="Call" />
            <Action href={phoneDigits ? `https://wa.me/${phoneDigits.replace(/^\+/, "")}` : undefined} icon={WhatsappLogoIcon} label="WhatsApp" />
          </div>

          <div className="grid grid-cols-3 divide-x rounded-xl border text-center">
            <Stat label="Quotes" value={String(quotes.length)} />
            <Stat label="Bookings" value={String(bookings.length)} />
            <Stat label="Quoted" value={quotedValue ? money(quotedValue, "USD").replace(/\.00$/, "") : "—"} />
          </div>

          <dl className="flex flex-col gap-3 text-sm">
            <Detail label="Phone" value={customer.phone ?? "Not added"} muted={!customer.phone} />
            <Detail label="Email" value={customer.emailVerified ? "Verified" : "Not verified yet"} muted={!customer.emailVerified} />
            <Detail
              label="Signs in with"
              value={
                google ? (
                  <span className="inline-flex items-center gap-1.5">
                    <GoogleMark /> Google
                  </span>
                ) : (
                  "Email and password"
                )
              }
            />
            <Detail label="Customer since" value={customer.createdAt ? dateOnly.format(customer.createdAt) : "—"} />
            <Detail label="Last activity" value={relativeTime(events[0]?.at ?? null)} />
          </dl>
        </aside>

        {/* Everything that happened */}
        <section className="min-w-0 rounded-2xl border bg-background">
          <UnderlineTabs defaultValue="activity">
            <UnderlineTabsList>
              <UnderlineTabsTrigger value="activity">Activity</UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="quotes">Quotes ({quotes.length})</UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="bookings">Bookings ({bookings.length})</UnderlineTabsTrigger>
            </UnderlineTabsList>

            <UnderlineTabsContent value="activity" className="p-5">
              {events.length === 0 ? (
                <Empty text="Nothing yet." />
              ) : (
                <ol className="relative flex flex-col gap-5 before:absolute before:top-2 before:bottom-2 before:left-4 before:w-px before:bg-border">
                  {events.map((e, i) => {
                    const { icon: Icon, tone } = EVENT_ICON[e.kind];
                    const body = (
                      <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{e.title}</p>
                          {e.meta && <p className="truncate text-xs text-muted-foreground">{e.meta}</p>}
                        </div>
                        <time className="shrink-0 text-xs text-muted-foreground" title={dateTime.format(e.at)}>
                          {relativeTime(e.at)}
                        </time>
                      </div>
                    );
                    return (
                      <li key={i} className="relative flex items-start gap-3">
                        <span className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background ${tone}`}>
                          <Icon size={15} weight="bold" />
                        </span>
                        {e.href ? (
                          <Link href={e.href} className="-m-1.5 flex min-w-0 flex-1 rounded-lg p-1.5 hover:bg-muted/50">
                            {body}
                          </Link>
                        ) : (
                          body
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </UnderlineTabsContent>

            <UnderlineTabsContent value="quotes">
              {quotes.length === 0 ? (
                <Empty text="No quote requests from this email address yet." />
              ) : (
                <ul className="divide-y">
                  {quotes.map((q) => (
                    <li key={String(q.id)}>
                      <Link href={`/admin/quotes/${q.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-muted/50">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            #{quoteRef(q.id)} · {formatPackageTypes(q.packageType)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {route(q.fromCountry, q.toCountry)} · {q.createdAt ? dateOnly.format(q.createdAt) : ""}
                          </p>
                        </div>
                        {q.estimatedCost != null && (
                          <span className="text-sm font-semibold tabular-nums">{money(Number(q.estimatedCost), q.currency ?? "USD")}</span>
                        )}
                        <QuoteStatusBadge status={q.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </UnderlineTabsContent>

            <UnderlineTabsContent value="bookings">
              {bookings.length === 0 ? (
                <Empty text="No online bookings yet." />
              ) : (
                <ul className="divide-y">
                  {bookings.map((b) => (
                    <li key={String(b.id)}>
                      <Link href={`/admin/shipments/${b.id}/edit`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-muted/50">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            Booking #{b.id}
                            {b.trackingNumber ? ` · ${b.trackingNumber}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {route(b.fromCountry, b.toCountry)}
                            {b.recipientCity ? ` · to ${b.recipientCity}` : ""} · {b.createdAt ? dateOnly.format(b.createdAt) : ""}
                          </p>
                        </div>
                        <ShipmentStatusBadge status={b.status as ShipmentStatus} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </UnderlineTabsContent>
          </UnderlineTabs>
        </section>
      </div>
    </div>
  );
}

function Action({ href, icon: Icon, label }: { href?: string; icon: typeof PhoneIcon; label: string }) {
  const cls = "flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition";
  if (!href)
    return (
      <span className={`${cls} cursor-not-allowed text-muted-foreground/50`} title="No phone number on file">
        <Icon size={18} /> {label}
      </span>
    );
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`${cls} hover:border-tys-blue hover:text-tys-blue`}>
      <Icon size={18} /> {label}
    </a>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-3">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Detail({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={muted ? "text-muted-foreground" : "font-medium"}>{value}</dd>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-5 py-10 text-center text-sm text-muted-foreground">{text}</p>;
}
