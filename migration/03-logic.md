# 03 — Business Logic

## A. Controller actions

### Public — `app/Http/Controllers/QuoteController.php` (the revenue path)

| Action | Inputs / validation | What it does | Touches | Response |
|---|---|---|---|---|
| `index` (:31) | query `from_country`, `to_country` (optional prefill) | Renders wizard with countries, normalized prefills, `postalValidationEnabled` flag | CountryListService, config `fedex.postal_validation_enabled` | Blade view |
| `store` (:44) | **QuoteRequest** | 1. Normalize package types (CSV/array → canonical: `envelop→envelope`, `boxes→box`, `tv→television`, dedupe, keep order — :310-328). 2. Back-compat: legacy `packages[]` payload feeds box/tv details (:56-64). 3. Create Quote (contact fields denormalized: `mobile_number = trim(country_code+' '+phone)`; raw detail arrays into JSON cols; status pending). 4. For box/tv/auto types, insert `package_details` rows; per row compute `chargeable_weight` if absent: `calculator.calculate(weight,{l,w,h},unit)`, fallback = weight; accumulate `total += chargeable_weight * max(quantity,1)` (:255-303). 5. Update quote total (only if > 0). 6. Create QuoteContact. 7. `EmailTrackingService.createTrackingToken(quote)`. 8. Dispatch `SendQuoteConfirmationEmail` job. 9. `expectsJson()`? → JSON path: if from+to both US (via `CountryListService.isUnitedStates`) **and** `config('fedex.enabled')`: call `FedExRateQuoteService.quote(...)`; on success attach `rates`, update quote `estimated_cost`/`currency` from **cheapest** rate (:185-194); on failure `rates_error`. Else `{show_fedex_rates:false}` | Quote, Package, QuoteContact, ChargeableWeightCalculator, EmailTrackingService, FedExRateQuoteService, CountryListService, queue | 201 JSON `{message, quote_id, show_fedex_rates, summary?{package_label, weight_lb, route "zip → zip", contact{}}, rates?[], rates_error?}` — or 302 redirect + flash for non-AJAX |
| `calculate` (:333) | **CalculateQuoteRequest** (l/w/h ≥0, weight ≥0.01, unit enum) | `max(actual, l*w*h / (lb?139:kg?5000))` | ChargeableWeightCalculator | `{chargeable_weight: round2}` |
| `validatePostal` (:355) | **ValidatePostalCodeRequest** | If `fedex.postal_validation_enabled` false → always valid passthrough (:361-367). Else regex pre-check (PostalCodeFormat) then FedEx `country/v1/postal/validate` | FedExPostalValidationService | 200 `{valid:true, cleaned_postal_code, location}` / **422** `{valid:false, message}` |
| `thankYou` (:391) | query `name` | static page | — | view |

### Public — `EmailTrackingController@track` (:23)
Token lookup → `QuoteEmailStatistic.markAsOpened()` (first-open preserved, `last_opened_at`+`open_count` bumped). **All errors swallowed.** Always returns 1×1 transparent GIF (base64 at :34) with no-cache headers. CSRF-exempt.

### Auth controllers (Breeze-derived, customized)
- `LoginController@store`: LoginRequest.authenticate() → RateLimiter 5 attempts on `lower(email)|ip`, `Lockout` event, `Auth::attempt(email,password,remember)`; session regenerate; **role redirect**: super-admin/admin → `admin.dashboard`, staff/user/none → `dashboard` (:56-73).
- `LoginController@destroy`: logout + invalidate + regenerate token → redirect login.
- `ForgotPasswordController@store`: `Password::sendResetLink` (inline validation: email required).
- `ResetPasswordController@store`: `Password::reset` + `Hash::make` (inline validation: token, email, password confirmed + defaults rules).
- `ProfileController`: edit (view w/ user); update (**ProfileUpdateRequest**; email change ⇒ `email_verified_at = null`); destroy (inline `current_password` check in bag `userDeletion`, logout, delete user, invalidate session).

### Admin — `Admin\QuoteController`
- `index`: delegates to `QuotesDataTable.handle()` (below).
- `show`: loads `contact, packages, emailStatistic` → view.
- `updateStatus`: **UpdateQuoteStatusRequest** (enum + isAdmin authorize) → update + audit `Log::info` → `{success, message, status}`.
- `getFedExRates` (:70-107): rejects non-US-domestic (`{success:false,message}`); merges quote data with **unvalidated request overrides** (box/television/auto details, weight, residence, package_type, ship_date, pickup_type, packaging_type — R27) → `FedExRateQuoteService.quote()` → raw result JSON.

### Admin — `SettingController`
- `index`: `Setting::get('fedex_markup_percentage','0')` → view.
- `store`: inline validation `required|numeric|min:0|max:100` → `Setting::set` → redirect+flash.

### Admin — `ServiceController` / `VendorTypeController`
Standard CRUD, each write behind FormRequest with `isAdmin` authorize, audit `Log::info` with old/new data. Notables: Service `system_name` auto-slug on create (model hook); Service destroy = **hard delete** (no dependency check on vendor_services — FK cascades); VendorType destroy **refuses when vendors exist** (`vendor-types` guard at `VendorTypeController.php:116-119`).

### Admin — `VendorController`
- `store`: sets `added_by = auth()->id()`; create triggers **VendorObserver geocoding synchronously**; audit log **redacts SSN** (:69); redirects to **edit** page (not index).
- `update`: geocodes only if address fields changed (observer `wasChanged`); redirect index.
- `toggleStatus`: JSON `{success, message, new_status, status_badge:"<span…>"}` (HTML badge in JSON — SPA replaces with client rendering).
- `destroy`: hard delete + audit; **dependency check TODO** (:241) — contacts/comments/pivot cascade away silently. Decision: keep or implement the check.

### Admin — `VendorContactController` / `VendorCommentController`
AJAX-JSON CRUD nested under vendor. Common patterns to port:
- Parent-child guard: `contact->vendor_id !== vendor->id → 404/JSON error` (binding is not scoped).
- Sets `created_by`/`updated_by = auth()->id()`.
- Default contact status `active` when absent (`VendorContactController.php:60-62`).
- Destroy = **soft delete** + redirect+flash (not JSON!) — the page reloads.
- `VendorCommentController@export`: filtered CSV (category/priority/from/to date, `all` sentinel) built manually with `fputcsv` (:424-470); filename `vendor_comments_{id}_{Y-m-d_H-i-s}.csv`.
- `VendorCommentController@count`: `{total_count, critical_count, has_critical}`.
- `toggleStatus` (contacts): updates `updated_by`, toggles via model method, returns badge HTML.

### Admin — `VendorServiceController` (no route model binding — manual `findOrFail`)
- `index`/`search`: service list with filters (`search` regex-sanitized `[a-zA-Z0-9\s\-_\.]+`, status, assignment assigned/unassigned via whereHas on pivot), each row gets `is_assigned` + badge HTML; `index` adds summary counts; `search` paginates (≤100/page).
- `assign`/`unassign`: 409 on duplicate/absent; pivot attach with `assigned_at=now(), assigned_by=user`; audit log w/ ip+UA.
- `bulkAssign`/`bulkUnassign`: ≤50 ids, wrapped in a **DB transaction**, per-item try/catch accumulating assigned/skipped/failed, composite message.

### Admin — `VendorMapController`
- `index`: view + all vendor types + `VendorMapService.getDefaultBounds()` (AVG/MIN/MAX over geocoded vendors; fallback center-of-US 39.8283,-98.5795 zoom 4).
- `getVendorsInBounds`: inline validation (lat/lng ranges, status in all/active/inactive, vendor_type exists) → `withinBounds` scope (**longitude wrap-around handling** `Vendor.php:244-251`), limit 500, select 6 cols → `VendorMapResource` collection + count.
- `searchByName`: LIKE %q%, geocoded only, limit 10, 4 cols.
- `searchByRadius`: validation (radius 0.1–500, unit miles|kilometers) → miles→km ×1.60934 → raw Haversine, ordered by distance.
- `getVendorDetails`: VendorMapResource + `detail_url`/`edit_url` route URLs.
- `geocodeAddress`: address ≤500 → GeocodingService → `{success, latitude, longitude}` / 422.

## B. DataTables classes (`app/DataTables/*`) — server-side list engine

All five follow one pattern: `query()` builds an Eloquent query with request-driven filters; `dataTable()` wraps in yajra (search/sort/paginate per DataTables protocol) and appends **HTML string columns** (action buttons, badges, formatted dates `M d, Y H:i`); `handle()` returns view or JSON by `request()->ajax()`.

| Class | Base query + filters | Computed columns |
|---|---|---|
| QuotesDataTable | with contact, emailStatistic, packages; filters status / package_type (**`FIND_IN_SET`**, `boxes` matches box|boxes — :90-98) / date range / from+to country | route "X → Y", contact_info HTML, email_status badge w/ open counts+tooltip, status badge, package_type CSV→"Box, Television", action = view link + **status dropdown** |
| VendorsDataTable | with vendorType, addedBy; filters status/type/country/dates; column-search on contact_info (email|phone), address (city|state|country|line1), vendor_type (whereHas) | contact/address HTML, type name, status badge, action = view/toggle/edit/delete buttons; `handle()` also feeds filter dropdowns (active types + distinct countries) |
| ServicesDataTable | filter status | status badge, action buttons |
| VendorContactsDataTable | scoped `vendor_id`; filters status/city/state/dates; column search name/title/email/city/state | phone formatting, badge, action view/edit/toggle/delete |
| VendorCommentsDataTable | scoped `vendor_id`; filters category/priority/dates; column search title/content/createdBy | content_preview truncate(100), category+priority badges, action buttons |

**Migration note:** the yajra protocol (`draw`, `start`, `length`, `search[value]`, `order[i][column]`, per-column `columns[i][search][value]`) is consumed by DataTables JS in the Blade views. Recommended: replace with plain paginated JSON (`page`, `perPage`, `sort`, `filters`) + TanStack Table in React, moving all HTML generation client-side. If keeping the DataTables JS component, the Express layer must implement the protocol faithfully.

## C. Services / helpers → target Node modules

| PHP class | Responsibility | Target module |
|---|---|---|
| `ChargeableWeightCalculator` | `max(actual, L*W*H/divisor)`; divisor **139 (lb/inches)** or **5000 (kg/cm)**; any dimension ≤0 ⇒ dim weight 0 | `core/chargeableWeight.ts` (pure fn + unit tests from `tests/Property/Services/*`) |
| `CountryListService` | ISO country map from `umpirsky/country-list` data (cached 1 day); `normalizeCode` (USA→US, UK→GB, INDIA/IND→IN, uppercase); `isUnitedStates` | `core/countries.ts` using `world-countries` or `i18n-iso-countries`; port normalize verbatim |
| `EmailTrackingService` | 64-char random token, create statistic row, tracking URL via `route()`, record open | `modules/emailTracking/service.ts` (crypto.randomBytes → base62/alnum 64 chars; URL from APP_URL config) |
| `GeocodingService` | Nominatim search+reverse; cache 30 days (`geocode:md5(addr)`); **4 fallback strategies** (full → drop 1st part if >3 parts → last 4 parts → last 2 parts); 3 retries w/ exponential backoff 1s→2s→4s; custom User-Agent `"{app} Vendor Management"`; batchGeocode w/ 1 rps delay | `integrations/nominatim.ts` + Redis cache; keep UA + 1 rps etiquette (usage policy!) |
| `VendorMapService` | bounds query (limit 500), radius query (miles→km), local Haversine calc, default bounds (AVG/MIN/MAX or center-US) | `modules/vendors/mapService.ts` (Prisma + `$queryRaw` for radius) |
| `QuoteGenerator` | hard-coded rate-table estimator | **DEAD CODE** — not referenced by any controller. Skip; keep constants in doc archive in case business wants it back |
| `ExportService` + `QuotesExport` | Excel/PDF/CSV export of quotes via maatwebsite/excel + dompdf | **DEAD CODE** (tests only). Skip unless product wants it; then `exceljs` |
| `FedExClientAuth` | OAuth client-credentials token, cached with TTL = expires_in − 60s buffer, `clearToken`/`refreshToken` | `integrations/fedex/auth.ts` (Redis cache; single-flight lock to avoid stampede) |
| `FedExClient` | authed JSON requests; **auto-retry once on 401 or error code `NOT.AUTHORIZED.ERROR`** with fresh token (:24-27); 15s timeout; throws FedExException(status, body) | `integrations/fedex/client.ts` |
| `FedExPostalValidationService` | local format pre-check → POST postal/validate (carrierCode FDXG, shipDate now+10d, X-locale header); parses `errors[]` + `output.alerts[]` ERROR; requires non-empty `cleanedPostalCode` | `integrations/fedex/postalValidation.ts` |
| `FedExRateQuoteService` (529 lines — port with extreme care) | Builds `rate/v1/rates/quotes` payload: per-type line items — box/tv from user dims (inches **floored to int**, kg→lb ×2.20462, quantity expansion, **weight chunking ≤150 lb per parcel**, :259-285); envelope/furniture/auto from config defaults (`config/fedex.php:24-46`); recipient `residential` flag; `rateRequestType [ACCOUNT, LIST]`. Parses: per service ACCOUNT vs LIST charges from **4 candidate money paths** (:405-423), fallback to first rated detail; total = account ?? list; `save_percent` when list > total; `per_lb_rate = total/chargeable_weight`; delivery date from operationalDetail ?? commit; friendly names map (:12-22); **applies markup % from settings** to total/retail/per-lb (:291-319); type normalization CSV (`boxes→box` etc.) | `integrations/fedex/rateQuote.ts` — port verbatim, then verify with recorded fixtures from `tests/Unit/Services/FedEx/FedExRateQuoteServiceTest.php` |
| `PostalCodeFormat` (Support) | Regex: US `\d{5}(-\d{4})?`; CA `A1A 1A1` pattern; other: 3–20 chars `[A-Za-z0-9 -]+`; per-country messages | `core/postalCode.ts` |
| `VendorObserver` | see 01-database — replicate as explicit service call in vendor create/update handlers (decision: sync like today vs BullMQ job — R9) | `modules/vendors/geocodeHook.ts` |

## D. Facade / helper usage inventory → JS equivalents

| Laravel facade/helper | Where | JS equivalent |
|---|---|---|
| `Http` | GeocodingService, FedEx clients | `fetch`/`axios` with timeout + retry wrapper |
| `Cache` (database store) | geocode cache 30d, country list 1d, FedEx token | **Redis** (ioredis) — BullMQ already requires it |
| `Log` | ~40 audit/error sites (structured context arrays) | `pino` structured logging; keep the audit-log fields (admin_user_id, old/new data, ip, UA) |
| `Mail` + Mailables | SendQuoteConfirmationEmail job | Nodemailer + templates (06) |
| `DB::beginTransaction/commit/rollBack` | VendorServiceController bulk ops | `prisma.$transaction` |
| `DB::statement` | migration ALTER only | prisma migrate |
| `Schema::hasTable('settings')` | FedExRateQuoteService:296 (test-env guard) | unnecessary in Node — plain query with try/catch |
| `Str::slug` | Service creating hook | `slugify` npm or 10-line fn |
| `Str::random(64)` | tracking token | `crypto.randomBytes(48).toString('base64url').slice(0,64)` — keep 64 alnum chars |
| `Str::transliterate/lower` | login throttle key | `email.toLowerCase()` + IP |
| Carbon: `now()`, `->format('M d, Y H:i' / 'Y-m-d')`, `subDays(30)`, `addDays(10)`, comparisons | DataTables, emails, FedEx shipDate, recentComments, needsGeocoding | `dayjs`/`date-fns`; **TZ = UTC everywhere** (config/app.php) |
| `route()` URL generation | tracking URL, DataTable action links, map resource | central `urls.ts` builder from `APP_URL` |
| `e()` HTML escaping in JSON | DataTables/badge HTML | goes away — React escapes by default |
| `auth()->id() / user()` | audit fields everywhere | `req.user` from JWT middleware |
| `RateLimiter` (5 login attempts by email+ip) | LoginRequest | `rate-limiter-flexible` keyed identically |
| `Password` broker | forgot/reset | own token flow: crypto token (hashed at rest), 60-min expiry (Laravel default), single-use |
| `Excel` (maatwebsite) | dead ExportService | skip / `exceljs` if revived |
| `View::composer` | countries → `welcome`, `quotes.index` (`AppServiceProvider.php:30-32`) | React: shared `useCountries()` hook / loader |
| `Storage` | **unused** | — |
