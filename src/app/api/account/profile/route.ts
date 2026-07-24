import { z } from "zod";
import { customerRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { emptyStringsToNull } from "@/lib/validation/common";

// C1.3 profile mutation — the ONLY customer write surface. Deliberately a
// dedicated endpoint (not Better Auth updateUser): the field list is explicit
// and closed — name + phone, nothing else. Email stays read-only in v1
// (changing it changes which quotes the account sees and needs
// re-verification); role/userTypeId are untouchable by construction. The
// update is scoped to session.user.id — no id is accepted from the client.
const profileInput = z.object({
  name: z
    .string({ error: () => "Please enter your name." })
    .regex(/\S/, "Please enter your name.")
    .max(255),
  phone: z
    .string()
    .max(30, "Phone number must not exceed 30 characters.")
    .regex(/^[0-9\s\-()+]*$/, "Phone number can only contain numbers, spaces, hyphens, parentheses, and +.")
    .nullish(),
});

export const PATCH = customerRoute(async (req, _ctx, session) => {
  const data = profileInput.parse(emptyStringsToNull(await req.json()));

  const updated = await db.user.update({
    where: { id: BigInt(session.user.id) },
    data: { name: data.name.trim(), phone: data.phone ?? null, updatedAt: new Date() },
    select: { name: true, phone: true, email: true },
  });

  return Response.json({ name: updated.name, phone: updated.phone, email: updated.email });
});
