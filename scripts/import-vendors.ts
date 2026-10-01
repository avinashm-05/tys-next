/**
 * One-time bulk vendor import (2026-10-01, owner's request): loads the
 * normalized JSON parsed from VendorDetailsExcelSheet.xlsx (839 vendors,
 * their contacts and services) into the local DB via Prisma, AND writes a
 * phpMyAdmin-ready SQL file for production with the SAME data.
 *
 * Decisions (owner, 2026-10-01): use whatever contact details exist (first
 * contact's email/phone become the vendor's; placeholder email when none,
 * since vendors.email is required+unique); SSNs imported encrypted
 * (SSN_ENCRYPTION_KEY — the prod file assumes prod uses the same key, spot-
 * check after deploy); every vendor keeps the sheet's status.
 *
 * Usage: npx tsx scripts/import-vendors.ts <raw.json> <out.sql>
 */
import "./env";
import { readFileSync, writeFileSync } from "node:fs";
import { db } from "../src/lib/db";
import { encryptSsn, hashSsn } from "../src/lib/pii";

type Row = Record<string, string>;
const raw = JSON.parse(readFileSync(process.argv[2], "utf8")) as { vendors: Row[]; services: Row[]; contacts: Row[] };

const clean = (s: string | undefined) => (s ?? "").trim();
const na = (s: string) => ["", "N/A", "NA", "NONE", "-", "NULL"].includes(s.toUpperCase());
const val = (s: string | undefined) => (na(clean(s ?? "")) ? "" : clean(s ?? ""));

const DIAL: Record<string, string> = { "United States": "+1", Canada: "+1", India: "+91", "United Kingdom": "+44", "United Arab Emirates": "+971", Australia: "+61", Mexico: "+52" };
const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const firstPhone = (s: string) => {
  const p = val(s).split(/[,;/]/)[0]?.trim() ?? "";
  return p.replace(/[^0-9+()\-\s]/g, "").slice(0, 20);
};
const esc = (s: string | null) => (s === null ? "NULL" : `'${s.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`);

async function main() {
  const now = new Date();
  const nowSql = now.toISOString().slice(0, 19).replace("T", " ");
  const sql: string[] = [
    "-- TYS prod data import: vendors from VendorDetailsExcelSheet.xlsx (2026-10-01).",
    "-- Additive INSERTs only. Run AFTER the code deploy. added_by resolves to the first admin user.",
    "SET @added_by := (SELECT id FROM users WHERE role IN ('super-admin','admin') ORDER BY id LIMIT 1);",
  ];

  // Contacts grouped by vendor id, email-first so the best contact leads.
  const contactsByVendor = new Map<string, Row[]>();
  for (const c of raw.contacts) {
    const id = clean(c["Vendor ID"]);
    if (!id) continue;
    if (!contactsByVendor.has(id)) contactsByVendor.set(id, []);
    contactsByVendor.get(id)!.push(c);
  }
  for (const list of contactsByVendor.values()) list.sort((a, b) => (val(b.Email) ? 1 : 0) - (val(a.Email) ? 1 : 0));

  const servicesByVendor = new Map<string, string[]>();
  for (const s of raw.services) {
    const id = clean(s["Vendor ID"]);
    const name = val(s["Service Name"]);
    if (!id || !name) continue;
    if (!servicesByVendor.has(id)) servicesByVendor.set(id, []);
    if (!servicesByVendor.get(id)!.includes(name)) servicesByVendor.get(id)!.push(name);
  }

  const owner = await db.user.findFirst({ where: { role: { in: ["super-admin", "admin"] } }, orderBy: { id: "asc" } });
  if (!owner) throw new Error("No admin user to attribute the import to.");

  // Vendor types + services: reuse by (case-insensitive) name, create missing.
  const typeIds = new Map<string, bigint>();
  for (const t of await db.vendorType.findMany()) typeIds.set(t.name.toLowerCase(), t.id);
  const serviceIds = new Map<string, bigint>();
  for (const s of await db.service.findMany()) serviceIds.set(s.name.toLowerCase(), s.id);

  const neededTypes = new Set(raw.vendors.map((v) => title(val(v["Vendor Type"]) || "Payable")));
  for (const name of neededTypes) {
    if (!typeIds.has(name.toLowerCase())) {
      const t = await db.vendorType.create({ data: { name, status: "active", createdAt: now, updatedAt: now } });
      typeIds.set(name.toLowerCase(), t.id);
    }
    sql.push(`INSERT IGNORE INTO vendor_types (name, status, created_at, updated_at) VALUES (${esc(name)}, 'active', '${nowSql}', '${nowSql}');`);
  }
  const neededServices = new Set([...servicesByVendor.values()].flat());
  for (const name of neededServices) {
    if (!serviceIds.has(name.toLowerCase())) {
      const s = await db.service.create({ data: { name, systemName: slug(name), status: "active", createdAt: now, updatedAt: now } });
      serviceIds.set(name.toLowerCase(), s.id);
    }
    sql.push(`INSERT IGNORE INTO services (name, system_name, status, created_at, updated_at) VALUES (${esc(name)}, ${esc(slug(name))}, 'active', '${nowSql}', '${nowSql}');`);
  }

  const usedEmails = new Set((await db.vendor.findMany({ select: { email: true } })).map((v) => v.email.toLowerCase()));
  const usedEins = new Set<string>();
  const usedSsnHashes = new Set<string>();
  let created = 0, skipped = 0, contactsMade = 0, linksMade = 0, placeholders = 0, ssns = 0;

  for (const v of raw.vendors) {
    const vid = clean(v["Vendor ID"]);
    const name = val(v.Name);
    if (!name) { skipped++; continue; }
    const myContacts = contactsByVendor.get(vid) ?? [];
    const lead = myContacts[0];
    let email = (lead ? val(lead.Email) : "").toLowerCase();
    if (!email || usedEmails.has(email)) {
      email = `vendor-${vid.slice(0, 8)}@imported.tysgloballogistics.com`;
      placeholders++;
    }
    if (usedEmails.has(email)) { skipped++; continue; } // re-run: already imported
    usedEmails.add(email);

    const country = val(v.Country) || "United States";
    const phone = (lead ? firstPhone(lead["Phone Number"]) : "") || "0000000000";
    let ein: string | null = val(v["EIN Number"]) || null;
    if (ein && usedEins.has(ein)) ein = null;
    if (ein) usedEins.add(ein);
    const ssnPlain = val(v["SSN Number"]);
    let ssnEnc: string | null = null, ssnHash: string | null = null;
    if (ssnPlain) {
      const h = hashSsn(ssnPlain);
      if (!usedSsnHashes.has(h)) {
        usedSsnHashes.add(h);
        ssnEnc = encryptSsn(ssnPlain);
        ssnHash = h;
        ssns++;
      }
    }
    const typeId = typeIds.get(title(val(v["Vendor Type"]) || "Payable").toLowerCase())!;
    const status = val(v.Status).toLowerCase() === "inactive" ? "inactive" : "active";
    const data = {
      name, email, website: val(v.Website) || null, phoneNumber: phone, countryCode: DIAL[country] ?? "+1",
      einNumber: ein, ssnNumber: ssnEnc, ssnNumberHash: ssnHash,
      addressLine1: val(v["Address Line 1"]), addressLine2: val(v["Address Line 2"]) || null, addressLine3: val(v["Address Line 3"]) || null,
      city: val(v.City), state: val(v.State), country, postalCode: val(v["Zip Code"]),
      status, vendorTypeId: typeId, addedById: owner.id, createdAt: now, updatedAt: now,
    } as const;
    const vendor = await db.vendor.create({ data });
    created++;
    sql.push(
      `INSERT INTO vendors (name, email, website, phone_number, country_code, ein_number, ssn_number, ssn_number_hash, address_line_1, address_line_2, address_line_3, city, state, country, postal_code, status, vendor_type_id, added_by, created_at, updated_at) VALUES (` +
      [esc(name), esc(email), esc(data.website), esc(phone), esc(data.countryCode), esc(ein), esc(ssnEnc), esc(ssnHash), esc(data.addressLine1), esc(data.addressLine2), esc(data.addressLine3), esc(data.city), esc(data.state), esc(country), esc(data.postalCode), esc(status), `(SELECT id FROM vendor_types WHERE name=${esc(title(val(v["Vendor Type"]) || "Payable"))} LIMIT 1)`, "@added_by", `'${nowSql}'`, `'${nowSql}'`].join(", ") + ");",
    );

    // Contacts (dedupe per vendor on email; synthesize one when missing).
    const seen = new Set<string>();
    let k = 0;
    for (const c of myContacts) {
      const cname = val(c["Contact Name"]) || name;
      let cemail = val(c.Email).toLowerCase();
      if (!cemail) cemail = `contact-${vid.slice(0, 8)}-${++k}@imported.invalid`;
      if (seen.has(cemail)) continue;
      seen.add(cemail);
      const phones = val(c["Phone Number"]).split(/[,;/]/).map((p) => p.trim().replace(/[^0-9+()\-\s]/g, "").slice(0, 30)).filter(Boolean);
      await db.vendorContact.create({
        data: { vendorId: vendor.id, name: cname, email: cemail, workPhone: phones[0] || null, cellPhone: phones[1] || null, city: val(c.City) || null, state: val(c.State) || null, status: "active", createdById: owner.id, createdAt: now, updatedAt: now },
      });
      contactsMade++;
      sql.push(
        `INSERT INTO vendor_contacts (vendor_id, name, email, work_phone, cell_phone, city, state, status, created_by, created_at, updated_at) VALUES ((SELECT id FROM vendors WHERE email=${esc(email)} LIMIT 1), ${esc(cname)}, ${esc(cemail)}, ${esc(phones[0] || null)}, ${esc(phones[1] || null)}, ${esc(val(c.City) || null)}, ${esc(val(c.State) || null)}, 'active', @added_by, '${nowSql}', '${nowSql}');`,
      );
    }

    for (const svc of servicesByVendor.get(vid) ?? []) {
      await db.vendorService.create({ data: { vendorId: vendor.id, serviceId: serviceIds.get(svc.toLowerCase())!, assignedBy: owner.id, assignedAt: now, createdAt: now, updatedAt: now } });
      linksMade++;
      sql.push(
        `INSERT INTO vendor_services (vendor_id, service_id, assigned_by, assigned_at, created_at, updated_at) VALUES ((SELECT id FROM vendors WHERE email=${esc(email)} LIMIT 1), (SELECT id FROM services WHERE name=${esc(svc)} LIMIT 1), @added_by, '${nowSql}', '${nowSql}', '${nowSql}');`,
      );
    }
  }

  writeFileSync(process.argv[3], sql.join("\n") + "\n");
  console.log(JSON.stringify({ created, skipped, contactsMade, linksMade, placeholders, ssnsEncrypted: ssns, sqlLines: sql.length }));
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
