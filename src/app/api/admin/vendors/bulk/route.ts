import Papa from "papaparse";
import { z } from "zod";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { validationError } from "@/lib/validation/errors";

// Vendor bulk actions (2026-10-05) for the ticked rows on the Vendors list:
// export them to a spreadsheet, or mark them active / inactive. Every call
// lands in the Activity log through adminRoute.
const input = z.object({
  action: z.enum(["export", "activate", "deactivate"]),
  ids: z.array(z.number().int().positive()).min(1, "Tick at least one vendor.").max(1000),
});

export const POST = adminRoute(async (req) => {
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return validationError({ _: [parsed.error.issues[0]?.message ?? "Invalid request."] });
  const { action, ids } = parsed.data;
  const where = { id: { in: ids.map((n) => BigInt(n)) } };

  if (action !== "export") {
    const { count } = await db.vendor.updateMany({
      where,
      data: { status: action === "activate" ? "active" : "inactive", updatedAt: new Date() },
    });
    return Response.json({ success: true, updated: count });
  }

  const vendors = await db.vendor.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      name: true,
      email: true,
      phoneNumber: true,
      countryCode: true,
      website: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      status: true,
      createdAt: true,
      vendorType: { select: { name: true } },
      vendorServices: { select: { service: { select: { name: true } } } },
    },
  });

  // No EIN/SSN in exports: spreadsheets get emailed and copied around.
  const csv = Papa.unparse(
    vendors.map((v) => ({
      Name: v.name,
      Type: v.vendorType.name,
      Services: v.vendorServices.map((s) => s.service.name).join(", "),
      Email: v.email,
      Phone: [v.countryCode, v.phoneNumber].filter(Boolean).join(" "),
      Website: v.website ?? "",
      Address: [v.addressLine1, v.addressLine2].filter(Boolean).join(", "),
      City: v.city,
      State: v.state,
      "ZIP / Postal code": v.postalCode,
      Country: v.country,
      Status: v.status === "active" ? "Active" : "Inactive",
      Added: v.createdAt ? v.createdAt.toISOString().slice(0, 10) : "",
    })),
  );

  const stamp = new Date().toISOString().slice(0, 10);
  // BOM so Excel opens accents/₹ correctly.
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="TYS_vendors_${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
