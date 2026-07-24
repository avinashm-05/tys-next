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
    accountNumber: process.env.FEDEX_ACCOUNT_NUMBER ?? "",
    baseUrl: process.env.FEDEX_BASE_URL ?? "https://apis-sandbox.fedex.com",
    locale: process.env.FEDEX_LOCALE ?? "en_US",
    pickupType: process.env.FEDEX_PICKUP_TYPE ?? "DROPOFF_AT_FEDEX_LOCATION",
    maxParcelWeightLb: Number(process.env.FEDEX_MAX_PARCEL_WEIGHT_LB ?? 150),
    tokenCacheKey: "fedex:oauth_token",
    tokenTtlBuffer: 60,
    ratesQuotesEndpoint: "rate/v1/rates/quotes",
    rateRequestTypes: ["ACCOUNT", "LIST"] as const,
  };
}

// config/fedex.php package_defaults — used for envelope/furniture/auto lines.
export const PACKAGE_DEFAULTS: Record<string, PackageDefault> = {
  envelope: { weight_lb: 1, length_in: 12, width_in: 9, height_in: 1, packaging_type: "FEDEX_ENVELOPE" },
  furniture: { weight_lb: 80, length_in: 48, width_in: 24, height_in: 24, packaging_type: "YOUR_PACKAGING" },
  auto: { weight_lb: 120, length_in: 60, width_in: 24, height_in: 18, packaging_type: "YOUR_PACKAGING" },
};
