import { adminRoute } from "@/lib/auth";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { emptyStringsToNull } from "@/lib/validation/common";
import { calculateInput } from "@/lib/validation/calculate";

// QuoteController@calculate: chargeable weight for one package.
// Public wizard (B2) will reuse the same core; this is the admin surface.
export const POST = adminRoute(async (req) => {
  const data = calculateInput.parse(emptyStringsToNull(await req.json()));
  const chargeable = calculateChargeableWeight(
    data.weight,
    { length: data.length, width: data.width, height: data.height },
    data.weight_unit,
  );
  return Response.json({ chargeable_weight: Math.round((chargeable + Number.EPSILON) * 100) / 100 });
});
