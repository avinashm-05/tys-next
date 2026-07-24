# TYS Global Logistics — Rebuild Architecture

Design of record for migrating the live Laravel app to full-stack Next.js. The build follows this document. It references the audit files (`00`–`10`) rather than repeating them.

---

## 1. Locked decisions

| Area | Decision |
|---|---|
| Framework | Full-stack **Next.js** (App Router). React frontend + **Route Handlers** as the backend API. No separate Express service. |
| Language | **TypeScript** throughout. |
| Hosting | Existing **Hostinger Business** plan — managed Node.js web app. No VPS, no new cost. |
| Runtime | **Node LTS**, run as a persistent server (`next start`). Not serverless. Not Bun. |
| Database | The **existing Hostinger MySQL** the Laravel app already uses. Reused as-is via **Prisma**. |
| Domains | Admin at **`admin.tysgloballogistics.com`**, public at the **apex** `tysgloballogistics.com`. |
| Cutover | Deploy to subdomain → shadow-diff → DNS flip. Laravel on standby for rollback. |
| Build order | **Phase 0 foundation → Admin → Public.** |
| Constraints | Managed hosting means **no Redis, no background worker** — handled in §7. |

---

## 2. Hosting & runtime

- Deploys from **GitHub** as a managed Node.js app; Hostinger auto-builds and runs it.
- Because it runs as a **long-lived Node process** (not serverless), Prisma holds one pooled connection set — no serverless connection explosion. This is a real advantage of the managed-Node model for a DB-heavy app.
- **RAM:** 3 GB is shared with the still-live Laravel site during the overlap. Fine for this app's traffic; watch it, and it frees up once Laravel is retired. If Next SSR ever strains it, Cloud Startup or a small VPS is the upgrade path.
- **One thing to confirm in hPanel** (or Hostinger docs): pointing *both* the apex and the `admin.` subdomain at this one Node app. If Hostinger's managed model won't alias two domains to one app, the fallback is deploying the same build to two domain slots from the same repo — at a small RAM cost. This does not change the app code, only the deploy wiring. Confirm before Phase C.

---

## 3. App shape — one Next app, routed by host

One codebase, cleanly split because the two halves have opposite needs and **the public site has no login at all**:

- **Public (apex)** — anonymous, server-rendered for SEO (marketing pages + quote wizard).
- **Admin (subdomain)** — fully authenticated, client-rendered SPA-style routes.

Host-based routing lives in `src/middleware.ts` (`proxy.ts` on Next 16): it reads the `Host` header and routes the admin host to admin pages + `/api/admin/*` + `/api/auth/*`, and the apex to public pages + public API. The **Better Auth session cookie is scoped to the admin host only** — apex visitors never carry it. This keeps the two worlds isolated with one shared codebase (Prisma models, FedEx logic, validation, country data stay DRY).

**Middleware is not the security boundary.** It only routes and redirects (e.g. bounce an anonymous user from `/admin` to `/login`). The real session check is re-run inside every admin Route Handler and server component — because CVE-2025-29927 showed Next.js middleware-only auth can be bypassed with a spoofed `x-middleware-subrequest` header. Never trust the middleware gate alone.

```
src/
  middleware.ts                 # host routing + redirects ONLY (not the auth boundary — §3/§5); proxy.ts on Next 16
  app/
    (public)/                   # apex — anonymous
      layout.tsx
      page.tsx                  # home (+ footer quote form)
      quotes/page.tsx           # the wizard
      thank-you/page.tsx
    (admin)/                    # admin.* — authed
      login/page.tsx
      admin/
        layout.tsx              # auth guard + AdminShell + sidebar
        page.tsx                # dashboard
        quotes/                 # list, [id] detail (+ FedEx/CFT panel)
        vendors/                # list, [id] edit (contacts/comments/services tabs), map
        services/
        vendor-types/
        settings/               # FedEx markup
        profile/
    api/
      quotes/route.ts           # POST create
      quotes/calculate/route.ts
      quotes/validate-postal/route.ts
      email/track/[token]/route.ts
      auth/[...all]/route.ts    # Better Auth catch-all (login, logout, reset, session)
      meta/{countries,config}/route.ts
      admin/
        quotes/route.ts, [id]/route.ts, [id]/status/route.ts, [id]/fedex-rates/route.ts
        vendors/...             # nested contacts, comments, services, map/*
        vendor-types/..., services/..., settings/route.ts, geocode/route.ts
  lib/
    db.ts                       # Prisma singleton, small pool
    auth.ts, auth-client.ts     # Better Auth (server + client) + requireAdmin/policies
    fedex/                      # client(401-retry), rating, postal-validation  (ported verbatim)
    geocoding/                  # nominatim (UA + 1 rps + cache)
    cache/                      # MySQL-backed cache  (replaces Redis)
    ratelimit/                  # MySQL-backed limiter (replaces Redis)
    mail/                       # nodemailer + templates + inline sendQuoteEmails
    validation/                 # zod: common + per-endpoint
    chargeable-weight.ts
    postal-code.ts
    countries.ts
  components/{public,admin,shared}/
  prisma/
    schema.prisma               # generated by `prisma db pull`
```

---

## 4. Data layer

- **Introspect the existing tables, don't recreate them.** Run `prisma db pull` against production MySQL so the schema is generated *from* the live tables. Do **not** `prisma migrate` the existing app tables — they hold real data (R6; real column widths/nullability differ from the migration files).
- **Better Auth's tables are the one additive exception.** Better Auth needs its own `session`, `account`, and `verification` tables (and it stores credentials in `account`, not on the user row). These are **new** tables — create them with a controlled additive migration (safe: it only adds tables; Laravel ignores them). Then **backfill one `account` row per existing user from `users.password`** so current logins keep working. Because only the admin authenticates and it cuts over as a single unit — and the public site has no login — there's no long-lived dual-write on the auth tables to manage.
- **Connection pool:** set a small `connection_limit` in `DATABASE_URL` (managed MySQL caps concurrent connections). One long-lived Node process keeps this simple.
- **Soft deletes:** a Prisma extension auto-filters `deletedAt`; every route-model-binding lookup adds `deletedAt: null` so "deleted" contacts/comments 404 like today (R13).
- **Decimal-as-string contract:** serialize Prisma `Decimal` to `"0.00"` strings to match Laravel's JSON output (R3) — enforce it in one serializer + a test, or the frontend/consumers break.
- **Dual-write** the denormalized contact fields (`quotes.name/email/mobile_number` + `quote_contacts`) while both stacks may read (R35).
- The orphaned `packages` table and the dead code (`QuoteGenerator`, `ExportService`) are **excluded**, not ported.

---

## 5. Auth

**Library: Better Auth** (chosen over Auth.js — Auth.js v5 is still beta and its own maintainers now point new projects to Better Auth; its email/password path is its weakest, and email/password is all this app needs).

- **Email/password** via Better Auth's credential provider. No OAuth (none needed; registration disabled).
- **Database-backed sessions in the existing MySQL** through Better Auth's Prisma adapter — no Redis (matches §7), and Laravel already used DB sessions, so it's the same model. Sessions can be **invalidated immediately** (revoke an admin on the spot) — something a plain JWT can't do cleanly.
- **Session cookie scoped to the admin host.** The public apex has no auth at all.
- **Existing bcrypt (`$2y$`) hashes must keep working.** Configure Better Auth's password verify to accept bcrypt (or verify-with-bcrypt-then-rehash to Better Auth's format on first login). *Confirm the exact hook against Better Auth's current API before relying on it* — this is the one real integration risk.
- **Roles** (super-admin / admin / staff / user) via Better Auth's additional user fields / admin plugin. **`requireAdmin` is enforced inside every admin Route Handler and server component — not in middleware alone** (see §3, CVE-2025-29927). Default: lock down all `/api/admin/*` (R19).
- **Login rate limit** (5 per email+IP) via the §7 limiter or Better Auth's built-in throttling. **No email verification** (R18). **Password reset** uses Better Auth's built-in forgot/reset flow (replaces Laravel's hand-rolled one).
- **Registration stays disabled** (don't expose the sign-up endpoint). Admin users are created via the `create-admin-user` script, which writes the Better Auth `user` + `account` rows.

---

## 6. API — Route Handlers

- Live under `app/api`, mirroring **`02-routes.md` one-to-one** (`POST /api/quotes`, `GET /api/admin/vendors/[id]`, `PATCH .../status`, …).
- **Pure JSON.** Laravel's HTML-fragment modal endpoints and dual HTML/JSON endpoints all collapse to JSON.
- Preserve the **422 shape** `{ message, errors: { field: [...] } }` so React error rendering stays uniform.
- **Zod** validation from `04-validation.md`, **custom messages copied verbatim** (front-end tests assert exact strings).
- **DataTables server protocol → replaced** with plain paginated JSON + **TanStack Table** in React (R30; recommended — cleaner than reimplementing the yajra protocol).
- Keep **`/email/track/[token]`** byte-identical (baked into already-sent emails). Keep the public quote endpoints.

---

## 7. Managed-hosting adaptations (no Redis / no worker)

| Need | Laravel today | New approach |
|---|---|---|
| Cache (FedEx OAuth token, geocode, country list) | DB cache store | **MySQL `cache` table** (key/value/expires_at). Same idea Laravel already used. Single-flight lock on FedEx token refresh via a lock row / `SELECT … FOR UPDATE` (R14). |
| Rate limiting (throttle routes + login) | Laravel throttle | **MySQL fixed-window** table keyed per route as in `02-routes.md`. |
| Email (2 messages per quote) | `database` queue + worker | **Inline** via Nodemailer in the quote-store handler. Create the tracking-token row explicitly before send (R25). The FedEx call already dominates latency, so inline is fine at this volume. |
| Scheduler | none | none needed. |
| CLI commands | 2 artisan commands | `tsx` scripts: `create-admin-user`, `geocode-vendors`. |

---

## 8. Shared core modules (used by **both** admin and public)

- **`fedex/`** — client (401-retry-once), rate quoting, postal validation. **Port verbatim; GATED on the production verification.** The admin rate panel adds weight (see §9).
- **`chargeable-weight.ts`** — `max(actual, L×W×H / divisor)` (139 imperial / 5000 metric).
- **`postal-code.ts`**, **`countries.ts`** — the real ISO country list. (This also fixes the footer form's `alpha/beta/gamma` dropdown *by construction* — both forms read this one source.)
- **`geocoding/`** — Nominatim with custom UA, 1 rps, 30-day cache. Vendor geocode-on-save (R9): since there's no worker, run it **inline with a timeout** to preserve current behavior; log-and-continue on failure.
- **`mail/`**, **`validation/`**.

---

## 9. Admin FedEx / CFT rate panel — corrected design

- **Inputs:** per-package **L × W × H and weight**; packaging type; pickup type; ship date.
- **CFT is computed and displayed** as a volume readout — it is **not** sent to FedEx (the rate API has no CFT input; it takes weight + dimensions and computes dimensional weight itself).
- **The FedEx call sends** weight + dimensions + packaging type + pickup type + ship date → rate cards.
- The **missing weight** is almost certainly why this panel is broken today; adding it is the fix, not an enhancement.

---

## 10. Build sequence (admin first, then public)

**Phase 0 — Foundation** *(blocks everything; unavoidable before any admin screen)*
Repo + Next scaffold + host-routing middleware (redirects only) · `prisma db pull` + additive Better Auth tables + `db.ts` · **Better Auth** (DB sessions, credential provider, bcrypt-compat verify, backfill existing users) · MySQL cache + rate-limit primitives · error + Zod harness · `/up` health.

**Phase A — Admin** *(deployed and verified on `admin.` first)*
- **A1** Auth UI on Better Auth: login/logout, forgot/reset; `requireAdmin` enforced in handlers; admin shell + sidebar.
- **A2** Leaf CRUD: vendor-types → services → settings (establishes list/form/delete + TanStack patterns).
- **A3** Vendors core (+ inline geocoding) → contacts/comments (soft delete, CSV export) → service assignment → map (react-leaflet).
- **A4** Quotes: list (TanStack), detail, status; **FedEx re-rate + CFT panel** *(GATED on FedEx verification; adds weight per §9)*.

**Phase B — Public** *(apex; flips last with shadow verification)*
- **B1** Home + footer quote form (real countries) + marketing sections.
- **B2** Quote wizard — **one** React wizard replacing both divergent versions *(LAYOUT DECISION NEEDED)* + validate-postal + chargeable weight + FedEx rates + thank-you.
- **B3** Email tracking pixel.

**Phase C — Cutover & retire**
Point `admin.` at the Next app once Phase A is done (low risk — authed, no SEO). Shadow-diff the wizard against live Laravel; DNS-flip the apex; keep Laravel on a standby path for instant rollback; retire after a soak. Then confirm the two-domain binding from §2.

---

## 11. Decisions still open (with my recommended default, so nothing is blocked)

| # | Decision | Default if you don't override |
|---|---|---|
| 1 | **FedEx production verification** | *In progress* — gates A4 and B2. |
| 2 | **Wizard layout** (3-step `/quotes` vs 4-step `/` vs the `quotes/latest` redesign) | **Need you.** Recommend the 3-step `/quotes` flow. |
| 3 | Admin authorization (R19) | `requireAdmin` on all `/api/admin/*`. |
| 4 | SSN encryption (R-PII) | Field-encrypt at rest — **needs your sign-off**. |
| 5 | "Book Now" is fake (R36) | Keep as presentational unless you want it removed/real. |
| 6 | Public endpoint protection post-CSRF (R16) | Rate limits + origin allowlist. |
| 7 | Decimal-as-string (R3) | Keep strings. |

---

## 12. Live Laravel fixes worth doing NOW (independent of the rewrite)

These exist in the **current** app and shouldn't wait months behind the rewrite:

- The two probable 500s: contact edit (R4), recreate-deleted-contact (R7).
- **Security:** admin authorization + the unprotected settings write (R19); **plaintext SSNs** (R-PII).
- **Verify the production `.env`** (R38): is FedEx on sandbox? is `APP_DEBUG=true` leaking traces? is mail only being logged instead of sent?
