# 08 — Dependencies, Config, External Services

## composer.json → npm

| Composer package | Used for | npm equivalent |
|---|---|---|
| `laravel/framework ^12.0` (v12.40.2) | everything | Express 4/5 + the module set below |
| `dompdf/dompdf ^3.1` | only via maatwebsite/excel PDF export in **dead** `ExportService` | **skip** (if revived: `puppeteer` or `pdf-lib`) |
| `maatwebsite/excel ^3.1` | **dead** `QuotesExport` (tests only) | **skip** (if revived: `exceljs`) |
| `umpirsky/country-list ^2.0` | ISO code→name map (`CountryListService.php:20`) | `world-countries` or `i18n-iso-countries` (verify name spellings match — the wizard displays them) |
| `yajra/laravel-datatables-oracle ^12.0` + `-html ^12.0` | server-side DataTables (5 classes) | **NO direct equivalent — needs custom work**: either implement the DataTables server protocol in Express, or (recommended) plain paginated JSON + TanStack Table |
| `laravel/tinker` (dev) | REPL | `node --experimental-repl-await` / `tsx` scratchpads |
| `fakerphp/faker` (dev) | factories | `@faker-js/faker` |
| `phpunit/phpunit ^11.5` (dev) | 86 test files | `vitest` + `supertest` (+ Playwright for the wizard E2E) |
| `laravel/pint` (dev) | code style | `prettier` + `eslint` |
| `laravel/sail`, `laravel/pail`, `laravel/boost`, `nunomaduro/collision`, `mockery/mockery` (dev) | tooling | docker-compose, `pino-pretty`, —, —, vitest mocks |

## package.json (current) → new stack

| Current | Fate |
|---|---|
| `alpinejs` | dropped (React) |
| `axios` | keep (or fetch wrapper) |
| `tailwindcss` 3 + `@tailwindcss/forms` + `autoprefixer`/`postcss` | keep — note `head.blade.php` loads `@tailwindcss/vite` (v4 plugin) while package.json pins tailwind 3; pick Tailwind 4 cleanly in the new repo |
| `laravel-vite-plugin`, `concurrently`, `terser` | replaced by standard Vite React config |
| CDN libs (jQuery 3.2.1/3.7.1, select2, Bootstrap 5.1.3, DataTables 1.13.7, SweetAlert2 11, validator.js 13.11, jQuery Mask, AOS, Font Awesome 6.4, Leaflet 1.9.4 + markercluster 1.5.3) | all dropped except **Leaflet** → `react-leaflet` + `react-leaflet-cluster`; icons → `lucide-react` or keep FA |

**New backend deps**: `express`, `prisma`/`@prisma/client`, `zod`, `jsonwebtoken`, `bcryptjs`, `bullmq`, `ioredis`, `nodemailer`, `pino`, `rate-limiter-flexible` (or `express-rate-limit` + redis store), `slugify`, `dayjs`, `dotenv`/`zod`-validated config, `supertest`+`vitest` (dev), `tsx` (dev).

## Every env/config value the app actually reads → target config

| Laravel env/config | Read at | Target env |
|---|---|---|
| `APP_NAME` | mail from-name, Nominatim User-Agent (`GeocodingService.php:159`), admin email footer | `APP_NAME` |
| `APP_URL` (`https://tysgloballogistics.com` in prod .env) | `route()` URL generation (tracking pixel URL!) | `APP_URL` |
| `APP_ENV`, `APP_DEBUG`, `APP_KEY` | framework (⚠️ prod .env has `APP_ENV=local`, `APP_DEBUG=true` — fix at cutover) | `NODE_ENV`; APP_KEY not needed (no encrypted cookies) unless decrypting old data (none found) |
| `APP_TIMEZONE` = UTC (hardcoded config) | all timestamps | run Node with `TZ=UTC`; store/format in UTC |
| `BCRYPT_ROUNDS=12` | password hashing | `BCRYPT_ROUNDS=12` |
| `DB_CONNECTION/HOST/PORT/DATABASE/USERNAME/PASSWORD` (mysql / import_export) | Eloquent | `DATABASE_URL=mysql://…` (Prisma) |
| `SESSION_*` | session auth | dropped (JWT) → `JWT_SECRET`, `JWT_ACCESS_TTL`, `REFRESH_TTL` |
| `QUEUE_CONNECTION=database` | jobs | `REDIS_URL` (BullMQ) |
| `CACHE_STORE=database` | FedEx token, geocode, countries | `REDIS_URL` |
| `MAIL_MAILER/SCHEME/HOST/PORT/USERNAME/PASSWORD/FROM_*` | Nodemailer | `SMTP_*`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` |
| `ADMIN_NOTIFICATION_EMAILS` (comma-separated) | `config/mail.php:129` → SendQuoteConfirmationEmail | `ADMIN_NOTIFICATION_EMAILS` (keep CSV parsing + trim + filter) |
| `FEDEX_CLIENT_ID` / `FEDEX_CLIENT_SECRET` / `FEDEX_ACCOUNT_NUMBER` | FedEx OAuth + rates | same names |
| `FEDEX_SANDBOX` (currently true!) + `FEDEX_BASE_URL` (sandbox default) | client base URL | `FEDEX_BASE_URL` (+ document that prod needs `https://apis.fedex.com`) |
| `FEDEX_CARRIER_CODE=FDXG`, `FEDEX_LOCALE=en_US`, `FEDEX_PICKUP_TYPE=DROPOFF_AT_FEDEX_LOCATION`, `FEDEX_MAX_PARCEL_WEIGHT_LB=150`, `FEDEX_ENABLED`, `FEDEX_POSTAL_VALIDATION_ENABLED` (**false in prod .env**, true in .env.example) | `config/fedex.php` | same names; also port the static config: token TTL buffer 60s, endpoints `country/v1/postal/validate` + `rate/v1/rates/quotes`, `rate_request_types=[ACCOUNT,LIST]`, and the **package_defaults table** (envelope 1lb 12×9×1 FEDEX_ENVELOPE; furniture 80lb 48×24×24; auto 120lb 60×24×18 — `config/fedex.php:24-46`) as code constants |
| `LOG_*` | logging | pino level config |
| `AWS_*`, `MEMCACHED_HOST`, `REDIS_*` (phpredis) | **unused by app code** (config only; no Storage:: usage) | drop AWS; REDIS_URL is new-stack real |
| `VITE_APP_NAME` | vite | Vite env |
| `datatables/excel config files` | vendor defaults, unused customization | drop |

## External services

| Service | Usage | Target |
|---|---|---|
| **FedEx REST API** | OAuth2 client-credentials (`/oauth/token`); `POST country/v1/postal/validate`; `POST rate/v1/rates/quotes`; sandbox + prod hosts | No official Node SDK worth using — port the existing thin client (`integrations/fedex/*`), keep the 401-retry-once behavior and 15s timeouts. **Credentials currently point at sandbox** — confirm prod keys exist before cutover |
| **OpenStreetMap Nominatim** | free geocoding (search + reverse), custom User-Agent, 1 req/s etiquette, 30-day cache | same endpoints via fetch; **must keep UA + rate limit + caching** (usage-policy compliance) — or budget a swap to a paid geocoder (decision) |
| **OSM tile server** | Leaflet tiles in admin map | keep (attribution required) |
| SMTP provider | quote emails | Nodemailer — **confirm actual prod SMTP creds**; current `.env` in repo has MAIL_MAILER unset beyond example values |
| ~~S3 / SMS / payments~~ | none found in code | — |

## Hosting note
Current deploy is **cPanel-style shared hosting with the Laravel root as the web root** (custom `index.php` + `.htaccess` at `public_html/`). The target stack (Node + Redis + long-running worker + websockets-capable proxy) generally **does not fit classic shared hosting** — plan a VPS/containers/managed platform, which also unlocks the Strangler-Fig reverse proxy in `09-plan.md`.
