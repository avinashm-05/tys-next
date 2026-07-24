# 09 — Migration Plan

## Strategy recommendation: **Strangler Fig** (lightweight variant)

Size is **M** (00-overview), so a big-bang is *feasible* (~6–9 dev-weeks single senior dev), but three facts tip it to Strangler Fig:

1. **Production is live and revenue-bearing** (the quote wizard emails real customers; tracking pixels in sent emails must keep resolving).
2. The domain splits into **two nearly independent aggregates** (public Quotes vs admin Vendors) sharing only `users` — ideal seams for per-module cutover.
3. The PHPUnit suite (~522 tests) dies with the PHP code; migrating module-by-module lets each Node module be verified against the still-running Laravel behavior (shadow traffic / response diffing) instead of trusting a full rewrite at once.

**Topology:** reverse proxy (nginx/Caddy) in front → routes cut over path-by-path from PHP-FPM to Node; **both stacks share the same MySQL database** (Prisma maps the existing schema; no schema changes until Laravel is retired). Requires leaving shared hosting first (see 08 hosting note) — Laravel runs fine on the new box under the proxy from day one.

Fallback if ops constraints forbid dual-running: staged big-bang with a feature-frozen Laravel and per-module API parity tests before one cutover weekend.

## Phase 0 — Foundations (blockers for everything)

| # | Work | Files/refs | Effort | Isolated testing |
|---|---|---|---|---|
| 0.1 | New infra: VPS/containers, nginx proxy (100% → Laravel initially), Redis, Node 22/Bun, CI | — | 2–3d | yes |
| 0.2 | **Prisma schema from production**: `prisma db pull`, reconcile against draft in `01-database.md` (191 vs 255 widths, orphaned `packages` table, quote_contacts uniqueness), commit baseline; NO migrations against prod yet | 01-database.md | 1–2d | yes (read-only) |
| 0.3 | Express skeleton: config loader (zod-validated env), pino, error handler (Laravel-style 422 shape), `/up` health, rate-limit middleware, soft-delete Prisma extension | 02/04 docs | 2d | yes |
| 0.4 | Test harness: vitest + supertest + mysql test db (or testcontainers); port the ~30 highest-value invariants from `tests/Property/*` (chargeable weight, postal formats, email tracking) as the new regression floor | tests/ | 2–3d | yes |

## Phase 1 — Auth (everything admin depends on it)

| # | Work | Refs | Effort | Blockers |
|---|---|---|---|---|
| 1.1 | JWT login/logout/refresh, bcrypt verify against existing hashes (`$2y$` check!), login rate limiter, role claims | 05-auth | 2–3d | 0.* |
| 1.2 | `requireAdmin` middleware + policy stub; **decision R19** (tighten admin GETs?) | 05-auth | 0.5d | 1.1 |
| 1.3 | Forgot/reset password flow + Nodemailer wiring | 05/06 | 1–2d | 1.1 |
| 1.4 | React: Login/Forgot/Reset/Profile pages + auth context | 07 | 2d | 1.1 |

*Strangler note:* JWT and Laravel sessions coexist fine — Node handles `/api/*`, Laravel keeps serving its Blade pages until each module's frontend flips.

## Phase 2 — Shared core services (pure, highly testable)

| # | Module | Source | Effort |
|---|---|---|---|
| 2.1 | `chargeableWeight.ts` (divisors 139/5000) | ChargeableWeightCalculator + property tests | 0.5d |
| 2.2 | `postalCode.ts` + `countries.ts` (normalizeCode) | PostalCodeFormat, CountryListService | 0.5d |
| 2.3 | FedEx integration: auth (Redis token cache + single-flight), client (401-retry), postal validation, **rate quote service (port verbatim; fixture tests from `tests/Unit/Services/FedEx/*`)** | 03-logic §C | 3–4d |
| 2.4 | Nominatim geocoding (fallback strategies, retries, 30d Redis cache, 1 rps) | GeocodingService | 1–2d |
| 2.5 | Mailer + 2 email templates + BullMQ `emails` queue + worker | 06-jobs | 2d |
| 2.6 | Settings module (`GET/PUT /api/admin/settings`) — tiny, unblocks FedEx markup | SettingController | 0.5d |

All isolated-testable; none require cutover.

## Phase 3 — Leaf admin modules (fewest dependents first) — each is an independent cutover slice

Order chosen so each slice ships API + React page together and flips at the proxy:

| # | Module | Endpoints (02-routes) | Depends on | Effort | Notes |
|---|---|---|---|---|---|
| 3.1 | **Vendor Types** | 7 routes | auth | 1.5d | simplest full CRUD; establishes ServerDataTable-less list, forms, delete-guard pattern |
| 3.2 | **Services** | 7 routes | auth | 2d | adds auto-slug hook, ServerDataTable pattern, detail modal as JSON |
| 3.3 | **Settings page** | 2 routes | 2.6 | 0.5d | |
| 3.4 | **Vendors core** (list/create/edit-details/show/toggle/delete) | 8 routes | 3.1, 2.4 (geocode hook) | 3–4d | geocode side-effect: **decision R9** sync vs queued |
| 3.5 | **Vendor contacts + comments** (tabs) | 16 routes | 3.4 | 3d | soft deletes, scoped uniqueness, CSV export, count badges |
| 3.6 | **Vendor⇄service assignment** (tab) | 6 routes | 3.2+3.4 | 2d | transactions, bulk ops |
| 3.7 | **Vendor map** | 6 routes | 3.4 | 2–3d | react-leaflet; raw-SQL radius query |
| 3.8 | **Admin dashboard shell + sidebar** | 1 route | 1.4 | 1d | can ship with 3.1 |

## Phase 4 — The public quote flow (highest risk — do LAST of the backend, with shadow verification)

| # | Work | Effort | Notes |
|---|---|---|---|
| 4.1 | `POST /api/quotes` (store: normalization, package_details rows, totals, contact, tracking token, email job, FedEx rates) + calculate + validate-postal | 3–4d | shadow-run: mirror prod POSTs to Node (read-only mode: skip writes/emails) and diff JSON vs Laravel before flipping |
| 4.2 | Email tracking `GET /email/track/{token}` | 0.5d | trivial but must keep exact URL; flip early or late — it's stateless |
| 4.3 | Admin quotes module (list DataTable-replacement, show, status, live FedEx re-rate) | 3d | after 2.3 |
| 4.4 | **React QuoteWizard** (single implementation replacing both divergent copies) + HomePage marketing sections + ThankYou | 5–8d | product decision: 3-step vs 4-step layout; consider adopting the `quotes/latest` visual design |
| 4.5 | Cutover `/` + `/quotes` at the proxy; monitor quote volume + email delivery + FedEx success rate | 1d + soak | keep Laravel on standby path for instant rollback |

## Phase 5 — Retire Laravel

Drain `jobs` table; flip remaining paths; remove PHP vhost; drop `sessions`/`cache`/`jobs` tables after a grace period; archive the repo cruft (tys.zip, theme/, public_v1_working/); only now consider schema cleanups (drop orphaned `packages` table — after verifying it's empty in prod, R2).

## Dependency graph (summary)

```
0 infra ─► 1 auth ─► 3.1 vendor-types ─► 3.4 vendors ─► 3.5 contacts/comments
        └► 2 core services ─► 3.2 services ─────────────► 3.6 assignment
             │        └► 2.6/3.3 settings                └► 3.7 map
             └► 2.3 FedEx + 2.5 mail ─► 4.1 quote store ─► 4.4 wizard ─► 4.5 cutover
                                      └► 4.3 admin quotes
```

**Total rough effort: ~40–55 dev-days** for one experienced dev (backend+frontend), excluding product/design decisions and soak time.

## Standing decisions needed from the owner before Phase 3/4 (full list in 10-risks)
1. Tighten admin authorization (R19) or replicate as-is?
2. Geocoding: keep synchronous in-request or move to queue (R9)?
3. DataTables protocol: reimplement or replace with TanStack Table (recommended)?
4. Wizard: 3-step vs 4-step vs `quotes/latest` redesign (R-wizard)?
5. Keep `packages` orphan table / dead services (`QuoteGenerator`, `ExportService`) buried, or delete?
6. Public endpoint abuse protection after CSRF removal (R16): rate limits only, or add captcha/origin checks?
