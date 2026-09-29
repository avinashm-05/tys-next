// A JS expression, for inlining into tracking snippets, that is true only on
// a real (non-local) host. Every analytics/ads tag is wrapped in it, so none
// of them fire on localhost, 127.0.0.1 or *.localhost / *.test / *.local,
// even if the tracking IDs are set in a local .env or a production build is
// run locally. Dev traffic was polluting the live Clarity / GA4 / Ads data
// (user's request, 2026-09-29).
export const NOT_LOCAL_HOST =
  "!/^(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0|\\[::1\\])$|\\.(localhost|test|local)$/.test(location.hostname)";
