# 07 — Frontend (Blade → React)

78 Blade views. Three distinct UI worlds coexist:

1. **Public site** (`/`, `/quotes`, `/thank-you`): jQuery 3.2.1 + select2 + Bootstrap 5.1.3 + Font Awesome + AOS, all via CDN/`asset()` — **no Vite, no Tailwind, no Alpine** on these pages. Giant inline `<style>`/`<script>` blocks.
2. **Admin panel** (`/admin/*`): **"Codebase" theme by Pixelcave** (Bootstrap 5; `assets/css/codebase.min.css`, `assets/js/codebase.app.min.js` — see `Admin/Layouts/Includes/head.blade.php:26-27`, `footer.blade.php:9`) + per-page CDN stack: jQuery 3.7.1, DataTables 1.13.7 (+responsive-bs5), SweetAlert2 v11, validator.js 13.11.0, jQuery Mask, Leaflet 1.9.4 + markercluster 1.5.3 (map only). PLUS the Vite bundle (Tailwind + Alpine) loaded globally in the admin head — two UI systems at once.
3. **Breeze remnants** (auth/profile): Tailwind x-components (`x-text-input`, `x-modal`, …) with Alpine — though the *live* login/forgot/reset pages are standalone Codebase-themed docs, with leftover Breeze markup concatenated after `</html>` in forgot/reset (cleanup cruft, don't port twice).

## ⚠️ The wizard exists twice, divergently (biggest frontend decision)

| | `welcome.blade.php` (route `/`, 4,350 lines) | `quotes/index.blade.php` (route `/quotes`, 6,593 lines) |
|---|---|---|
| Steps | **4** (Location → Package → Package Details → Contact) | **3** (Location → Package+Details combined → Contact) |
| Engine | `class QuoteWizardManager`, **instantiated** at :4151 | Same class present but **commented out** (:3780-3781, ~2,100 dead lines); live code = separate ~2,790-line `DOMContentLoaded` handler (:3778-6569) |
| Package card values | `envelope, boxes, television, furniture, auto` | `envelop, boxes, tv, furniture, auto` (misspellings — both normalized to backend names before POST via `mapPackageTypeToBackend`) |
| Extra | Hero mini-form (from/to country) that redirects to `/quotes?from_country=&to_country=` (:1830); AOS animations | select2 country selects with query-param prefill + legacy code normalization (USA→US, UK→GB, INDIA/IND→IN) at :1639-1665 |

**Both** post the same payload to `POST /quotes` and render FedEx rates from the JSON response. → Build **one** React `QuoteWizard` and mount it on both pages; get product sign-off on which step layout wins (recommend the 3-step `/quotes` variant — it's the newer flow).

### Live wizard behavior to preserve exactly (from `quotes/index.blade.php`)
- **Step 1**: `from_country`/`to_country` (select2 → react-select), `from_zip`/`to_zip` (maxlength 10), `is_residence` hidden 0/1 toggle (desktop+mobile toggles kept in sync).
- **Zip validation**: client regex pre-check (`isValidPostalFormat` :3916 — US 5/ZIP+4, CA A1A1A1, generic 3–20) then debounced (400ms) sequence-guarded `POST /quotes/validate-postal` with `X-CSRF-TOKEN`; success rewrites input to `cleaned_postal_code`; gated by `POSTAL_VALIDATION_ENABLED = @json($postalValidationEnabled)` (:3799).
- **Step 2**: multi-select package cards; **override rule** — selecting envelope or furniture hides+clears all detail sections (`updatePackageDetailsVisibility` :4514-4604); otherwise box/tv/auto detail sections show independently. Repeatable rows (add/remove with name re-indexing `boxes[i][…]`, `televisions[i][…]`, `autos[i][…]`; auto year select 2015-2024; box quantity select 1-5).
- **Chargeable weight is computed client-side** in the live path (`calculateBoxChargeableWeight` :5017): `max(weight, L*W*H / (LB?139:5000))`, debounced 500ms, into a disabled field. (`POST /quotes/calculate` is only called by the dead class — the route still exists and is feature-tested; keep the endpoint, reuse client calc in React.)
- **Step 3 + submit** (`submitQuoteRequest` :6339): builds `{from_country, from_zip, to_country, to_zip, is_residence, package_type: "box,television", packages (legacy fallback), box_details, television_details, auto_details, contact:{name,email,country_code,phone}}`; 422 → `mapServerErrorsToUI(data.errors)` field mapping + focus; success → `show_fedex_rates ? showFedExRates(data) : redirect /thank-you?name=`.
- **FedEx rates panel** (`showFedExRates` :6431): hides form, renders summary badge (route, package label, weight) + three states: `rates_error` amber panel / empty-rates info panel / rate cards (`service_name`, transit/`estimated_delivery`, `total_charge`+currency, Book Now → fake "Booking Confirmed" + 8s redirect home — note "Book Now" performs **no API call**; it's presentational).
- Country dropdown options come from `partials/country-options.blade.php` fed by the `View::composer` (`AppServiceProvider.php:30-32`) → React: `useCountries()` hook backed by `GET /api/meta/countries` (or a static JSON snapshot of `umpirsky` data).

### Dead public views (do NOT port)
`quotes/index_working.blade.php` (Tailwind/Alpine backup), `quotes/latest/*` (10-file unrouted Tailwind/Alpine redesign prototype — **check with product**: it may be the intended future design and a better visual target for the React rebuild), `quotes/quotes.blade.php` (0 bytes), `components/step-indicator` (only used by dead view), `welcome.blade copy.php`, `index.blade(1).php`, `#box-details-wrapper` static block (`quotes/index.blade.php:1458-1505`), dead `QuoteWizardManager` in quotes/index.

## Admin panel (details in the admin analysis; key mappings)

| Blade | Purpose / notable | React target |
|---|---|---|
| `Admin/Layouts/*` | Codebase shell; sidebar links: Dashboard, Quotes, Services, "FedEx Markup" (settings), Vendors ▸ (List/Map/Types) (`sidebar.blade.php:175-240`); header has hardcoded demo "J. Smith" + dead template links — strip | `<AdminLayout>` + `<Sidebar>` (React Router NavLink), `<Header>` with real user menu |
| `Admin/dashboard/index` | stub `<h1>` | stub page |
| `Admin/quotes/index` | serverSide DataTable → same URL; filters status/package_type/dates/countries; inline status dropdown → `PATCH …/status` with reload; Codebase notify toasts | `<QuotesListPage>` = `<ServerDataTable>` (TanStack Table + react-query) + `<StatusDropdown>` |
| `Admin/quotes/show` | PHP splits package_type CSV (:6-26); cards for packages/location/contact/email stats; **FedEx rates panel**: params form (packaging_type, pickup_type, ship_date, is_residence) → vanilla `fetch` GET `…/fedex-rates` (:342-415) → rates table (live rate w/ markup, retail, savings); `<x-cft-calculator/>` (Alpine CFT/volume calculator) | `<QuoteDetailPage>` + `<FedExRatesPanel>` + `<CftCalculator>` (port Alpine x-data → useState) |
| `Admin/settings/index` | single number input form, session flash | `<FedExMarkupPage>` |
| `Admin/services/*` | DataTable + detail-modal loading **rendered HTML partial** (`GET /admin/services/{id}` :252-257) + SweetAlert2 delete (hidden form POST `_method=DELETE`); create/edit forms with client auto-slug + jQuery validation | `<ServicesListPage>`, `<ServiceForm>`, `<ServiceDetailModal>` (JSON, not HTML) |
| `Admin/vendor-types/*` | plain `@forelse` table (no DataTable) + modals + validator.js char counter | `<VendorTypesListPage>`, `<VendorTypeForm>` |
| `Admin/vendors/index` | serverSide DataTable; filters (status/type/country/dates fed by controller); view modal (HTML partial), toggle-status, SweetAlert2 delete | `<VendorsListPage>` |
| `Admin/vendors/create` | big form; hardcoded country-code list (+1…+61) and 11-country list; validator.js | `<VendorForm>` (share with edit) |
| `Admin/vendors/edit` (3,091 lines) | **4 Codebase tabs**: Details (PUT form, stash/restore across tab switches) / Comments (DataTable + count badges + CSV export via window.open + form/detail modals, 5000-char counter) / Contacts (DataTable + form/detail modals, jQuery phone mask `(000) 000-0000`, toggle, swal delete) / Services (`<x-service-assignment-tab>`: debounced search, status+assignment filters, card grid, select-all, single+bulk assign/unassign each behind swal confirm). Full AJAX inventory in `02-routes.md` | `<VendorEditPage>` with `<VendorDetailsTab>`, `<CommentsTab>`, `<ContactsTab>`, `<ServicesTab>` (`<ServiceAssignmentGrid>`) |
| `Admin/vendors/map` (1,278 lines) | **Leaflet + markercluster** (maxClusterRadius 50, spiderfy), OSM tiles; reload on `moveend` (300ms debounce); radius circle w/ mi↔km; name autocomplete (min 2 chars); address geocode; rich empty states; **client-side** DataTable list toggle with `map.invalidateSize()` | `<VendorMapPage>` (react-leaflet + cluster plugin — keep Leaflet, it's the one CDN lib worth keeping) |
| `Admin/vendor-contacts/show`, `vendor-comments/show`, `vendors/show`, `services/show` | modal-body **HTML partials** returned over AJAX | delete; replace with JSON + client modal rendering |
| `auth/login`, `forgot-password`, `reset-password` | standalone Codebase pages; forgot/reset contain duplicate dead Breeze blocks after `</html>` | `<LoginPage>`, `<ForgotPasswordPage>`, `<ResetPasswordPage>` |
| `profile/edit` + partials, `dashboard` | Breeze x-components + Alpine toast; `layouts/app.blade.php` **is missing its `@vite` call** (existing bug — profile pages served through it get no Tailwind) | `<ProfilePage>` (info/password/delete sections) |
| `emails/quote-confirmation` (226), `emails/quote-admin-notification` (206) | self-contained HTML docs, `<style>` in head, 600px, red #DC2626 header; PHP prelude splits package CSV; fallbacks `$quote->name ?? $quote->contact->name`; **tracking pixel :224** (confirmation only) | react-email/MJML/template-literal render in the Node mailer — keep pixel + structure |

## Server-rendered data → API/props map

| Blade variable | Source | React replacement |
|---|---|---|
| `$countries` (welcome, quotes.index via composer) | CountryListService | `GET /api/meta/countries` (cache-forever header) or build-time JSON |
| `$selectedFromCountry/$selectedToCountry` | query params normalized server-side | read `useSearchParams()`, normalize client-side (port `normalizeCode`) |
| `$postalValidationEnabled` | config | `GET /api/meta/config` (public flags only) or embed at build |
| `$quote` + relations (admin show) | controller eager-load | `GET /api/admin/quotes/:id` (include contact, packages, emailStatistic) |
| `$vendorTypes`, `$countries` filter lists (vendors index/create/edit) | controllers | `GET /api/admin/vendor-types?status=active`, `GET /api/admin/vendors/filter-options` |
| `$initialBounds`, `$vendorTypes` (map) | VendorMapService | `GET /api/admin/vendors/map/bootstrap` |
| `$markup` (settings) | Setting::get | `GET /api/admin/settings` |
| `$user`, `auth()->user()` in layouts | session | JWT claims + `GET /api/me` |
| `session('success')` flashes, `$errors` bags | session | react-query mutation results → toast component; 422 JSON → form errors |
| `csrf_token()` / meta tag | Blade | gone (JWT header); public endpoints rely on rate limits (see R16) |

## Blade directive → React mapping (directives actually found)

`@if/@else/@foreach/@forelse` → JSX conditionals/`.map()` · `@include` → child component · `<x-*>` + `@props` + `{{ $slot }}` → components + props + `children` · `@error`/`$errors` → form-state errors (react-hook-form) · `@csrf`/`@method` → obsolete · `@json($x)` → props/loader data · `@vite` → Vite React entry · `@push('scripts')` → component-level imports · `@extends/@section` → layout routes/outlets · `@auth` → auth context · `@selected` → controlled `value`.

**Livewire: none. Inertia: none. Alpine: only Breeze scaffolding + dead prototypes + admin CFT calculator** — nothing architectural blocks a clean SPA.

## Consolidated React component tree

```
src/
├── app/ (router, providers: QueryClient, AuthContext, Toaster)
├── api/ (client.ts with JWT interceptor; quotes.ts, vendors.ts, services.ts, …)
├── hooks/ (useCountries, usePostalValidation, useChargeableWeight, useAuth)
├── components/shared/
│   ServerDataTable · StatusBadge · ConfirmDialog · Modal · FilterBar ·
│   FormField/TextInput/CountrySelect/PhoneInput · Toast · LoadingSpinner · EmptyState
├── pages/public/
│   HomePage (Hero+HeroQuoteTeaser, Steps, Features, WhyUs, Proofs, Faq, Cta)
│   QuotePage → QuoteWizard (WizardContext, StepIndicator, Step1Location,
│                Step2Package [PackageTypeCards, BoxRows, TvRows, AutoRows],
│                Step3Contact, WizardNav, FedExRatesResult)
│   ThankYouPage
├── pages/auth/ (Login, ForgotPassword, ResetPassword)
└── pages/admin/ (AdminLayout+Sidebar)
    DashboardPage · QuotesListPage · QuoteDetailPage(FedExRatesPanel, CftCalculator)
    FedExMarkupPage · ServicesListPage · ServiceForm
    VendorTypesListPage · VendorTypeForm
    VendorsListPage · VendorForm · VendorEditPage(DetailsTab, CommentsTab, ContactsTab, ServicesTab)
    VendorMapPage(VendorMap[react-leaflet], RadiusControls, AddressSearch, NameAutocomplete, VendorListTable)
    ProfilePage
```

Libraries to drop: jQuery, select2, DataTables JS, SweetAlert2, validator.js, jQuery Mask, AOS, Alpine, Bootstrap, Codebase theme. Keep/replace: Leaflet → react-leaflet; Tailwind stays as the styling system (already half-adopted). One design decision up front: restyle admin from Codebase to Tailwind during the port (recommended) vs pixel-copying Codebase CSS.
