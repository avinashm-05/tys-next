import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { HttpError } from "@/lib/validation/errors";
import { MAP_SELECT, serializeMapVendor } from "../../helpers";

type Ctx = { params: Promise<{ id: string }> };

/** getVendorDetails: the map resource + detail/edit URLs for the popup. */
export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const id = parseId((await ctx.params).id);
  const row =
    id !== null
      ? await db.vendor.findUnique({ where: { id }, select: MAP_SELECT })
      : null;
  if (!row) throw new HttpError(404, "Vendor not found.");

  const editUrl = `/admin/vendors/${Number(row.id)}/edit`;
  return Response.json({
    ...serializeMapVendor(row),
    // The SPA has no separate detail page — both point at edit.
    detail_url: editUrl,
    edit_url: editUrl,
  });
});
