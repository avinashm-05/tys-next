# db/

The SQL files that used to live here (a reconstructed schema dump + an
additive migration) are retired. **`prisma/schema.prisma` + `prisma/migrations/`
are the source of truth** — the local dev DB is created with
`npx prisma migrate reset` (or `migrate dev`), and production gets
`prisma migrate deploy` onto a FRESH empty database at cutover.

⚠️ That strategy is valid ONLY because production was verified empty. If any
data table turns out to have rows, stop: back up, and revert to the
introspect-first approach (`prisma db pull` against a schema-only dump). See
README.md → "Admin cutover runbook".
