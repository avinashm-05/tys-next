# TYS Global Logistics — Next.js rewrite

Full-stack Next.js (App Router) replacing the Laravel app. **ARCHITECTURE.md
and `migration/00–10` are the source of truth** — read them before changing
anything structural.

One codebase, routed by host (`src/proxy.ts`): the admin at
`admin.tysgloballogistics.com`, the public site at the apex. Auth is Better
Auth (DB-backed sessions); the proxy only redirects — **the security boundary
is the admin guard (`adminRoute`/`requireAdminPage`) inside every admin Route
Handler and server component** (CVE-2025-29927).

## Local dev

```bash
# 1. Local MySQL (disposable — Prisma owns the schema)
docker run -d --name tys-mysql -e MYSQL_ROOT_PASSWORD=tys_local \
  -e MYSQL_DATABASE=tys_next -p 33061:3306 mysql:8.0

# 2. Env + schema + client
cp .env.example .env   # set the dev values noted in the comments
npx prisma migrate dev # creates/updates the schema, generates the client

# 3. Users + sanity
npm run admin:create -- you@example.com yourpassword "Your Name"
npm run phase0:check   # seeds fixtures and proves auth/crypto/limits/soft-deletes

# 4. Run — apex = http://localhost:3000, admin = http://admin.localhost:3000
npm run dev
```

## Schema strategy — migrate-first (GATED)

**Prisma is the source of truth**: `prisma/schema.prisma` + `prisma/migrations/`.
At cutover, run `prisma migrate deploy` onto a **fresh, empty MySQL database**
(e.g. `tys_next`) — Laravel's `import_export` DB stays untouched as instant
rollback. `DATABASE_URL` points at the new DB.

> **⚠️ GATE — do not run the production apply until the owner confirms BOTH:**
> 1. every data table in the old DB (quotes, quote_contacts,
>    quote_email_statistics, package_details, vendors, vendor_contacts,
>    vendor_comments, vendor_services) has **ZERO rows**, and
> 2. a full backup has been taken.
>
> This strategy is valid **only because production is empty**. If any data
> exists: skip all of this, revert to introspect-first (`prisma db pull`
> against a schema-only dump, additive-only SQL for new tables — see git
> history of `db/`), and use `scripts/backfill-auth.ts` to carry the existing
> bcrypt logins over.

## Admin cutover runbook (production, run once — after the gate above)

1. Create the fresh database in hPanel; set production `DATABASE_URL` to it.
2. `npx prisma migrate deploy` (from the Hostinger box, or Remote MySQL + IP
   whitelist in hPanel).
3. Owner sets production secrets: `BETTER_AUTH_SECRET`, `SSN_ENCRYPTION_KEY`
   (`openssl rand -hex 32` each — owner-managed, never committed).
4. Create the admin accounts: `npm run admin:create -- <email> <password> <name>`.
5. Point `admin.` at the Next app.

## Gates & ground rules

- **FedEx is GATED (R38):** sandbox credentials suspected. Do not build or
  wire any FedEx module until the owner confirms production keys.
- Schema changes go through `prisma migrate dev` — never hand-edit the DB.
  Production applies are `prisma migrate deploy` onto the fresh DB only
  (see the gate above).
- `vendors.ssn_number` is encrypted at rest — read/write ONLY through
  `src/lib/pii.ts` (uniqueness + lookups use `ssn_number_hash`).
- Admin endpoints use `adminRoute(handler)`; admin server components call
  `requireAdminPage()` — never rely on the proxy for auth.
- Decimals serialize as `"0.00"` strings (`src/lib/serialize.ts`, R3); errors
  are 422 `{ message, errors }` (`src/lib/validation/errors.ts`).
- Soft deletes are enforced by the Prisma extension in `src/lib/db.ts` (R13).
- Timestamps are UTC (`TZ=UTC`).
- Design tokens + interface-copy rules: `docs/design.md`.
