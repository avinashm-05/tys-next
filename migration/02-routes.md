# 02 — Routes

Sources: `routes/web.php`, `routes/admin.php` (required at `web.php:61`), `routes/console.php` (no HTTP routes; only the sample `inspire` command — **no scheduler entries**). There is **no `routes/api.php`** — every AJAX call is a session-authenticated web route with CSRF.

Global middleware notes:
- All routes are in the `web` group (session, cookies, **CSRF**). CSRF is disabled only for `/email/track/*` (`bootstrap/app.php:18-20`).
- `auth` middleware = session guard `web`; unauthenticated → redirect to `login` route.
- **There is no `admin`/role middleware.** Admin protection = `auth` + per-request `isAdmin()` checks inside FormRequests (writes) and two controllers (contact/comment index). Several admin GETs have **no role check at all** (see 10-risks R19).
- `throttle:X,1` = X requests/minute per user-or-IP → map to `express-rate-limit` keyed the same way.
- Route model binding: `{quote}`, `{service}`, `{vendor_type}`, `{vendor}`, `{contact}`, `{comment}` are implicit Eloquent bindings → 404 when missing; **soft-deleted contacts/comments 404 automatically**. Express must replicate (`prisma.findUnique` + 404 + `deletedAt: null` filter).

## Public routes (web.php)

| # | Method | URI | Name | Middleware | Handler | Express target |
|---|---|---|---|---|---|---|
| 1 | GET | `/` | home | web | closure → view `welcome` | React route `/` (static page; countries from `GET /api/meta/countries`) |
| 2 | GET | `/email/track/{token}` | email.track | web (CSRF-exempt) | `EmailTrackingController@track` | `GET /email/track/:token` (Express, returns GIF) — **keep exact URL: it is baked into already-sent emails** |
| 3 | GET | `/quotes` | quotes.index | web | `QuoteController@index` | React route `/quotes`; data: `GET /api/meta/countries`, config flag |
| 4 | GET | `/thank-you` | quotes.thank-you | web | `QuoteController@thankYou` | React route `/thank-you?name=` |
| 5 | POST | `/quotes` | quotes.store | web, **throttle:10,1** | `QuoteController@store` | `POST /api/quotes` (rate-limit 10/min) |
| 6 | POST | `/quotes/calculate` | quotes.calculate | web, **throttle:60,1** | `QuoteController@calculate` | `POST /api/quotes/calculate` (60/min) |
| 7 | POST | `/quotes/validate-postal` | quotes.validate-postal | web, **throttle:30,1** | `QuoteController@validatePostal` | `POST /api/quotes/validate-postal` (30/min) |
| 8 | GET | `/dashboard` | dashboard | auth, **verified** | closure → view `dashboard` | React `/dashboard` (JWT) — note `verified` is a no-op today (User ≠ MustVerifyEmail) |

### Auth (guest group, web.php:35-44)

| Method | URI | Name | Handler | Express target |
|---|---|---|---|---|
| GET | `/login` | login | `Auth\LoginController@create` (view) | React `/login` |
| POST | `/login` | — | `Auth\LoginController@store` (5-attempt limiter by email+IP, session regenerate, **role-based redirect**: super-admin/admin→admin.dashboard, else→dashboard) | `POST /api/auth/login` → JWT; client redirects by role |
| GET | `/forgot-password` | password.request | `ForgotPasswordController@create` | React `/forgot-password` |
| POST | `/forgot-password` | password.email | `ForgotPasswordController@store` (Password broker) | `POST /api/auth/forgot-password` |
| GET | `/reset-password/{token}` | password.reset | `ResetPasswordController@create` | React `/reset-password/:token?email=` |
| POST | `/reset-password` | password.update | `ResetPasswordController@store` | `POST /api/auth/reset-password` |

### Authenticated user (web.php:46-52)

| Method | URI | Name | Handler | Express target |
|---|---|---|---|---|
| POST | `/logout` | logout | `LoginController@destroy` | `POST /api/auth/logout` (client token discard / server denylist) |
| GET | `/profile` | profile.edit | `ProfileController@edit` | React `/profile` + `GET /api/me` |
| PATCH | `/profile` | profile.update | `ProfileController@update` (email change clears email_verified_at) | `PATCH /api/me` |
| DELETE | `/profile` | profile.destroy | `ProfileController@destroy` (validates `current_password`, logs out, deletes user) | `DELETE /api/me` |

### ⚠️ Shadowed duplicate block — `web.php:54-59`

`web.php` re-declares `admin/dashboard`, `admin/quotes`, `admin/quotes/{quote}`, `admin/quotes/{quote}/status` **before** requiring `admin.php`. Two bugs make it dead code: (a) `DashboardController` is not imported there, so `DashboardController::class` resolves to the bare string `"DashboardController"`; (b) `QuoteController` there is the **public** one. Because `admin.php` registers identical method+URI afterwards, Laravel's RouteCollection **replaces** the earlier entries, so `admin.php` wins. **Do not port this block.** (Risk R5.)

## Admin routes (admin.php) — all inside `Route::middleware('auth')->prefix('admin')->name('admin.')`

| Method | URI | Name (admin.*) | Middleware extra | Handler (Admin\) | Express target (`/api/admin/...`, JWT + requireAdmin) |
|---|---|---|---|---|---|
| GET | admin/dashboard | dashboard | — | `DashboardController@index` (static view) | React page only |
| GET | admin/quotes | quotes.index | — | `QuoteController@index` → QuotesDataTable (HTML or DataTables JSON if `X-Requested-With`) | `GET /api/admin/quotes` (paginated JSON; filters: status, package_type, from/to_date, from/to_country) |
| GET | admin/quotes/{quote} | quotes.show | — | `QuoteController@show` (loads contact, packages, emailStatistic) | `GET /api/admin/quotes/:id` |
| PATCH | admin/quotes/{quote}/status | quotes.updateStatus | — | `QuoteController@updateStatus` (UpdateQuoteStatusRequest) | `PATCH /api/admin/quotes/:id/status` |
| GET | admin/quotes/{quote}/fedex-rates | quotes.fedex-rates | — | `QuoteController@getFedExRates` (live FedEx re-rate; accepts unvalidated overrides — see R27) | `GET /api/admin/quotes/:id/fedex-rates` |
| GET | admin/settings | settings.index | — | `SettingController@index` | `GET /api/admin/settings` |
| POST | admin/settings | settings.store | — | `SettingController@store` (inline validation) | `PUT /api/admin/settings` |
| GET | admin/services | services.index | — | `ServiceController@index` → ServicesDataTable | `GET /api/admin/services` |
| GET | admin/services/create | services.create | — | view | React page |
| POST | admin/services | services.store | — | `ServiceController@store` (ServiceStoreRequest) | `POST /api/admin/services` |
| GET | admin/services/{service} | services.show | — | `ServiceController@show` (modal HTML) | `GET /api/admin/services/:id` |
| GET | admin/services/{service}/edit | services.edit | — | view | React page |
| PUT | admin/services/{service} | services.update | — | `ServiceController@update` | `PUT /api/admin/services/:id` |
| DELETE | admin/services/{service} | services.destroy | — | `ServiceController@destroy` (hard delete) | `DELETE /api/admin/services/:id` |
| GET | admin/vendor-types | vendor-types.index | — | `VendorTypeController@index` (no DataTable — plain list) | `GET /api/admin/vendor-types` |
| GET | admin/vendor-types/create | vendor-types.create | — | view | React page |
| POST | admin/vendor-types | vendor-types.store | — | store (VendorTypeStoreRequest) | `POST /api/admin/vendor-types` |
| GET | admin/vendor-types/{vendor_type} | vendor-types.show | — | show (loads vendors) | `GET /api/admin/vendor-types/:id` |
| GET | admin/vendor-types/{vendor_type}/edit | vendor-types.edit | — | view | React page |
| PUT | admin/vendor-types/{vendor_type} | vendor-types.update | — | update | `PUT /api/admin/vendor-types/:id` |
| DELETE | admin/vendor-types/{vendor_type} | vendor-types.destroy | — | destroy (**refuses if vendors exist** — port this guard) | `DELETE /api/admin/vendor-types/:id` |
| GET | admin/vendors/map | vendors.map.index | — | `VendorMapController@index` (view + vendorTypes + initialBounds) | React page + `GET /api/admin/vendors/map/bootstrap` |
| POST | admin/vendors/map/bounds | vendors.map.bounds | throttle:60,1 | `getVendorsInBounds` (inline validation) | `POST /api/admin/vendors/map/bounds` |
| POST | admin/vendors/map/search | vendors.map.search | throttle:60,1 | `searchByName` | `POST /api/admin/vendors/map/search` |
| POST | admin/vendors/map/radius | vendors.map.radius | throttle:60,1 | `searchByRadius` (raw Haversine) | `POST /api/admin/vendors/map/radius` |
| GET | admin/vendors/map/{vendor}/details | vendors.map.details | — | `getVendorDetails` | `GET /api/admin/vendors/:id/map-details` |
| POST | admin/vendors/map/geocode | vendors.map.geocode | throttle:10,1 | `geocodeAddress` (Nominatim) | `POST /api/admin/geocode` |
| GET | admin/vendors | vendors.index | — | `VendorController@index` → VendorsDataTable | `GET /api/admin/vendors` |
| GET | admin/vendors/create | vendors.create | — | view (active vendor types) | React page |
| POST | admin/vendors | vendors.store | — | store (VendorStoreRequest; sets added_by; triggers geocoding observer) | `POST /api/admin/vendors` |
| GET | admin/vendors/{vendor} | vendors.show | — | show (modal HTML) | `GET /api/admin/vendors/:id` |
| GET | admin/vendors/{vendor}/edit | vendors.edit | — | view (vendor + types) | React page |
| PUT | admin/vendors/{vendor} | vendors.update | — | update (geocodes if address changed) | `PUT /api/admin/vendors/:id` |
| PATCH | admin/vendors/{vendor}/toggle-status | vendors.toggleStatus | — | toggleStatus (returns JSON + badge HTML) | `PATCH /api/admin/vendors/:id/toggle-status` |
| DELETE | admin/vendors/{vendor} | vendors.destroy | — | destroy (**hard delete; dependency check is an unimplemented TODO** — `VendorController.php:241-243`) | `DELETE /api/admin/vendors/:id` |
| GET | admin/vendors/{vendor}/contacts | vendors.contacts.index | — | `VendorContactController@index` (AJAX-only DataTable JSON; inline isAdmin check) | `GET /api/admin/vendors/:id/contacts` |
| POST | admin/vendors/{vendor}/contacts | vendors.contacts.store | — | store (VendorContactStoreRequest, JSON) | `POST /api/admin/vendors/:id/contacts` |
| GET | admin/vendors/{vendor}/contacts/{contact} | vendors.contacts.show | — | show (modal HTML; validates contact∈vendor) | `GET .../contacts/:contactId` |
| GET | admin/vendors/{vendor}/contacts/{contact}/edit | vendors.contacts.edit | — | edit (JSON payload for modal) | `GET .../contacts/:contactId` (same endpoint) |
| PUT | admin/vendors/{vendor}/contacts/{contact} | vendors.contacts.update | — | update (JSON) | `PUT .../contacts/:contactId` |
| PATCH | admin/vendors/{vendor}/contacts/{contact}/toggle-status | vendors.contacts.toggleStatus | — | toggleStatus (JSON + badge HTML) | `PATCH .../contacts/:contactId/toggle-status` |
| DELETE | admin/vendors/{vendor}/contacts/{contact} | vendors.contacts.destroy | — | destroy (**soft delete**, redirect+flash) | `DELETE .../contacts/:contactId` |
| GET | admin/vendors/{vendor}/comments/export | vendors.comments.export | — | `VendorCommentController@export` (CSV download, filters category/priority/dates) | `GET .../comments/export` (CSV) |
| GET | admin/vendors/{vendor}/comments/count | vendors.comments.count | — | count (total + critical) | `GET .../comments/count` |
| GET | admin/vendors/{vendor}/comments | vendors.comments.index | — | index (AJAX-only DataTable JSON; inline isAdmin) | `GET .../comments` |
| POST | admin/vendors/{vendor}/comments | vendors.comments.store | — | store (JSON) | `POST .../comments` |
| GET | admin/vendors/{vendor}/comments/{comment} | vendors.comments.show | — | show (modal HTML) | `GET .../comments/:commentId` |
| GET | admin/vendors/{vendor}/comments/{comment}/edit | vendors.comments.edit | — | edit (JSON) | (merge with show) |
| PUT | admin/vendors/{vendor}/comments/{comment} | vendors.comments.update | — | update (JSON) | `PUT .../comments/:commentId` |
| DELETE | admin/vendors/{vendor}/comments/{comment} | vendors.comments.destroy | — | destroy (**soft delete**, redirect+flash) | `DELETE .../comments/:commentId` |
| GET | admin/vendors/{vendor}/services | vendors.services.index | — | `VendorServiceController@index` (JSON list + summary; `$vendorId` **not** model-bound — findOrFail) | `GET /api/admin/vendors/:id/services` |
| POST | admin/vendors/{vendor}/services/assign | vendors.services.assign | throttle:30,1 | assign (409 if already assigned) | `POST .../services/assign` |
| DELETE | admin/vendors/{vendor}/services/unassign | vendors.services.unassign | throttle:30,1 | unassign (409 if not assigned) | `DELETE .../services/unassign` |
| POST | admin/vendors/{vendor}/services/bulk-assign | vendors.services.bulk-assign | throttle:10,1 | bulkAssign (≤50, transaction) | `POST .../services/bulk-assign` |
| DELETE | admin/vendors/{vendor}/services/bulk-unassign | vendors.services.bulk-unassign | throttle:10,1 | bulkUnassign (≤50, transaction) | `DELETE .../services/bulk-unassign` |
| GET | admin/vendors/{vendor}/services/search | vendors.services.search | throttle:60,1 | search (paginated JSON) | `GET .../services/search` |

Route-ordering constraint preserved from `admin.php:44-45`: the `vendors/map/*` group must be registered **before** `vendors/{vendor}` so `map` isn't captured as a vendor id — in Express, declare `/vendors/map/...` routes before `/vendors/:id`.

## Behavioral notes for the Express port

- **Dual-mode endpoints**: `admin/quotes`, `admin/services`, `admin/vendors` return a full HTML page normally and DataTables JSON when `request()->ajax()` (X-Requested-With header). In the SPA these split naturally into React page + JSON API.
- **Content negotiation on quote store**: `POST /quotes` returns 201 JSON (with FedEx rates) when `expectsJson()`, else 302 redirect + session flash (`QuoteController@store:124-129`). The wizard uses the JSON path; keep only JSON in the new API but confirm no non-JS fallback traffic exists.
- **Redirect + flash** responses (services/vendors/vendor-types CRUD, comment/contact destroy) become JSON `{success, message}` + client-side toast/navigation.
- **HTML-fragment responses**: `vendors.show`, `services.show`, `contacts.show`, `comments.show` return Blade-rendered modal HTML; `toggleStatus` responses embed badge HTML. In React these become pure JSON + client rendering.
- **Health check**: Laravel exposes `/up` (`bootstrap/app.php:12`) — replicate as `GET /up`.
