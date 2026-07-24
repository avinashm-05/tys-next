import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { publicApiRoute } from "@/lib/public-route";
import { emptyStringsToNull } from "@/lib/validation/common";
import { calculateInput } from "@/lib/validation/calculate";

// Public port of QuoteController@calculate — chargeable weight for one package
// (60/min, same-origin). Parity/tests only: the live wizard computes chargeable
// weight client-side (src/lib/chargeable-weight), so this isn't on the hot path.
export const POST = publicApiRoute({ name: "quotes:calculate", limit: 60 }, async (req) => {
  const data = calculateInput.parse(emptyStringsToNull(await req.json()));
  const chargeable = calculateChargeableWeight(
    data.weight,
    { length: data.length, width: data.width, height: data.height },
    data.weight_unit,
  );
  return Response.json({
    chargeable_weight: Math.round((chargeable + Number.EPSILON) * 100) / 100,
  });
});
