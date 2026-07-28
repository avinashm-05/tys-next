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
    accountNumber: process.env.FEDEX_ACCOUNT_NUMBER ?? "",
    baseUrl: process.env.FEDEX_BASE_URL ?? "https://apis-sandbox.fedex.com",
    locale: process.env.FEDEX_LOCALE ?? "en_US",
    pickupType: process.env.FEDEX_PICKUP_TYPE ?? "DROPOFF_AT_FEDEX_LOCATION",
    maxParcelWeightLb: Number(process.env.FEDEX_MAX_PARCEL_WEIGHT_LB ?? 150),
    tokenCacheKey: "fedex:oauth_token",
    rateTokenCacheKey: "fedex:rate_oauth_token",
    trackTokenCacheKey: "fedex:track_oauth_token",
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

// config/fedex.php package_defaults — used for envelope/furniture/auto lines.
export const PACKAGE_DEFAULTS: Record<string, PackageDefault> = {
  envelope: { weight_lb: 1, length_in: 12, width_in: 9, height_in: 1, packaging_type: "FEDEX_ENVELOPE" },
  furniture: { weight_lb: 80, length_in: 48, width_in: 24, height_in: 24, packaging_type: "YOUR_PACKAGING" },
  auto: { weight_lb: 120, length_in: 60, width_in: 24, height_in: 18, packaging_type: "YOUR_PACKAGING" },
};
