/**
 * FedEx port self-check (mirrors the Laravel unit + property tests).
 * Run: npm run fedex:check   (needs the dev DB up — the client's token cache
 * uses the MySQL cache table; the rate-parse tests use a fake client, no net).
 */
import "./env";
import assert from "node:assert/strict";
import {
  calculateChargeableWeight,
  calculateDimensionalWeight,
} from "../src/lib/chargeable-weight";
import { FedExRateQuoteService } from "../src/lib/fedex/rate-quote";
import { FedExClient, FedExError, type FedExRequester } from "../src/lib/fedex/client";

const DIVISOR_LB = 139;
const DIVISOR_KG = 5000;
const near = (a: number, b: number, d = 0.01) => Math.abs(a - b) <= d;

// ---- chargeable weight (ported from tests/Property/Services) ---------------
function chargeableWeightChecks() {
  // Formula: dim weight = L*W*H / divisor, per unit.
  for (let i = 0; i < 200; i++) {
    const L = 1 + Math.random() * 99;
    const W = 1 + Math.random() * 99;
    const H = 1 + Math.random() * 99;
    const dims = { length: L, width: W, height: H };
    assert.ok(near(calculateDimensionalWeight(dims, "lb"), (L * W * H) / DIVISOR_LB));
    assert.ok(near(calculateDimensionalWeight(dims, "kg"), (L * W * H) / DIVISOR_KG));
    // kg divisor is larger → smaller dim weight than lb.
    assert.ok(calculateDimensionalWeight(dims, "kg") < calculateDimensionalWeight(dims, "lb"));
    // chargeable ≥ actual and ≥ dimensional, and equals the max.
    const actual = 1 + Math.random() * 999;
    const chg = calculateChargeableWeight(actual, dims, "lb");
    assert.ok(chg >= actual - 1e-9);
    assert.ok(chg >= calculateDimensionalWeight(dims, "lb") - 1e-9);
    assert.equal(chg, Math.max(actual, calculateDimensionalWeight(dims, "lb")));
  }
  // Doubling every dimension → 8× dim weight.
  const base = { length: 20, width: 30, height: 40 };
  const doubled = { length: 40, width: 60, height: 80 };
  assert.ok(
    near(calculateDimensionalWeight(doubled, "lb"), calculateDimensionalWeight(base, "lb") * 8, 0.01),
  );
  // Any zero/negative dimension ⇒ dim weight 0 ⇒ chargeable = actual.
  for (const d of [
    { length: 0, width: 5, height: 5 },
    { length: 5, width: 0, height: 5 },
    { length: 5, width: 5, height: 0 },
    { length: -3, width: 5, height: 5 },
    { length: 0, width: 0, height: 0 },
  ]) {
    assert.equal(calculateDimensionalWeight(d, "lb"), 0);
    assert.equal(calculateChargeableWeight(42.5, d, "lb"), 42.5);
  }
  // Divisor boundary: 139in³ @ lb → exactly 1 lb dim weight.
  assert.ok(near(calculateDimensionalWeight({ length: 139, width: 1, height: 1 }, "lb"), 1));
  assert.ok(near(calculateDimensionalWeight({ length: 5000, width: 1, height: 1 }, "kg"), 1));
  console.log("✓ chargeable weight");
}

// ---- rate parsing vs recorded fixtures -------------------------------------
function sampleRateResponse() {
  return {
    output: {
      rateReplyDetails: [
        {
          serviceType: "FEDEX_2_DAY",
          operationalDetail: { deliveryDate: "2026-07-03" },
          ratedShipmentDetails: [
            { rateType: "ACCOUNT", totalNetCharge: { amount: 150.29, currency: "USD" } },
            { rateType: "LIST", totalNetCharge: { amount: 223.0, currency: "USD" } },
          ],
        },
      ],
    },
  };
}

function fakeClient(response: Record<string, unknown>, capture?: (p: Record<string, unknown>) => void): FedExRequester {
  return {
    async request(_m, _e, payload) {
      capture?.(payload ?? {});
      return response;
    },
  };
}

async function rateParseChecks() {
  process.env.FEDEX_ACCOUNT_NUMBER = "123456789";

  // Fixture 1: box qty 2, 10lb, 12x10x8, weight 20, markup 0.
  let sentPayload: Record<string, unknown> = {};
  const svc = new FedExRateQuoteService(fakeClient(sampleRateResponse(), (p) => (sentPayload = p)));
  const r1 = await svc.quote(
    {
      from_zip: "75063",
      to_zip: "90210",
      is_residence: true,
      package_type: "box",
      box_details: [{ quantity: 2, weight: 10, weight_unit: "lb", length: 12, width: 10, height: 8 }],
      total_chargeable_weight: 20,
    },
    0,
  );
  assert.equal(r1.success, true);
  if (r1.success) {
    const rate = r1.rates[0];
    assert.equal(rate.service_name, "FedEx 2 Day");
    assert.equal(rate.total_charge, 150.29);
    assert.equal(rate.retail_charge, 223.0);
    assert.equal(rate.save_percent, 33);
    assert.equal(rate.estimated_delivery, "2026-07-03");
    assert.equal(rate.per_lb_rate, 7.51); // 150.29/20
    // raw == marked at 0% markup
    assert.equal(rate.raw_total_charge, 150.29);
  }
  // Payload: 2 line items (qty 2 expanded), floored dims, LB, packagingType.
  const li = (sentPayload.requestedShipment as Record<string, unknown>).requestedPackageLineItems as Record<string, unknown>[];
  assert.equal(li.length, 2);
  assert.equal((li[0].weight as Record<string, unknown>).value, 10);
  assert.equal((li[0].weight as Record<string, unknown>).units, "LB");
  assert.equal((li[0].dimensions as Record<string, unknown>).length, 12);
  assert.equal(li[0].packagingType, "YOUR_PACKAGING");
  assert.equal((sentPayload.accountNumber as Record<string, unknown>).value, "123456789");

  // Fixture: markup 10% on weight 10 → 165.32 / 245.30 / per_lb 16.53.
  const r2 = await (new FedExRateQuoteService(fakeClient(sampleRateResponse()))).quote(
    {
      from_zip: "75063",
      to_zip: "90210",
      package_type: "box",
      box_details: [{ quantity: 1, weight: 10, weight_unit: "lb", length: 10, width: 10, height: 10 }],
      total_chargeable_weight: 10,
    },
    10,
  );
  assert.ok(r2.success && r2.rates[0].total_charge === 165.32);
  assert.ok(r2.success && r2.rates[0].retail_charge === 245.3);
  assert.ok(r2.success && r2.rates[0].per_lb_rate === 16.53);
  assert.ok(r2.success && r2.rates[0].raw_total_charge === 150.29); // raw preserved

  // Envelope defaults → 1 line item, FEDEX_ENVELOPE, weight 1, length 12.
  let envPayload: Record<string, unknown> = {};
  await (new FedExRateQuoteService(fakeClient(sampleRateResponse(), (p) => (envPayload = p)))).quote(
    { from_zip: "10001", to_zip: "60601", package_type: "envelope", total_chargeable_weight: 1 },
    0,
  );
  const envLi = (envPayload.requestedShipment as Record<string, unknown>).requestedPackageLineItems as Record<string, unknown>[];
  assert.equal(envLi.length, 1);
  assert.equal(envLi[0].packagingType, "FEDEX_ENVELOPE");
  assert.equal((envLi[0].weight as Record<string, unknown>).value, 1);
  assert.equal((envLi[0].dimensions as Record<string, unknown>).length, 12);

  // Heavy split: 200lb → two line items 150 + 50.
  let heavyPayload: Record<string, unknown> = {};
  await (new FedExRateQuoteService(fakeClient(sampleRateResponse(), (p) => (heavyPayload = p)))).quote(
    {
      from_zip: "10001",
      to_zip: "60601",
      package_type: "box",
      box_details: [{ quantity: 1, weight: 200, weight_unit: "lb", length: 20, width: 20, height: 20 }],
      total_chargeable_weight: 200,
    },
    0,
  );
  const heavyLi = (heavyPayload.requestedShipment as Record<string, unknown>).requestedPackageLineItems as Record<string, unknown>[];
  assert.equal(heavyLi.length, 2);
  assert.equal((heavyLi[0].weight as Record<string, unknown>).value, 150);
  assert.equal((heavyLi[1].weight as Record<string, unknown>).value, 50);

  // kg → lb: 10kg → 22.05 lb.
  let kgPayload: Record<string, unknown> = {};
  await (new FedExRateQuoteService(fakeClient(sampleRateResponse(), (p) => (kgPayload = p)))).quote(
    {
      from_zip: "10001",
      to_zip: "60601",
      package_type: "box",
      box_details: [{ quantity: 1, weight: 10, weight_unit: "kg", length: 20, width: 20, height: 20 }],
      total_chargeable_weight: 22.05,
    },
    0,
  );
  const kgLi = (kgPayload.requestedShipment as Record<string, unknown>).requestedPackageLineItems as Record<string, unknown>[];
  assert.equal((kgLi[0].weight as Record<string, unknown>).value, 22.05);

  // Soft failures.
  const errClient: FedExRequester = {
    async request() {
      throw new FedExError("FedEx API request failed", 422, {
        errors: [{ message: "Invalid postal code." }],
      });
    },
  };
  const rErr = await new FedExRateQuoteService(errClient).quote(
    { from_zip: "1", to_zip: "2", package_type: "envelope", total_chargeable_weight: 1 },
    0,
  );
  assert.ok(!rErr.success && rErr.message === "Invalid postal code.");

  const rNone = await new FedExRateQuoteService(fakeClient({ output: { rateReplyDetails: [] } })).quote(
    { from_zip: "1", to_zip: "2", package_type: "envelope", total_chargeable_weight: 1 },
    0,
  );
  assert.ok(!rNone.success && rNone.message === "No FedEx rates were returned for this shipment.");

  process.env.FEDEX_ACCOUNT_NUMBER = "";
  const rNoAcct = await new FedExRateQuoteService(fakeClient(sampleRateResponse())).quote(
    { from_zip: "1", to_zip: "2", package_type: "envelope", total_chargeable_weight: 1 },
    0,
  );
  assert.ok(!rNoAcct.success && rNoAcct.message === "FedEx account number is not configured.");
  process.env.FEDEX_ACCOUNT_NUMBER = "123456789";
  console.log("✓ rate parsing matches recorded fixtures (exact numbers)");
}

// ---- client 401-retry-once (stubbed fetch, real cache) ---------------------
async function clientRetryChecks() {
  const realFetch = globalThis.fetch;
  const oauthResp = () =>
    new Response(JSON.stringify({ access_token: `tok-${Math.random()}`, expires_in: 3600 }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  // Case A: rate returns 401 once, then 200 → exactly one retry, succeeds.
  {
    let oauth = 0;
    let rate = 0;
    globalThis.fetch = (async (url: string | URL) => {
      const u = String(url);
      if (u.includes("/oauth/token")) {
        oauth++;
        return oauthResp();
      }
      rate++;
      if (rate === 1) return new Response(JSON.stringify({ errors: [] }), { status: 401 });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const client = new FedExClient();
    await client.clearToken();
    const body = await client.request("POST", "rate/v1/rates/quotes", { x: 1 });
    assert.deepEqual(body, { ok: true });
    assert.equal(rate, 2, "rate endpoint hit exactly twice (one retry)");
    assert.equal(oauth, 2, "token fetched twice (initial + refresh)");
  }

  // Case B: persistent 401 → throws FedExError with the status.
  {
    globalThis.fetch = (async (url: string | URL) => {
      if (String(url).includes("/oauth/token")) return oauthResp();
      return new Response(JSON.stringify({ errors: [{ code: "NOT.AUTHORIZED.ERROR" }] }), {
        status: 401,
      });
    }) as typeof fetch;
    const client = new FedExClient();
    await client.clearToken();
    let threw: unknown = null;
    try {
      await client.request("POST", "rate/v1/rates/quotes", {});
    } catch (e) {
      threw = e;
    }
    assert.ok(threw instanceof FedExError && threw.httpStatus === 401, "persistent 401 → FedExError");
  }

  globalThis.fetch = realFetch;
  console.log("✓ client 401-retry-once (fresh token, then succeed / throw)");
}

async function main() {
  chargeableWeightChecks();
  await rateParseChecks();
  await clientRetryChecks();
  console.log("\nfedex-check: ALL CHECKS PASSED");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => import("../src/lib/db").then((m) => m.db.$disconnect()));
