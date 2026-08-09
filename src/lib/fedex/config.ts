// Mirror of config/fedex.php, read from env (sandbox by default). Secrets are
// never hardcoded — only read from process.env.
export type PackageDefault = {
  weight_lb: number;
  length_in: number;
  width_in: number;
  height_in: number;
  packaging_type: string;
};

export function fedexConfig() {
  return {
    clientId: process.env.FEDEX_CLIENT_ID ?? "",
    clientSecret: process.env.FEDEX_CLIENT_SECRET ?? "",
    // FedEx issues separate credentials PER PROJECT, and each project is its
    // own sandbox-vs-production cutover — Rate and Track each have their own
    // dedicated project (confirmed: the original project was never entitled
    // for Track at all, FORBIDDEN.ERROR reproduced outside the app), so each
    // gets its own client id/secret/base URL, falling back to the original
    // pair (sandbox) only if its own env vars are unset.
    rateClientId: process.env.FEDEX_RATE_CLIENT_ID || process.env.FEDEX_CLIENT_ID || "",
    rateClientSecret: process.env.FEDEX_RATE_CLIENT_SECRET || process.env.FEDEX_CLIENT_SECRET || "",
    rateBaseUrl: process.env.FEDEX_RATE_BASE_URL || process.env.FEDEX_BASE_URL || "https://apis-sandbox.fedex.com",
    trackClientId: process.env.FEDEX_TRACK_CLIENT_ID || process.env.FEDEX_CLIENT_ID || "",
    trackClientSecret: process.env.FEDEX_TRACK_CLIENT_SECRET || process.env.FEDEX_CLIENT_SECRET || "",
    trackBaseUrl: process.env.FEDEX_TRACK_BASE_URL || process.env.FEDEX_BASE_URL || "https://apis-sandbox.fedex.com",
    // Ship (label generation) is its own FedEx project again, and it is the
    // one API here that MOVES REAL FREIGHT — a call against a production
    // project books a real shipment and bills the account. So unlike Rate
    // and Track, this deliberately does NOT fall back to the shared
    // FEDEX_CLIENT_ID/SECRET pair: if the Ship-specific vars are unset the
    // credentials stay empty and generateLabel() refuses to run, rather than
    // quietly borrowing whatever project happens to be configured.
    shipClientId: process.env.FEDEX_SHIP_CLIENT_ID ?? "",
    shipClientSecret: process.env.FEDEX_SHIP_CLIENT_SECRET ?? "",
    shipBaseUrl: process.env.FEDEX_SHIP_BASE_URL || "https://apis-sandbox.fedex.com",
    shipAccountNumber: process.env.FEDEX_SHIP_ACCOUNT_NUMBER || process.env.FEDEX_ACCOUNT_NUMBER || "",
    // STOCK_4X6 PDF: the standard shipping-label size, prints on a thermal
    // label printer and on plain paper alike. Overridable without a deploy.
    shipLabelStockType: process.env.FEDEX_SHIP_LABEL_STOCK_TYPE || "PAPER_4X6",
    shipLabelImageType: process.env.FEDEX_SHIP_LABEL_IMAGE_TYPE || "PDF",
    accountNumber: process.env.FEDEX_ACCOUNT_NUMBER ?? "",
    baseUrl: process.env.FEDEX_BASE_URL ?? "https://apis-sandbox.fedex.com",
    locale: process.env.FEDEX_LOCALE ?? "en_US",
    pickupType: process.env.FEDEX_PICKUP_TYPE ?? "DROPOFF_AT_FEDEX_LOCATION",
    maxParcelWeightLb: Number(process.env.FEDEX_MAX_PARCEL_WEIGHT_LB ?? 150),
    tokenCacheKey: "fedex:oauth_token",
    rateTokenCacheKey: "fedex:rate_oauth_token",
    trackTokenCacheKey: "fedex:track_oauth_token",
    shipTokenCacheKey: "fedex:ship_oauth_token",
    shipEndpoint: "ship/v1/shipments",
    tokenTtlBuffer: 60,
    ratesQuotesEndpoint: "rate/v1/rates/quotes",
    rateRequestTypes: ["ACCOUNT", "LIST"] as const,
    trackEndpoint: "track/v1/trackingnumbers",
  };
}

// Config-only helpers building the credential override object each
// FedExClient(...) call site needs — one place to get the field names right
// instead of repeating the same 4-key object at every Rate/Track call site.
export function rateCredentials() {
  const cfg = fedexConfig();
  return {
    clientId: cfg.rateClientId,
    clientSecret: cfg.rateClientSecret,
    tokenCacheKey: cfg.rateTokenCacheKey,
    baseUrl: cfg.rateBaseUrl,
  };
}

export function trackCredentials() {
  const cfg = fedexConfig();
  return {
    clientId: cfg.trackClientId,
    clientSecret: cfg.trackClientSecret,
    tokenCacheKey: cfg.trackTokenCacheKey,
    baseUrl: cfg.trackBaseUrl,
  };
}

export function shipCredentials() {
  const cfg = fedexConfig();
  return {
    clientId: cfg.shipClientId,
    clientSecret: cfg.shipClientSecret,
    tokenCacheKey: cfg.shipTokenCacheKey,
    baseUrl: cfg.shipBaseUrl,
  };
}

/** True once a Ship project's own credentials are configured (see above —
 * there is intentionally no fallback to the shared pair). */
export function shipConfigured(): boolean {
  const cfg = fedexConfig();
  return Boolean(cfg.shipClientId && cfg.shipClientSecret && cfg.shipAccountNumber);
}

// config/fedex.php package_defaults — used for envelope/furniture/auto lines.
export const PACKAGE_DEFAULTS: Record<string, PackageDefault> = {
  envelope: { weight_lb: 1, length_in: 12, width_in: 9, height_in: 1, packaging_type: "FEDEX_ENVELOPE" },
  furniture: { weight_lb: 80, length_in: 48, width_in: 24, height_in: 24, packaging_type: "YOUR_PACKAGING" },
  auto: { weight_lb: 120, length_in: 60, width_in: 24, height_in: 18, packaging_type: "YOUR_PACKAGING" },
  packers_movers: { weight_lb: 200, length_in: 60, width_in: 40, height_in: 40, packaging_type: "YOUR_PACKAGING" },
};
