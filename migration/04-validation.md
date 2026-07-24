# 04 — Validation → Zod

21 FormRequests + 2 custom Rules + 8 inline `$request->validate()` sites. Laravel conventions to preserve in the Express layer:
- Errors return **HTTP 422** with `{message, errors: {field: [msgs]}}` — keep this shape so the React error rendering is uniform.
- `nullable` in Laravel = key may be absent, `null`, or `''` (empty string is converted to null by the `ConvertEmptyStringsToNull` middleware). In Zod use `.optional().nullable()` plus a global `'' → null` preprocessor on body parsing to match.
- `sometimes`/`required_with` → Zod `superRefine`.
- **Custom messages**: Laravel defines per-rule custom messages (listed per request below). Zod: pass message strings in each check.
- FormRequest `authorize()` → Express middleware `requireAdmin` (see 05-auth). Requests with `authorize(): true` need no guard beyond the route's.

## Shared Zod building blocks (write once in `validation/common.ts`)

```ts
import { z } from "zod";

export const weightUnit = z.enum(["lb", "kg"]);
export const activeInactive = z.enum(["active", "inactive"]);
const nonBlank = (msg: string) => z.string().max(255).regex(/\S/, msg); // Laravel 'regex:/\S/'
export const usPhone = z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "…format (XXX) XXX-XXXX.");
export const intlPhone = z.string().min(7).max(20).regex(/^[0-9\s\-\(\)]+$/);
```

## Per-request mapping

### `QuoteRequest` (`app/Http/Requests/QuoteRequest.php`) — the big one, POST /quotes

```ts
const boxDetail = z.object({
  quantity: z.coerce.number().int().min(1),
  weight: z.coerce.number().min(0.01, "Package weight must be greater than 0."),
  weight_unit: weightUnit,
  length: z.coerce.number().min(0),
  width: z.coerce.number().min(0),
  height: z.coerce.number().min(0),
  chargeable_weight: z.coerce.number().min(0).nullish(),
});

const televisionDetail = boxDetail.extend({
  quantity: z.coerce.number().int().min(1).nullish(),   // tv quantity is nullable
  brand_name: z.string().max(255),
  tv_model: z.string().max(255),
});

const autoDetail = z.object({
  brand_name: z.string().max(255),
  car_model: z.string().max(255),
  car_year: z.string().regex(/^\d{4}$/, "digits:4"),
});

// legacy "packages" payload: every field nullable (back-compat path, QuoteRequest.php:39-79)
const legacyPackage = boxDetail.partial().extend({
  brand_name: z.string().max(255).nullish(),
  tv_model: z.string().max(255).nullish(),
});

export const quoteRequest = z.object({
  from_country: z.string().max(255, ...),   // required msgs: "Please select the country you are sending from." etc.
  from_zip: z.string().max(20),
  to_country: z.string().max(255),
  to_zip: z.string().max(20),
  is_residence: z.coerce.boolean().optional(),
  package_type: z.string().max(255),        // CSV or array — normalize pre-parse like the controller
  packages: z.array(legacyPackage).nullish(),
  box_details: z.array(boxDetail).nullish(),
  television_details: z.array(televisionDetail).nullish(),
  auto_details: z.array(autoDetail).nullish(),
  contact: z.object({
    name: nonBlank("Please enter a valid name."),
    email: z.string().email("Please enter a valid email address.").max(255),
    country_code: z.string().max(10),
    phone: intlPhone,
  }),
}).superRefine((data, ctx) => {
  // Port of withValidator() cross-field rules (QuoteRequest.php:118-158):
  const types = parsePackageTypes(data.package_type);        // CSV/array → lowercased trimmed list
  const allowed = ["envelope","box","boxes","television","furniture","auto"];
  if (!types.length) ctx.addIssue({path:["package_type"], message:"Please select at least one package type."});
  if (types.some(t => !allowed.includes(t))) ctx.addIssue({path:["package_type"], message:"The selected package type is invalid."});
  const hasOverride = types.includes("envelope") || types.includes("furniture");
  if (hasOverride) return;                                    // ← business rule: envelope/furniture skip detail checks
  if ((types.includes("box")||types.includes("boxes")) && !data.box_details?.length && !data.packages?.length)
    ctx.addIssue({path:["box_details"], message:"Please provide box details."});
  if (types.includes("television") && !data.television_details?.length && !data.packages?.length)
    ctx.addIssue({path:["television_details"], message:"Please provide television details."});
  if (types.includes("auto") && !data.auto_details?.length)
    ctx.addIssue({path:["auto_details"], message:"Please provide auto details."});
});
```
Note the `required_with:*` semantics: each field inside `box_details.*` is required only when the array is present — modeled above by making the whole object required inside the array (matches practical behavior).

### `CalculateQuoteRequest` — POST /quotes/calculate
```ts
z.object({
  length: z.coerce.number().min(0), width: z.coerce.number().min(0), height: z.coerce.number().min(0),
  weight: z.coerce.number().min(0.01), weight_unit: weightUnit,
})
```
(Full custom message set at `CalculateQuoteRequest.php:43-65`.)

### `ValidatePostalCodeRequest` — POST /quotes/validate-postal
```ts
z.object({
  country_code: z.string().length(2, "Country code must be a 2-letter ISO code."),
  postal_code: z.string().min(3).max(20),
}).superRefine((d, ctx) => {
  if (config.fedex.postalValidationEnabled && !isValidPostal(d.country_code, d.postal_code))
    ctx.addIssue({ path: ["postal_code"], message: postalMessage(d.country_code) });
});
```
`isValidPostal`/`postalMessage` = port of `app/Support/PostalCodeFormat.php` (US `^\d{5}(-\d{4})?$`, CA `^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$` case-insensitive, default 3–20 chars `^[A-Za-z0-9 -]+$`). Note the conditional: **rule only applied when `fedex.postal_validation_enabled`** (`ValidatePostalCodeRequest.php:25-30`).

### `UpdateQuoteStatusRequest` — PATCH /admin/quotes/:id/status  *(authorize: isAdmin)*
```ts
z.object({ status: z.enum(["pending","quoted","accepted","cancelled"], { message: "The selected status is invalid." }) })
```

### `Auth\LoginRequest`
```ts
z.object({ email: z.string().email(), password: z.string(), remember: z.coerce.boolean().optional() })
```
Plus the behavioral part (not Zod): 5-attempt rate limit keyed `lower(email)|ip`, lockout message with seconds remaining (`LoginRequest.php:60-76`).

### `ProfileUpdateRequest`
```ts
z.object({
  name: z.string().max(255),
  email: z.string().toLowerCase().email().max(255), // + async unique check ignoring own id
})
```
Laravel `lowercase` rule = reject non-lowercase; the controller relies on it — in Zod use `.toLowerCase()` transform (safer) or `.refine(v => v === v.toLowerCase())` for exact parity.

### Service requests *(authorize: isAdmin)*
`ServiceStoreRequest` / `ServiceUpdateRequest`:
```ts
z.object({
  name: nonBlank("Service name cannot be empty or contain only whitespace."),
  system_name: z.string().max(255).regex(/^[a-z0-9\-_]+$/).nullish(), // + async unique (ignore self on update)
  status: z.enum(["active","deactive"]),
})
```
Uniqueness (`unique:services,system_name`, ignore current on update) → async check against Prisma; return 422 `{system_name: ["This system name is already in use…"]}`.

### VendorType requests *(authorize: isAdmin)*
```ts
z.object({
  name: nonBlank(...).max(255),          // + async unique vendor_types.name (ignore self on update)
  description: z.string().max(1000).nullish(),
  status: activeInactive,
})
```

### Vendor requests *(authorize: isAdmin)* — `VendorStoreRequest` / `VendorUpdateRequest`
```ts
z.object({
  name: nonBlank("Vendor name cannot be empty or contain only whitespace."),
  vendor_type_id: z.coerce.number().int(),   // + async: exists AND status==='active'  (closure rule, VendorStoreRequest.php:36-42)
  email: z.string().email().max(255),        // + async unique vendors.email (ignore self on update)
  phone_number: z.string().max(20).regex(/^[\+]?[0-9\s\-\(\)]+$/),
  country_code: z.string().max(5).regex(/^[\+]?[0-9]+$/, "…(e.g., +1, +44)"),
  website: z.string().url().max(255).nullish(),
  ein_number: z.string().max(20).regex(/^[0-9\-]+$/).nullish(),  // + async unique (ignore self)
  ssn_number: z.string().max(20).regex(/^[0-9\-]+$/).nullish(),  // + async unique (ignore self)
  address_line_1: z.string().max(255),
  address_line_2: z.string().max(255).nullish(),
  address_line_3: z.string().max(255).nullish(),
  city: z.string().max(100), state: z.string().max(100),
  country: z.string().max(100), postal_code: z.string().max(20),
  status: activeInactive,
})
```
Custom rule to port: **vendor type must exist AND be active** — message "The selected vendor type is not active and cannot be assigned to new vendors."

### VendorContact requests *(authorize: isAdmin)*
```ts
z.object({
  name: nonBlank(...), title: z.string().max(255).nullish(),
  city: z.string().max(100).nullish(), state: z.string().max(100).nullish(),
  email: z.string().email("Please enter a valid email address.").max(255),
  work_phone: usPhone.nullish(), cell_phone: usPhone.nullish(),   // strict US format (XXX) XXX-XXXX
  status: activeInactive,
})
```
Plus custom rule **`UniqueVendorContactEmail`** (`app/Rules/UniqueVendorContactEmail.php`): case-insensitive (`LOWER(email) = ?`) uniqueness **within the vendor**, excluding the contact being updated. ⚠️ Because the model uses SoftDeletes, this Eloquent check **ignores soft-deleted rows**, but the DB unique index does not → possible 500 on recreate (R7). ⚠️ Also note `VendorContactUpdateRequest.php:28` passes the route-bound **Model** where the rule's constructor demands `?int` — verify actual behavior on a live box before assuming update-uniqueness works (R4). In Node, implement as: `WHERE vendor_id = ? AND LOWER(email) = ? AND deleted_at IS NULL AND id != ?`.

### VendorService requests *(authorize: isAdmin)*
```ts
// assign
z.object({ service_id: z.coerce.number().int() })   // + async: exists AND active ("does not exist or is not active")
// unassign: same minus the active check
// bulk-assign / bulk-unassign
z.object({ service_ids: z.array(z.coerce.number().int()).min(1).max(50) })
  // dedupe in a preprocessor (prepareForValidation does array_unique), distinct+exists(+active for assign) async
```

### VendorComment requests *(authorize: isAdmin)*
```ts
z.object({
  title: nonBlank(...),
  content: z.string().max(5000).regex(/\S/, "…cannot be empty or contain only whitespace."),
  category: z.enum(["general","performance","issues","compliance","communication"]),
  priority: z.enum(["low","normal","high","critical"]),
})
```

## Inline `$request->validate()` sites (no FormRequest)

| Location | Rules | Zod |
|---|---|---|
| `SettingController@store:25-27` | `fedex_markup_percentage: required numeric 0..100` | `z.object({ fedex_markup_percentage: z.coerce.number().min(0).max(100) })` |
| `ProfileController@destroy:45-47` | `password: required, current_password` (error bag `userDeletion`) | `z.object({ password: z.string() })` + bcrypt compare against current user |
| `ForgotPasswordController@store:27-29` | `email: required email` | trivial |
| `ResetPasswordController@store:32-36` | `token, email, password confirmed + Password::defaults()` (min 8) | `z.object({token, email, password: z.string().min(8), password_confirmation}).refine(match)` |
| `VendorMapController@getVendorsInBounds:40-47` | lat/lng bounds ±90/±180, `status in:all,active,inactive`, `vendor_type_id exists` | numeric ranges + enum + async exists |
| `VendorMapController@searchByName:70-72` | `query: required string 2..255` | trivial |
| `VendorMapController@searchByRadius:90-97` | lat/lng, `radius 0.1..500`, `unit in:miles,kilometers`, status, type | ranges + enums |
| `VendorMapController@geocodeAddress:143-145` | `address: required ≤500` | trivial |
| `VendorServiceController@index:30-34 / @search:470-475` | `search/q: nullable ≤255 regex ^[a-zA-Z0-9\s\-_\.]+$`, `status in`, `assignment in`, `per_page 1..100` | port the regex; it intentionally blocks `%_` LIKE metacharacters and HTML |

## Custom-message inventory
All 21 FormRequests carry full `messages()` maps (user-facing, referenced by front-end tests). Copy them verbatim into the Zod schemas — the wizard's error rendering asserts exact strings (see `tests/Property/Validation/ErrorMessagePropertyTest.php`).
