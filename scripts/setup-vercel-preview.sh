#!/usr/bin/env bash
#
# Finishes the Vercel preview environment once you have a cloud MySQL URL.
#
#   ./scripts/setup-vercel-preview.sh 'mysql://user:pass@host:3306/dbname'
#
# Everything else (project link, auth secrets, analytics deliberately left
# unset so the preview cannot report into live Clarity/GA4) is already done.
#
# Safe to re-run. Does NOT touch production or the Hostinger deployment.
set -euo pipefail
cd "$(dirname "$0")/.."

DB_URL="${1:-}"
if [ -z "$DB_URL" ]; then
  echo "usage: $0 'mysql://user:pass@host:3306/dbname'" >&2
  exit 1
fi
case "$DB_URL" in
  *127.0.0.1*|*localhost*)
    echo "ERROR: that is a local address — Vercel cannot reach it." >&2
    echo "Use the public host from your cloud MySQL provider." >&2
    exit 1;;
esac

echo "==> 1/5  Checking the database is reachable from here"
DATABASE_URL="$DB_URL" npx prisma db execute --stdin <<<'SELECT 1;' >/dev/null
echo "    ok"

echo "==> 2/5  Applying migrations (12 of them)"
DATABASE_URL="$DB_URL" npx prisma migrate deploy

echo "==> 3/5  Seeding the 6 blog posts + a preview admin"
DATABASE_URL="$DB_URL" npx tsx scripts/migrate-blog-posts.ts
DATABASE_URL="$DB_URL" npx tsx scripts/create-admin-user.ts \
  preview@tysgloballogistics.com 'PreviewOnly!2026' 'Preview Admin' admin || true
DATABASE_URL="$DB_URL" npx tsx scripts/backfill-usernames.ts

echo "==> 4/5  Telling Vercel about the database"
printf '%s' "$DB_URL" | vercel env add DATABASE_URL preview --force >/dev/null
echo "    DATABASE_URL set on the preview environment"

echo "==> 5/5  Deploying"
URL=$(vercel deploy --yes 2>&1 | tail -1)
echo "    deployed: $URL"

# BETTER_AUTH_URL / APP_URL must match the real origin or auth rejects the
# request with "Invalid origin" — same class of bug as the www/apex incident.
printf '%s' "$URL" | vercel env add APP_URL preview --force >/dev/null
printf '%s' "$URL" | vercel env add BETTER_AUTH_URL preview --force >/dev/null
echo "    APP_URL + BETTER_AUTH_URL pinned to that origin; redeploying so they take effect"
vercel deploy --yes >/dev/null 2>&1

echo
echo "Done. Preview: $URL"
echo "Admin login:  preview@tysgloballogistics.com / PreviewOnly!2026"
echo
echo "Known limitation: file uploads (blog hero images, FedEx labels) fail by"
echo "design on Vercel — the filesystem is ephemeral. src/lib/storage.ts throws"
echo "a clear error saying so. Everything else works."
