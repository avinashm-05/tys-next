import { z } from "zod";

// SettingController@store inline rules (04-validation): each markup is
// required, numeric, 0..100. Domestic is the original key; international is
// new in A4.2 and validated identically.
const markupField = (label: string) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : v),
    z
      .number({
        error: (issue) =>
          issue.input == null
            ? `The ${label} field is required.`
            : `The ${label} field must be a number.`,
      })
      .min(0, `The ${label} field must be at least 0.`)
      .max(100, `The ${label} field must not be greater than 100.`),
  );

export const settingsInput = z.object({
  fedex_markup_percentage: markupField("fedex markup percentage"),
  fedex_markup_percentage_international: markupField("fedex markup percentage international"),
});

export type SettingsInput = z.infer<typeof settingsInput>;
