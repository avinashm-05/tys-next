import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfilePanels } from "./profile-panels";

export const metadata: Metadata = { title: "My profile — TYS Global Logistics" };
export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = { "super-admin": "Owner", admin: "Admin" };
const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" });

// Staff "My profile" (2026-10-05): name, password, and where they're signed
// in. Every action goes through Better Auth's own endpoints for the signed-in
// user, so nobody can change anyone else's profile from here.
export default async function ProfilePage() {
  const session = await requireAdminPage();
  const userId = BigInt(session.user.id);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [user, sessions, security, work] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true, email: true, role: true, createdAt: true } }),
    db.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, token: true, userAgent: true, ipAddress: true, createdAt: true, updatedAt: true },
    }),
    // Your own recent sign-in events, so anything that wasn't you stands out.
    db.adminAuditLog.findMany({
      where: { userId, OR: [{ action: { startsWith: "sign_in" } }, { action: { startsWith: "two_factor" } }] },
      orderBy: { id: "desc" },
      take: 8,
      select: { action: true, ip: true, createdAt: true },
    }),
    // What you did this month (from the Activity log).
    db.adminAuditLog.findMany({
      where: { userId, action: "admin.api", createdAt: { gte: monthStart }, statusCode: { lt: 400 } },
      select: { path: true },
    }),
  ]);
  const count = (re: RegExp) => work.filter((w) => w.path && re.test(w.path)).length;
  const currentToken = (session.session as { token?: string }).token;

  return (
    <ProfilePanels
      name={user?.name ?? session.user.name}
      email={user?.email ?? session.user.email}
      role={ROLE_LABELS[user?.role ?? ""] ?? "Staff"}
      since={user?.createdAt ? dateFmt.format(user.createdAt) : null}
      sessions={sessions.map((s) => ({
        id: Number(s.id),
        device: describeDevice(s.userAgent),
        ip: s.ipAddress,
        lastActive: dateFmt.format(s.updatedAt ?? s.createdAt ?? new Date()),
        current: s.token === currentToken,
      }))}
      security={security.map((e) => ({ action: e.action, ip: e.ip, at: dateFmt.format(e.createdAt) }))}
      stats={{
        quotesSent: count(/\/quotes\/\d+\/(compose|send|send-options)$/),
        followUps: count(/\/quotes\/\d+\/follow-up$/),
        notes: count(/\/quotes\/\d+\/notes$/),
        changes: work.length,
      }}
    />
  );
}

/** "Chrome on Mac" from a user-agent string; good enough for "is this me?". */
function describeDevice(ua: string | null): string {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}
