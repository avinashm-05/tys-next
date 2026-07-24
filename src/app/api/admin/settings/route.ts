import { adminRoute } from "@/lib/auth";
import {
  FEDEX_MARKUP_INTL_KEY,
  FEDEX_MARKUP_KEY,
  getFedexMarkupInternationalPercentage,
  getFedexMarkupPercentage,
  setSetting,
} from "@/lib/settings";
import { emptyStringsToNull } from "@/lib/validation/common";
import { settingsInput } from "@/lib/validation/settings";

export const GET = adminRoute(async () => {
  return Response.json({
    fedexMarkupPercentage: await getFedexMarkupPercentage(),
    fedexMarkupPercentageInternational: await getFedexMarkupInternationalPercentage(),
  });
});

// R19: Laravel's settings write had NO admin check — adminRoute closes that.
export const PUT = adminRoute(async (req) => {
  const data = settingsInput.parse(emptyStringsToNull(await req.json()));
  await setSetting(FEDEX_MARKUP_KEY, String(data.fedex_markup_percentage));
  await setSetting(
    FEDEX_MARKUP_INTL_KEY,
    String(data.fedex_markup_percentage_international),
  );
  return Response.json({
    fedexMarkupPercentage: data.fedex_markup_percentage,
    fedexMarkupPercentageInternational: data.fedex_markup_percentage_international,
  });
});
