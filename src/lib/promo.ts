// localStorage key remembering that this browser closed the promo bar. Shared
// by the bar itself (site-header.tsx, a client component) and the inline
// pre-paint script in the public layout (a server component), so it lives in
// a plain module both can import.
export const PROMO_KEY = "tys-promo-first-shipment-dismissed";
