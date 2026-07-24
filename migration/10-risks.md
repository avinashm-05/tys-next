# 10 — Risks, PHP-isms, and Decisions Needing a Human

Ranked: **data integrity** → **behavioral landmines** → **security observations** → **cleanups/decisions**.

## Data integrity

- **R1 — `quotes.package_type` is a CSV string in one column** (post-`2026_02_21_120000` migration), with legacy pre-migration rows possibly holding old enum values (`boxes`, `envelope` single values). Admin filtering uses MySQL `FIND_IN_SET` (`QuotesDataTable.php:92-96`); normalization (`boxes→box`, `envelop→envelope`, `tv→television`) happens at read time in three separate places (Quote controller, FedEx service, DataTable). Port the normalizer once, in one module. Long-term normalization into rows is possible *after* Laravel retirement — not during.
- **R2 — Orphaned `packages` table.** `Package` model was re-pointed to `package_details` (`Package.php:19`). Prod may still hold legacy rows in `packages`. Check before dropping; exclude from Prisma meanwhile.
- **R3 — Laravel `decimal:2` casts serialize as *strings*** (`"120.50"`) in every JSON response containing quote/package weights and costs. Prisma `Decimal` serializes differently. Frontend code (and any external consumer) may depend on strings — pick one contract (recommend keeping strings via `.toFixed(2)` serializer) and enforce it in tests.
- **R7 — `vendor_contacts` UNIQUE(vendor_id,email) vs soft deletes.** The DB index counts soft-deleted rows; the app-level uniqueness rule (`UniqueVendorContactEmail`) ignores them → re-creating a deleted contact's email passes validation then throws a raw 500 from MySQL. Decide: partial cleanup, index change, or replicate the bug (don't silently "fix" without owner sign-off — an index change is a schema change on live data).
- **R8 — `package_details.car_year` is `varchar(10)` but the model casts `integer`** (`Package.php:58`), and validation demands `digits:4`. Data is stringy-numeric. Keep as string in Prisma; coerce in the API.
- **R6 — Column widths uncertain.** `Schema::defaultStringLength(191)` was in effect, but if any migration ran before that line existed, widths may differ. Also `quote_contacts.quote_id` has no DB unique despite `hasOne` semantics — duplicates possible in prod. **`prisma db pull` on production is mandatory before writing the final schema.**
- **R35 — Contact data duplicated**: `quotes.name/email/mobile_number` AND `quote_contacts` row (also raw JSON in `box_data` etc.). Emails read from `quote_contacts` with fallback to quote columns. Keep writing both to preserve report compatibility.

## Behavioral landmines (Laravel implicit magic)

- **R9 — Geocoding runs synchronously inside vendor create/update requests** (`VendorObserver`): up to 4 Nominatim strategies × 3 retries with 1–4s backoffs — a vendor save can take >10s or silently produce no coordinates (errors swallowed, logged only). Node decision: replicate sync (bug-compatible) or queue it (better UX, slightly different timing — coordinates appear late). **Owner call.**
- **R10 — `updateQuietly`** prevents observer recursion when the observer writes lat/lng. In Node there's no event system to bypass — but if you build the geocode hook into the update service, guard against self-triggering when only lat/lng/geocoded_at change.
- **R11 — `Service` `creating` hook auto-slugs `system_name`** (`Service.php:42-49`). Any code path creating services (seeds, scripts) must go through the service layer that applies it.
- **R13 — Route model binding**: missing IDs → 404 HTML/redirect; **soft-deleted contacts/comments 404 automatically** on show/edit/update routes. Express must add `deletedAt: null` to binding lookups or admins could edit "deleted" rows.
- **R25 — Mailable constructor side effect**: `QuoteConfirmation.__construct` *creates the tracking-token DB row* if missing (`QuoteConfirmation.php:29-35`). Easy to lose in a port; move to the worker explicitly.
- **R26 — `estimated_cost` is only written on the AJAX path**: JSON store responses update the quote with the cheapest FedEx rate (`QuoteController.php:185-194`); a non-JSON submit (or non-US route, or FedEx failure) leaves cost NULL. Admin UI and exports handle NULL — keep the asymmetry.
- **R22 — `Schema::hasTable('settings')` guard inside FedEx parsing** (`FedExRateQuoteService.php:296`) exists for test environments; markup silently defaults to 0 on any settings error. Preserve fail-open behavior (a markup lookup failure must not kill rate quoting).
- **R12 — JSON casts**: `box_data/television_data/auto_data` store the *raw validated arrays* (including client-provided `chargeable_weight`). Admin FedEx re-rating reads these JSON blobs back. Shape is implicitly the wizard's payload — freeze it with a Zod schema.
- **R17 — Date formatting**: `M d, Y H:i` (DataTables), `Y-m-d H:i:s` (CSV export), `Y-m-d` (FedEx shipDate = **now+10 days** for postal validation — `FedExPostalValidationService.php:31`), 30-day window for `recentComments`, all in **UTC**. Replicate exactly; timezone drift would silently change "recent" windows and FedEx requests.
- **R23 — Tracking token**: `Str::random(64)` = 64-char alphanumeric. Keep charset/length so old and new tokens are indistinguishable, and **keep `/email/track/{token}` working verbatim** — it's hardcoded in delivered emails.
- **R31 — Raw SQL**: Haversine radius (`Vendor.php:262-280`, `HAVING distance <=`), `FIND_IN_SET`, `LOWER(email) =` (contact uniqueness), map AVG/MIN/MAX bounds — all MySQL-specific; port as `$queryRaw` with identical math (earth radius 6371 km; miles ×1.60934).
- **R-wizard — Two divergent live wizard implementations** (`welcome` 4-step vs `quotes/index` 3-step, different package-type spellings `envelop/tv` vs `envelope/television`, normalized before POST). One React wizard must replace both; product must choose the surviving UX. Also note the hero mini-form on `/` funnels into `/quotes` with query params (normalization map USA→US, UK→GB, INDIA/IND→IN).
- **R36 — "Book Now" is fake**: the FedEx rate card button shows a "Booking Confirmed" panel and redirects home after 8s (`quotes/index.blade.php:6539`) — **no booking API exists**. Don't invent one; confirm with owner it's intended.
- **R18 — `verified` middleware is a no-op** (User doesn't implement MustVerifyEmail). Port as "no email verification" — don't accidentally enable it and lock users out.
- **R28 — `UserType::STAFF` referenced in code but never seeded**; login redirect treats staff like user. Harmless, but port the constant or drop it consciously.

## Possible existing bugs (verify, don't blindly replicate)

- **R4 — `VendorContactUpdateRequest.php:28`**: `$contactId = $this->route('contact')` returns the **bound Model**, which is then passed to `new UniqueVendorContactEmail(int $vendorId, ?int $excludeContactId)` — an object into an `int` parameter is a PHP `TypeError` at runtime. Either tests bypass it or contact updates 500 on real traffic when validation reaches the rule. **Test on the live app**; implement correctly in Node (exclude by id).
- **R5 — Shadowed duplicate admin routes** in `web.php:54-59` with a missing `DashboardController` import (resolves to the bare string `"DashboardController"`). Dead due to later re-registration by `admin.php`. Do not port; delete-on-sight.
- **R37 — `layouts/app.blade.php` misses its `@vite` call** — Breeze-styled pages under it (dashboard/profile shell) render without Tailwind. Cosmetic bug; the React port makes it moot but explains current visual weirdness.
- **R38 — Prod `.env` smells**: `APP_ENV=local`, `APP_DEBUG=true`, `FEDEX_SANDBOX=true`, `FEDEX_POSTAL_VALIDATION_ENABLED=false`, MAIL config incomplete on the deployed copy. Confirm what production *actually* runs (this may be a stale local copy) — it changes cutover assumptions (are rates real? do emails send?).

## Security observations (current state; decisions, not silent fixes)

- **R19 — Admin GETs lack role checks** (only `auth`): quotes list/show/fedex-rates, vendors list/show/create/edit pages, vendor map + geocode, settings page, comments export/count, services search — and **`POST admin/settings` (a write!) has no admin check**. Recommend `requireAdmin` on all `/api/admin/*`; needs sign-off because it's a behavior change for `staff`/`user` accounts (if any exist).
- **R27 — `admin/quotes/{id}/fedex-rates` accepts unvalidated overrides** (`box_details`, `ship_date`, `pickup_type`, `packaging_type`, weights) straight into the FedEx payload (`Admin/QuoteController.php:84-103`). Add Zod validation in the port.
- **R16 — CSRF removal exposes public endpoints**: `/quotes` (10/min), `/quotes/calculate` (60/min), `/quotes/validate-postal` (30/min — each triggers a paid-ish FedEx call) currently enjoy incidental same-origin protection. With JWT-only auth these are anonymous endpoints guarded solely by rate limits. Decide: origin allowlist, captcha on submit, or accept the risk.
- **R-PII — `vendors.ssn_number` stored in PLAINTEXT** (unique-indexed!). Logs redact it but DB doesn't encrypt. Migration is the natural moment to at least field-encrypt; needs owner decision (unique lookups vs encryption tension).
- **R20 — Password-reset flow reveals account existence** (broker status shown to user). Match for parity; flag for hardening.
- **R33 — Login limiter** is 5 attempts per email+IP with lockout-seconds leak; replicate semantics or consciously harden.

## Infra / process risks

- **R14 — FedEx token cache**: DB-cache single row, TTL = expires_in−60s, no refresh lock — concurrent refreshes are tolerated today. In Node add single-flight; also the 401-retry-once path (`FedExClient.php:24-27`) is load-bearing for expired-token recovery.
- **R15 — Rate limits must carry over** per route (see 02-routes table) and login limiter; the SPA UX assumes 422/429 JSON bodies with messages.
- **R21 — Queue worker existence in prod is unverified** (shared hosting; `QUEUE_CONNECTION=database`). If no worker runs, quote emails currently never send (or a cron runs `queue:work`). Check the live `jobs` table before promising email parity.
- **R24 — Cutover kills sessions/remember-me**; users re-login. In-flight password-reset links (60-min window) die unless bridged.
- **R29 — Nominatim usage policy**: keep custom User-Agent, 1 rps, and caching, or get blocked; a commercial geocoder is the safe alternative (cost decision).
- **R30 — DataTables protocol decision** (see 03/09): reimplementation is ~2-3 days of fiddly param mapping; TanStack replacement touches every admin list page but ends cleaner. Recommended: replace.
- **R32 — The 522-test PHPUnit suite is the de-facto spec** and dies with PHP. Property tests (`tests/Property/*`) encode the wizard/validation invariants — port the top ~30 as vitest tests **before** rewriting the modules they cover.
- **R34 — Repo hygiene**: 263MB `tys.zip`, nested git repo (`tys/`), theme demos, `node_modules`+`vendor` committed to the hosting dir — start the new repo clean; never copy these.
- **R39 — `quotes/calculate` endpoint is only invoked by dead JS** (live wizard computes client-side) but is feature-tested and rate-limited. Keep the endpoint (cheap) — some cached page or bot may still call it.

## Consolidated "needs a human" list
1. R19 admin authorization tightening — sign-off.
2. R9 sync vs async geocoding.
3. R30 DataTables vs TanStack.
4. R-wizard: surviving wizard UX (3-step vs 4-step vs `quotes/latest` redesign).
5. R16 public endpoint protection post-CSRF.
6. R7 vendor-contact unique-index vs soft-delete conflict.
7. R-PII SSN encryption.
8. R2 orphaned `packages` table + dead code (`QuoteGenerator`, `ExportService`) — delete or archive.
9. R38 verify true production env (sandbox FedEx? mail actually sending? worker running?).
10. R36 fake "Book Now" — intended?
11. R3 decimal-as-string API contract.
12. Hosting move (08) — prerequisite for the whole plan.
