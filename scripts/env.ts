/**
 * Side-effect env loader for ALL tsx scripts — import it first.
 *
 * Uses @next/env (what `next dev`/`next start` use) instead of plain dotenv
 * so scripts and the app read IDENTICAL values. The two libraries disagree on
 * `$` handling: @next/env expands $VAR/${VAR} (even single-quoted) while
 * dotenv expands nothing — with plain dotenv the app and scripts silently saw
 * different SMTP_PASSWORD/MAIL_FROM_NAME values. Literal `$` in .env values
 * must be escaped as `\$` (see .env.example).
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
