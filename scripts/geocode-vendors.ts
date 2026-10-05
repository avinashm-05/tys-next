/**
 * Fill in map coordinates for vendors that have none (2026-10-05: the 839
 * bulk-imported vendors came in without them, so the vendor map showed 2).
 *
 *   npx tsx --tsconfig tsconfig.json scripts/geocode-vendors.ts            # local DB
 *   npx tsx --tsconfig tsconfig.json scripts/geocode-vendors.ts --sql out.sql
 *
 * US vendors with a ZIP use the bundled ZIP table (instant, no network): the
 * ZIP centre is a few miles from the street address at most, which is what
 * the map's "within N miles" search needs. Everyone else goes through the
 * same Nominatim geocoder the vendor form uses, one request per second.
 * --sql also writes UPDATE statements (keyed on the unique vendor email) to
 * run on production after the vendor import.
 */
import { writeFileSync } from "node:fs";
import zipcodes from "zipcodes";
import { db } from "@/lib/db";
import { fullAddress, geocodeAddress } from "@/lib/geocoding";

const US = /^(us|usa|united states( of america)?)$/i;
const ZIP = /^\d{5}(-\d{4})?$/;

const sqlOut = process.argv.includes("--sql") ? process.argv[process.argv.indexOf("--sql") + 1] : null;

async function main() {
  const vendors = await db.vendor.findMany({ where: { latitude: null } });
  console.log(`${vendors.length} vendors without coordinates`);
  const sql: string[] = [];
  let zip = 0, online = 0, missed = 0;

  for (const v of vendors) {
    let coords: { latitude: number; longitude: number } | null = null;
    if (US.test(v.country.trim()) && ZIP.test(v.postalCode.trim())) {
      const hit = zipcodes.lookup(v.postalCode.trim().slice(0, 5));
      if (hit) {
        coords = { latitude: hit.latitude, longitude: hit.longitude };
        zip++;
      }
    }
    if (!coords) {
      coords = await geocodeAddress(fullAddress(v));
      await new Promise((r) => setTimeout(r, 1100)); // Nominatim: max 1 request/second
      if (coords) online++;
    }
    if (!coords) {
      missed++;
      console.log(`  no match: #${v.id} ${v.name} (${v.city}, ${v.country})`);
      continue;
    }
    await db.vendor.update({
      where: { id: v.id },
      data: { latitude: coords.latitude, longitude: coords.longitude, geocodedAt: new Date() },
    });
    sql.push(
      `UPDATE vendors SET latitude = ${coords.latitude.toFixed(7)}, longitude = ${coords.longitude.toFixed(7)}, geocoded_at = NOW() WHERE email = '${v.email.replace(/'/g, "''")}' AND latitude IS NULL;`,
    );
  }

  console.log(`done: ${zip} by ZIP, ${online} by address lookup, ${missed} not found`);
  if (sqlOut) {
    writeFileSync(sqlOut, `-- Vendor map coordinates (generated ${new Date().toISOString()}). Run AFTER step4_import_vendors.sql.\n${sql.join("\n")}\n`);
    console.log(`wrote ${sql.length} statements to ${sqlOut}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
