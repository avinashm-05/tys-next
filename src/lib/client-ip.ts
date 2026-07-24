/**
 * THE client-IP extraction for rate-limit bucketing — shared by every public
 * limiter (quote endpoints, auth sign-up/sign-in/verification/reset). One
 * implementation so a spoofing fix lands everywhere at once.
 *
 * X-Forwarded-For is a comma list a client can PREPEND to, so the LEFTMOST hop
 * is attacker-controlled and must never be trusted — spoofing it would hand out
 * a fresh bucket per request and defeat the limit entirely. We count
 * TRUSTED_PROXY_HOPS entries from the RIGHT (those are appended by our own
 * infrastructure) and take the client IP at that position.
 *
 * ⚠️ CUTOVER (launch-gating): TRUSTED_PROXY_HOPS is environment-specific.
 * Before going public, log the raw X-Forwarded-For from a real external
 * request on the target host, read the proxy chain, and set the env var so
 * this lands on the actual client hop (default 1 = a single trusted proxy
 * directly in front of the app). Until that's verified, every public rate
 * limit is only as trustworthy as this number.
 */
export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS ?? 1) || 1);
    const ip = parts[parts.length - hops]; // count from the right (our proxy end)
    if (ip) return ip;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
