import { z } from "zod";
import { customerRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { emptyStringsToNull } from "@/lib/validation/common";

// C1.3 profile mutation — the ONLY customer write surface. Deliberately a
// dedicated endpoint (not Better Auth updateUser): the field list is explicit
// and closed — name/phone/company/address, nothing else. Email stays
// read-only in v1 (changing it changes which quotes the account sees and
// needs re-verification); role/userTypeId are untouchable by construction.
// The update is scoped to session.user.id — no id is accepted from the client.
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
  companyName: z.string().max(255).nullish(),
  addressLine1: z.string().max(255).nullish(),
  addressLine2: z.string().max(255).nullish(),
  addressLine3: z.string().max(255).nullish(),
  city: z.string().max(100).nullish(),
  state: z.string().max(100).nullish(),
  country: z.string().max(100).nullish(),
  postalCode: z.string().max(20).nullish(),
});

export const PATCH = customerRoute(async (req, _ctx, session) => {
  const data = profileInput.parse(emptyStringsToNull(await req.json()));

  const updated = await db.user.update({
    where: { id: BigInt(session.user.id) },
    data: {
      name: data.name.trim(),
      phone: data.phone ?? null,
      companyName: data.companyName ?? null,
      addressLine1: data.addressLine1 ?? null,
      addressLine2: data.addressLine2 ?? null,
      addressLine3: data.addressLine3 ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      country: data.country ?? null,
      postalCode: data.postalCode ?? null,
      updatedAt: new Date(),
    },
    select: {
      name: true,
      phone: true,
      email: true,
      companyName: true,
      addressLine1: true,
      addressLine2: true,
      addressLine3: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
    },
  });

  return Response.json(updated);
});
