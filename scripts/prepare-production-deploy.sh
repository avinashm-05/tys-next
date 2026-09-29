#!/usr/bin/env bash
#
# Does every database step for the 15 Aug deploy, in the right order, with
# checks between each one. Run it BEFORE uploading the zip.
#
#   ./scripts/prepare-production-deploy.sh 'mysql://user:pass@IP:3306/dbname'
#
# Get that URL from: hPanel -> Websites -> tysgloballogistics.com ->
# Deployments -> Environment variables -> DATABASE_URL (click to reveal).
#
# Safe to re-run: migrations already applied are skipped, the blog seed is
# idempotent by slug, and the username backfill skips users who have one.
set -euo pipefail
cd "$(dirname "$0")/.."

DB="${1:-}"
if [ -z "$DB" ]; then
  echo "usage: $0 'mysql://user:pass@IP:3306/dbname'" >&2
  echo "(hPanel -> Websites -> tysgloballogistics.com -> Deployments -> Environment variables -> DATABASE_URL)" >&2
  exit 1
fi
case "$DB" in
  *127.0.0.1*|*localhost*)
    echo "STOP: that is your LOCAL database, not production." >&2
    echo "Production uses the database server's raw IP — see the Remote MySQL page in hPanel." >&2
    exit 1;;
esac

echo "==> 1/5  Can we reach the production database?"
DATABASE_URL="$DB" npx prisma@6.19.3 db execute --stdin <<<'SELECT 1;' >/dev/null
echo "    yes"

echo
echo "==> 2/5  What is already applied? (nothing changes yet)"
DATABASE_URL="$DB" npx prisma@6.19.3 migrate status || true
echo
read -r -p "    Apply the pending migrations now? [y/N] " ok
case "$ok" in [yY]*) ;; *) echo "    stopped, nothing changed."; exit 0;; esac

echo
echo "==> 3/5  Applying migrations"
DATABASE_URL="$DB" npx prisma@6.19.3 migrate deploy

echo
echo "==> 4/5  Seeding the 6 blog posts  <-- without this, /blog goes blank"
DATABASE_URL="$DB" npx tsx scripts/migrate-blog-posts.ts

echo
echo "==> 5/5  Giving existing users a username"
DATABASE_URL="$DB" npx tsx scripts/backfill-usernames.ts

echo
echo "==> Checking it worked"
DATABASE_URL="$DB" npx tsx -e "
import './scripts/env';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
(async () => {
  const posts = await db.post.count({ where: { status: 'published' } });
  const users = await db.user.count();
  const noHandle = await db.user.count({ where: { username: null } });
  console.log('    published blog posts :', posts, posts === 6 ? '(correct)' : '(EXPECTED 6 — check before deploying)');
  console.log('    users                :', users, '| still without a username:', noHandle);
  await db.\$disconnect();
})();
"

cat <<'DONE'

Database is ready. Now, in hPanel:

  1. Deployments -> Redeploy -> Upload new files
     -> 14_website_15_aug/tys_global_logistics_website.zip

  2. Environment variables -> check STORAGE_ROOT points OUTSIDE the app
     folder (e.g. /home/USER/tys_storage). If it is missing, uploaded
     labels and blog images are wiped by the next deploy.

  3. Dashboard -> Cache -> Clear cache        <-- not optional

Then tell Claude and it will verify the live site for you.
DONE
