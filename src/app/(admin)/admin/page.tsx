import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalculatorIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  HourglassMediumIcon,
  PackageIcon,
  PlusIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { countryName } from "@/lib/countries";
import { formatPackageTypes } from "@/lib/package-type";
import { quoteRef } from "@/lib/quote-ref";
import { EMAIL_NOTE_PREFIX } from "@/lib/quote-email";

export const metadata: Metadata = { title: "Dashboard — TYS Global Logistics" };
export const dynamic = "force-dynamic";

const TZ = "America/New_York";
const DAY = 24 * 60 * 60 * 1000;

/** Midnight today in New York, as a real instant. */
function etMidnight(now: Date): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const sinceMidnight = (Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second)) * 1000;
  return new Date(now.getTime() - sinceMidnight - now.getMilliseconds());
}

const etDayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

function ago(d: Date | null | undefined, now: Date): string {
  if (!d) return "";
  const m = Math.round((now.getTime() - d.getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return days < 30 ? `${days}d ago` : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: TZ }).format(d);
}

function greeting(now: Date) {
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(now));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

const route = (from: string, to: string) =>
  !from && !to ? "Route not set" : from === to ? `Within ${countryName(from)}` : `${countryName(from) || "?"} → ${countryName(to) || "?"}`;

// Live dashboard (2026-10-05): what needs doing today, at a glance. All
// counts are plain indexed COUNTs; times are New York (where TYS works).
export default async function AdminDashboardPage() {
  const session = await requireAdminPage();
  const firstName = session.user.name?.split(" ")[0];
  const now = new Date();
  const today = etMidnight(now);
  const fourteenDaysAgo = new Date(today.getTime() - 13 * DAY);

  const [
    needsPrice,
    waiting,
    newBookings,
    inTransit,
    quotesToday,
    incompleteWeek,
    recentQuotes,
    pendingQuotes,
    bookingRows,
    emailNotes,
  ] = await Promise.all([
    db.quote.count({ where: { status: "pending" } }),
    db.quote.count({ where: { status: "quoted" } }),
    db.shipment.count({ where: { status: "new_request" } }),
    db.shipment.count({ where: { status: "in_transit" } }),
    db.quote.count({ where: { createdAt: { gte: today } } }),
    db.quoteLead.count({ where: { convertedAt: null, createdAt: { gte: new Date(now.getTime() - 7 * DAY) } } }),
    db.quote.findMany({ where: { createdAt: { gte: fourteenDaysAgo } }, select: { createdAt: true } }),
    db.quote.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, fromCountry: true, toCountry: true, packageType: true, createdAt: true },
    }),
    db.shipment.findMany({
      where: { status: "new_request" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, senderContactName: true, fromCountry: true, toCountry: true, recipientCity: true, createdAt: true },
    }),
    db.quoteNote.findMany({
      where: { comment: { startsWith: EMAIL_NOTE_PREFIX } },
      orderBy: { id: "desc" },
      take: 6,
      select: { id: true, quoteId: true, comment: true, createdAt: true, createdBy: { select: { name: true } } },
    }),
  ]);

  // Quote requests per day, last 14 days (New York days).
  const perDay = new Map<string, number>();
  for (let i = 0; i < 14; i++) perDay.set(etDayKey(new Date(fourteenDaysAgo.getTime() + i * DAY + 12 * 3600 * 1000)), 0);
  for (const q of recentQuotes) {
    if (!q.createdAt) continue;
    const k = etDayKey(q.createdAt);
    if (perDay.has(k)) perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }
  const days = [...perDay.entries()];
  const max = Math.max(1, ...days.map(([, n]) => n));
  const total14 = days.reduce((s, [, n]) => s + n, 0);

  const kpis = [
    { label: "Need a price", value: needsPrice, hint: "New quote requests", href: "/admin/quotes", icon: FileTextIcon, tone: "bg-amber-50 text-amber-700" },
    { label: "Waiting on customer", value: waiting, hint: "Quoted, not booked yet", href: "/admin/quotes", icon: HourglassMediumIcon, tone: "bg-blue-50 text-tys-blue" },
    { label: "New bookings", value: newBookings, hint: "Booked online, to confirm", href: "/admin/shipments", icon: PackageIcon, tone: "bg-emerald-50 text-emerald-700" },
    { label: "In transit", value: inTransit, hint: "On the way", href: "/admin/shipments", icon: TruckIcon, tone: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting + quick actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: TZ }).format(now)}
          </p>
          <h1 className="text-h2">
            {greeting(now)}
            {firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/price-check" className="inline-flex h-10 items-center gap-2 rounded-xl border bg-background px-4 text-sm font-medium hover:bg-muted">
            <CalculatorIcon size={16} /> Get rates
          </Link>
          <Link href="/admin/quotes/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-tys-blue px-4 text-sm font-semibold text-white hover:bg-tys-blue/90">
            <PlusIcon size={16} weight="bold" /> New quote
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="group flex flex-col gap-3 rounded-2xl border bg-background p-5 transition hover:border-tys-blue/40 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{k.label}</span>
              <span className={`flex size-8 items-center justify-center rounded-lg ${k.tone}`}>
                <k.icon size={17} weight="bold" />
              </span>
            </div>
            <span className="text-[34px] font-semibold leading-none tracking-tight tabular-nums">{k.value}</span>
            <span className="flex items-center justify-between text-xs text-muted-foreground">
              {k.hint}
              <ArrowRightIcon size={13} className="opacity-0 transition group-hover:opacity-100" />
            </span>
          </Link>
        ))}
      </div>

      {/* Trend */}
      <section className="rounded-2xl border bg-background p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Quote requests, last 14 days</h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{quotesToday}</span> today ·{" "}
            <span className="font-semibold text-foreground tabular-nums">{total14}</span> in 14 days ·{" "}
            <Link href="/admin/quotes?view=incomplete" className="hover:underline">
              <span className="font-semibold text-foreground tabular-nums">{incompleteWeek}</span> left unfinished this week
            </Link>
          </p>
        </div>
        <div className="mt-5 flex h-36 items-end gap-1.5" role="img" aria-label={`Quote requests per day over the last 14 days, ${total14} in total`}>
          {days.map(([day, n], i) => (
            <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${day}: ${n} quote${n === 1 ? "" : "s"}`}>
              {n > 0 && <span className="text-[11px] tabular-nums text-muted-foreground">{n}</span>}
              <div
                className={`w-full rounded-md ${i === days.length - 1 ? "bg-tys-blue" : "bg-tys-blue/25"}`}
                style={{ height: `${Math.max(n ? 8 : 3, (n / max) * 100)}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{Number(day.slice(8))}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Work queues */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Need a price" href="/admin/quotes" empty="No quote requests waiting. Nice.">
          {pendingQuotes.map((q) => (
            <Row
              key={String(q.id)}
              href={`/admin/quotes/${q.id}`}
              title={q.name || "No name"}
              meta={`#${quoteRef(q.id)} · ${formatPackageTypes(q.packageType)} · ${route(q.fromCountry, q.toCountry)}`}
              right={ago(q.createdAt, now)}
            />
          ))}
        </Panel>
        <Panel title="New bookings" href="/admin/shipments" empty="No new online bookings.">
          {bookingRows.map((s) => (
            <Row
              key={String(s.id)}
              href={`/admin/shipments/${s.id}`}
              title={s.senderContactName || "No name"}
              meta={`Booking #${s.id} · ${route(s.fromCountry, s.toCountry)}${s.recipientCity ? ` · to ${s.recipientCity}` : ""}`}
              right={ago(s.createdAt, now)}
            />
          ))}
        </Panel>
      </div>

      <Panel title="Recent emails to customers" empty="No quote emails sent yet.">
        {emailNotes.map((n) => {
          const m = n.comment.match(/^Email sent: (.+?) to (\S+)\./);
          return (
            <Row
              key={String(n.id)}
              href={`/admin/quotes/${n.quoteId}`}
              icon
              title={m ? `${m[1]} to ${m[2]}` : n.comment.replace(EMAIL_NOTE_PREFIX, "").trim()}
              meta={`Quote #${quoteRef(n.quoteId)}${n.createdBy?.name ? ` · by ${n.createdBy.name}` : " · automatic"}`}
              right={ago(n.createdAt, now)}
            />
          );
        })}
      </Panel>
    </div>
  );
}

function Panel({ title, href, empty, children }: { title: string; href?: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section className="flex flex-col rounded-2xl border bg-background">
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {href && (
          <Link href={href} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            View all <ArrowRightIcon size={12} />
          </Link>
        )}
      </div>
      {children.length ? <ul className="divide-y">{children}</ul> : <p className="px-5 py-8 text-center text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}

function Row({ href, title, meta, right, icon }: { href: string; title: string; meta: string; right: string; icon?: boolean }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 px-5 py-3 transition hover:bg-muted/50">
        {icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <EnvelopeSimpleIcon size={15} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">{meta}</span>
        </span>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{right}</span>
      </Link>
    </li>
  );
}
