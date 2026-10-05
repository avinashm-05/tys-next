import Link from "next/link";
import { db } from "@/lib/db";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { quoteRef } from "@/lib/quote-ref";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COUNTRY = new Map(COUNTRY_LIST.map(([code, name]) => [code, name]));
const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/New_York",
});

// Incomplete quotes (was the separate "Started quotes" page, merged into
// Quotes 2026-10-05): people who filled in the quote form's first step
// (name, email, phone) but may never have submitted. Saved by POST
// /api/quote-leads. Default hides the ones that went on to submit, since
// those are already regular quotes; "Show submitted too" lists everything.
// Read-only on purpose: it's a call list, not an editor.
export async function IncompleteQuotes({ all }: { all: boolean }) {
  const leads = await db.quoteLead.findMany({
    where: all ? {} : { convertedAt: null },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          People who gave their contact details on the quote form but didn&rsquo;t finish it. Call or email them to
          help complete the quote.
        </p>
        <Link
          href={all ? "/admin/quotes?view=incomplete" : "/admin/quotes?view=incomplete&show=all"}
          className="text-sm font-medium text-tys-blue hover:underline"
        >
          {all ? "Hide submitted" : "Show submitted too"}
        </Link>
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
                      <Badge variant="secondary">Submitted, quote #{quoteRef(l.quoteId)}</Badge>
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
