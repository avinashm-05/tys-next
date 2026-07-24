# 00 — Overview

> Migration blueprint for **TYS Global Logistics** (tysgloballogistics.com), Laravel → React/TypeScript + Node/Express + Prisma.
> App root: `public_html/` (the Laravel app root is deployed **as** the web root on shared hosting — `index.php` and `.htaccess` live at app root, `require __DIR__ . '/vendor/autoload.php'` with no `/../`).

## Stack facts (verified from files)

| Fact | Value | Source |
|---|---|---|
| Laravel version | **v12.40.2** (constraint `^12.0`) | `composer.lock`, `composer.json:14` |
| PHP version | `^8.2` | `composer.json:12` |
| Package managers | Composer + npm (`package-lock.json` present) | root |
| **DB engine** | **MySQL** (`DB_CONNECTION=mysql`, port 3306, db `import_export`) → **Prisma must target MySQL** | `.env`, `.env.example:23-28`, `config/database.php:19` |
| Test DB | SQLite `:memory:` | `phpunit.xml` |
| Session / Queue / Cache | all **`database`** driver | `.env:30,38,40` |
| Mail | SMTP config, `log` mailer by default | `.env.example:50-57` |
| Frontend build | Vite 7 + Tailwind 3 + Alpine.js 3 + axios (`resources/js/app.js` boots Alpine) | `package.json`, `vite.config.js` |
| Auth | **Session-based** (custom Breeze-style controllers). **No Sanctum, no Passport, no Fortify/Jetstream** | `composer.json`, `app/Http/Controllers/Auth/*` |
| Timezone | `UTC` | `config/app.php:68` |
| String length default | `Schema::defaultStringLength(191)` — all `string()` columns without explicit length are **varchar(191)** | `app/Providers/AppServiceProvider.php:28` |

## What the app does (plain English)

Public-facing **international shipping quote site** plus an internal **admin panel**:

1. **Public quote wizard** (`/quotes`): a visitor picks origin/destination country + zip, selects one or more package types (envelope, boxes, television, furniture, auto), enters per-package details (dimensions, weight → "chargeable weight" is computed as max(actual, dimensional weight)), and leaves contact info. Submission stores the quote + package rows + contact, queues a confirmation email to the customer and a notification email to admins, and — for **US-domestic shipments** — calls the **FedEx Rates API** live and shows priced service options (with a configurable admin markup %). Zip codes can be validated live against the **FedEx postal-validation API**.
2. **Email open tracking**: quote emails embed a 1×1 GIF pixel (`/email/track/{token}`); opens are counted per quote and shown in the admin.
3. **Admin panel** (`/admin/...`, session login, role check via `user_types`): dashboards; quotes list (server-side DataTables) with status workflow (pending→quoted→accepted/cancelled), detail view with live FedEx re-rating; CRUD for **services**, **vendor types**, **vendors** (with EIN/SSN, addresses, auto-**geocoding** via OpenStreetMap Nominatim through a model observer), nested **vendor contacts** (soft-deleted) and **vendor comments** (categorized/prioritized, CSV export), **vendor⇄service assignment** (pivot with audit columns, bulk ops), and a **vendor map** (bounds/radius/name search over geocoded vendors); a **settings** page holding the FedEx markup percentage.
4. **CLI**: `app:create-admin-user`, `vendors:geocode` (batch geocoding). No cron schedule is defined.

## Directory census (counted from disk)

| Artifact | Count | Notes |
|---|---|---|
| Route files | 3 (`web.php`, `admin.php`, `console.php`) | **No `api.php`** — all AJAX runs over web routes with session+CSRF |
| Routes | ~17 web + 46 admin (see `02-routes.md`) | web.php lines 54-59 duplicate 4 admin routes — shadowed dead code |
| Controllers | 16 + base `Controller` | 10 admin, 3 auth, 3 public |
| Models | 13 | incl. 1 custom Pivot (`VendorService`) |
| Migrations | 18 | one table (`packages`) is **orphaned** — see risks |
| FormRequests | 21 | + 2 custom Rules |
| Custom middleware | **0** | only CSRF-except config in `bootstrap/app.php:18-20` |
| Jobs | 1 (`SendQuoteConfirmationEmail`) | database queue |
| Events / Listeners | 0 custom | 1 model Observer (`VendorObserver`) |
| Console commands | 2 | |
| Services | 11 classes (`app/Services`, incl. 4 FedEx) + 1 Support helper | `QuoteGenerator` + `ExportService`/`QuotesExport` are **dead code** (only tests reference them) |
| DataTables classes | 5 (yajra server-side) | |
| Enums | 9 (PHP 8.1 backed enums) | |
| Blade views | 78 | ~18k lines in top-10 files; `quotes/index.blade.php` alone is 6,593 lines |
| Mailables | 2 | |
| Tests | **86 files / ~522 test methods** (Feature, Unit, Property) | PHPUnit 11; they die with the PHP app — behavior must be re-encoded |

### Legacy/dead artifacts in the repo (do NOT migrate)

- `tys.zip` (263 MB backup), `tys/tys/tys/…` (nested old git repo copy), `public_v1_working/` (old public dir), `theme/` (purchased HTML admin/site template demo pages), `frontend/assets_v1/`, `resources/views/quotes/index_working.blade.php`, `index.blade(1).php`, `welcome.blade copy.php`, `Untitled-4.html`, `scratch_*.html`, `00 donotdelete/` (env+htaccess backups), various `ANIMATION_*.md` docs.

## Size rating: **M (medium)**

Small domain (2 aggregates: Quotes, Vendors), but with heavy edges: a 6.6k-line wizard view, a 3.1k-line vendor-edit view, FedEx integration, geocoding, server-side DataTables protocol, email tracking. Backend logic is straightforward CRUD + 2 real algorithms (chargeable weight, FedEx payload building/parsing).

## The 5 hardest things to migrate

1. **The public quote wizard** (`resources/views/quotes/index.blade.php`, 6,593 lines): multi-step, multi-package-type conditional UI with inline JS, live chargeable-weight AJAX, live postal validation, FedEx rate display after submit. This is the revenue path; it must be pixel/behavior-faithful. (See `07-frontend.md`.)
2. **FedEx rate quoting** (`app/Services/FedEx/FedExRateQuoteService.php`, 529 lines): package line-item construction (weight chunking at 150 lb, kg→lb, per-type defaults from config), ACCOUNT vs LIST rate parsing across multiple response shapes, markup from DB settings. Must be ported verbatim + verified against recorded FedEx fixtures.
3. **Server-side DataTables protocol** (5 yajra classes + HTML-string columns): admin tables send `draw/start/length/search/order` params and receive **HTML strings** for badge/action columns. Decide: re-implement the protocol in Express, or (recommended) replace with a JSON API + TanStack Table in React — that touches every admin list page.
4. **Vendor geocoding side-effect chain** (`VendorObserver` → `GeocodingService`): synchronous Nominatim calls (4 fallback strategies × 3 retries, 1 req/s etiquette, 30-day cache, `updateQuietly` to avoid recursion) fire inside the vendor create/update request. Node must replicate the trigger conditions (only when address fields changed) without the ORM-event magic — and decide sync vs queued.
5. **Implicit Laravel behaviors spread everywhere**: route-model binding (404s, soft-delete exclusion), `casts()` (backed enums, `decimal:2` → *strings* in JSON, JSON columns, `hashed` password), CSV `package_type` queried with MySQL `FIND_IN_SET`, Haversine `HAVING distance` raw SQL, session flash messages, per-route throttling. Each is inventoried in `03-logic.md` / `10-risks.md`.
