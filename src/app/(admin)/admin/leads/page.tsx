import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Started Quotes | TYS Global Logistics" };
export const dynamic = "force-dynamic";

const COUNTRY = new Map(COUNTRY_LIST.map(([code, name]) => [code, name]));
const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/New_York",
});

// Started quotes (2026-09-29): people who filled in the /quotes wizard's
// first step (name, email, phone) but may never have submitted. Saved by
// POST /api/quote-leads. Default view hides the ones that went on to
// submit, since those are already in Quotes; "All" shows everything.
// Server-rendered and read-only on purpose: it's a call list, not an editor.
export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireAdminPage();
  const { show } = await searchParams;
  const all = show === "all";

  const leads = await db.quoteLead.findMany({
    where: all ? {} : { convertedAt: null },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Started quotes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            People who gave their contact details on the quote form. {all ? "Showing everyone." : "Showing only those who didn't submit."}
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border p-1 text-sm">
          <Link
            href="/admin/leads"
            className={`rounded-lg px-3 py-1.5 ${all ? "text-muted-foreground hover:bg-muted" : "bg-primary text-primary-foreground"}`}
          >
            Didn&rsquo;t submit
          </Link>
          <Link
            href="/admin/leads?show=all"
            className={`rounded-lg px-3 py-1.5 ${all ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            All
          </Link>
        </div>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Started (ET)</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Nothing here yet.
                </TableCell>
              </TableRow>
            )}
            {leads.map((l) => (
              <TableRow key={String(l.id)}>
                <TableCell className="whitespace-nowrap">{l.createdAt ? dateFmt.format(l.createdAt) : "N/A"}</TableCell>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell>
                  <a href={`mailto:${l.email}`} className="hover:underline">
                    {l.email}
                  </a>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <a href={`tel:${l.countryCode}${l.phone.replace(/[^0-9]/g, "")}`} className="hover:underline">
                    {l.countryCode} {l.phone}
                  </a>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {l.fromCountry || l.toCountry
                    ? `${COUNTRY.get(l.fromCountry ?? "") ?? l.fromCountry ?? "?"} to ${COUNTRY.get(l.toCountry ?? "") ?? l.toCountry ?? "?"}`
                    : "Not chosen yet"}
                </TableCell>
                <TableCell>
                  {l.convertedAt && l.quoteId ? (
                    <Link href={`/admin/quotes/${l.quoteId}`}>
                      <Badge variant="secondary">Submitted, quote #{String(l.quoteId)}</Badge>
                    </Link>
                  ) : l.convertedAt ? (
                    // Submitted, but not linked: the quote's email didn't
                    // match this lead (see quote-leads/convert).
                    <Badge variant="secondary">Submitted</Badge>
                  ) : (
                    <Badge variant="outline">Didn&rsquo;t submit</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
