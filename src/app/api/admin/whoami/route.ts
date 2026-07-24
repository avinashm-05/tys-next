import { adminRoute } from "@/lib/auth";

// Smallest admin endpoint — exercises the adminRoute guard end to end and
// feeds the A1 admin shell (current user for the sidebar header).
export const GET = adminRoute(async (_req, _ctx, session) => {
  const { id, name, email } = session.user;
  const role = (session.user as { role?: string | null }).role ?? null;
  return Response.json({ user: { id, name, email, role } });
});
