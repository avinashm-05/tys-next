/**
 * Local-dev-only seed: populates the real `shipments` table with sample rows
 * so the admin Shipments list (and a dummy customer's /account/shipments)
 * has something to look at while testing — the list itself reads real data
 * (see plan), it just has zero rows on a fresh local DB otherwise.
 *
 * Usage: npx tsx scripts/seed-dummy-shipments.ts
 */
import "./env";
import { db } from "../src/lib/db";

const SENDER_NAMES = ["Carlos Mendez", "Priya Nair", "Owen Baxter", "Julia Kowalski", "Devon Ellis"];
const RECEIVER_NAMES = ["Amara Chen", "Felix Torres", "Ingrid Larsen", "Noah Bergström", "Riya Kapoor"];
const PLACES: { city: string; state: string; country: string }[] = [
  { city: "Dallas", state: "TX", country: "US" },
  { city: "Atlanta", state: "GA", country: "US" },
  { city: "Newark", state: "NJ", country: "US" },
  { city: "Toronto", state: "ON", country: "CA" },
  { city: "Miami", state: "FL", country: "US" },
];
const TYPES = ["air", "ground", "ocean"] as const;
const STATUSES = [
  "new_request",
  "ready_for_pickup",
  "in_transit",
  "delivered",
  "on_hold",
  "cancelled",
] as const;

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  const now = new Date();
  const dummyUser = await db.user.findUnique({ where: { email: "dummy.customer@example.com" } });

  const rows = Array.from({ length: 12 }, (_, i) => {
    const from = pick(PLACES, i);
    const to = pick(PLACES, i + 2);
    const daysAgo = i * 2;
    return {
      // First 4 rows belong to the dummy customer (visible on their
      // /account/shipments); the rest simulate admin-managed/no-account rows.
      userId: i < 4 ? dummyUser?.id : null,
      trackingNumber: `TYS${100000 + i}`,
      shipmentType: pick(TYPES, i),
      fromCountry: from.country,
      toCountry: to.country,
      status: pick(STATUSES, i),
      senderContactName: pick(SENDER_NAMES, i),
      senderAddressLine1: "123 Main St",
      senderCity: from.city,
      senderState: from.state,
      senderCountry: from.country,
      senderPostalCode: "75234",
      senderPhone1: "+1 214 555 0100",
      recipientContactName: pick(RECEIVER_NAMES, i),
      recipientAddressLine1: "456 Market St",
      recipientCity: to.city,
      recipientState: to.state,
      recipientCountry: to.country,
      recipientPostalCode: "07112",
      recipientPhone1: "+1 973 555 0100",
      recipientLocationType: i % 2 === 0 ? ("residential" as const) : ("commercial" as const),
      createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      updatedAt: now,
    };
  });

  for (const data of rows) {
    await db.shipment.create({ data });
  }

  console.log(`Seeded ${rows.length} dummy shipments (${rows.filter((r) => r.userId).length} linked to dummy.customer@example.com).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
