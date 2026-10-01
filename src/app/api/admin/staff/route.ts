import { z } from "zod";
import { adminRoute } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "./guard";
import { emptyStringsToNull } from "@/lib/validation/common";
import { validationError } from "@/lib/validation/errors";

// Staff management (2026-09-30, owner's request): super-admin only. Adding
// a member creates (or promotes) the account with the chosen role, marks the
// email verified (admins sign in with password + 2-step, not an email link),
// and sends the standard set-password email. Their first admin visit then
// walks them through 2-step setup.
const input = z.object({
  name: z.string().min(1, "Please enter their name.").max(255),
  email: z.email("Please enter a valid email address.").max(255),
  role: z.enum(["admin", "super-admin"]),
});

export const POST = adminRoute(async (req, _ctx, session) => {
  requireSuperAdmin(session);
  const data = input.parse(emptyStringsToNull(await req.json()));
  const email = data.email.trim().toLowerCase();
  const now = new Date();

  const userType = await db.userType.upsert({
    where: { slug: data.role },
    update: {},
    create: { name: data.role === "super-admin" ? "Super Admin" : "Admin", slug: data.role, createdAt: now, updatedAt: now },
  });

  const existing = await db.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existing && ["admin", "super-admin"].includes(existing.role ?? "")) {
    return validationError({ email: ["That person is already on the staff list."] });
  }

  let userId: bigint;
  if (existing) {
    // Promoting an existing (customer) account: same email, new powers. The
    // password they already have keeps working; 2-step setup is forced on
    // their first admin visit either way.
    await db.user.update({
      where: { id: existing.id },
      data: { name: data.name.trim(), role: data.role, userTypeId: userType.id, emailVerified: true, updatedAt: now },
    });
    userId = existing.id;
  } else {
    const user = await db.user.create({
      data: {
        name: data.name.trim(),
        email,
        role: data.role,
        userTypeId: userType.id,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    });
    userId = user.id;
  }

  // Send the set-password email (the standard reset flow; the link goes to
  // the ADMIN reset page because the role is already set — see auth.ts
  // sendResetPassword). Failure doesn't undo the account: the super-admin
  // sees the warning and can resend by re-adding later.
  let emailSent = true;
  try {
    await auth.api.requestPasswordReset({ body: { email } });
  } catch {
    emailSent = false;
  }

  console.info(`[audit] staff ${Number(userId)} (${data.role}) added by user ${session.user.id}`);
  return Response.json({ id: Number(userId), emailSent }, { status: 201 });
});
