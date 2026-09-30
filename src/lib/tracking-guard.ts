// A JS expression, for inlining into tracking snippets, that is true only on
// a real (non-local) host. Every analytics/ads tag is wrapped in it, so none
// of them fire on localhost, 127.0.0.1 or *.localhost / *.test / *.local,
// even if the tracking IDs are set in a local .env or a production build is
// run locally. Dev traffic was polluting the live Clarity / GA4 / Ads data
// (user's request, 2026-09-29).
export const NOT_LOCAL_HOST =
  "!/^(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0|\\[::1\\])$|\\.(localhost|test|local)$/.test(location.hostname)";

// Paths where NO analytics may run (2026-09-30 privacy audit): staff pages,
// sign-in/password pages (reset links carry a one-time token in the URL) and
// the customer account area (shows addresses, phones, shipments). GTM's own
// guard in app/layout.tsx uses the same list; keep the two in sync.
export const NO_TRACKING_PATH = /^\/(admin|login|forgot-password|reset-password|account)(\/|$)/;
