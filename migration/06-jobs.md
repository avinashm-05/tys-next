# 06 — Jobs, Mail, Scheduling, Broadcasting

## Queue inventory (small — one real job)

| Item | Current | Details |
|---|---|---|
| Queue driver | `database` (`jobs` table), default queue | `.env:38`, `config/queue.php:16` |
| Jobs | **1**: `App\Jobs\SendQuoteConfirmationEmail` | dispatched from `QuoteController@store:119` |
| Queued listeners | none | |
| Batches | none (table exists unused) | |
| Failed jobs | `failed_jobs` table (database-uuids driver) | |
| Worker in dev | `php artisan queue:listen --tries=1` (composer `dev` script) | ⚠️ tries=1 in dev; production worker config unknown — on shared hosting there may be **no worker running at all**; verify whether prod actually sends async or jobs pile up |

### `SendQuoteConfirmationEmail` (`app/Jobs/SendQuoteConfirmationEmail.php`)
- Payload: the whole `Quote` model (`SerializesModels` → stores id, **re-fetches fresh on handle**; if the quote was deleted meanwhile the job fails with ModelNotFound).
- `handle()`: ① mail `QuoteConfirmation` to `quote.contact.email`; ② parse `ADMIN_NOTIFICATION_EMAILS` (comma-separated, via `config('mail.admin_notification_emails')` — `config/mail.php:129`) and mail `QuoteAdminNotification` to all admins in **one message (To: all)**. Errors logged then **rethrown** (→ retry per worker config).

### BullMQ mapping
```ts
// queue: "emails"
type SendQuoteEmailsJob = { quoteId: number };
```
- Producer: quote-create service `await emailQueue.add("send-quote-emails", { quoteId }, { attempts: 3, backoff: { type: "exponential", delay: 5000 } })` — pass the **id only** (mirrors SerializesModels), re-fetch quote + contact + emailStatistic in the worker.
- Worker: fetch quote (throw if missing → BullMQ retry/DLQ), render + send both emails via Nodemailer, structured log on failure.
- Redis becomes a new infra dependency (also used for cache + rate limiting).
- Delete Laravel's `jobs/failed_jobs` usage after cutover; **drain the `jobs` table first** (or run the Laravel worker until empty).

## Mail

| Current | Target |
|---|---|
| SMTP config from env (`MAIL_*`), default mailer `log` in .env (⚠️ confirm what production actually uses — current `.env` has no real SMTP host, meaning **emails may currently only be logged**; ask the owner) | Nodemailer SMTP transport, `EMAIL_*` env; dev transport = `jsonTransport`/mailhog |
| From: `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME` | same |
| `QuoteConfirmation` (`app/Mail/QuoteConfirmation.php`): subject "Shipping Quote Confirmation", view `emails.quote-confirmation`, injects `trackingUrl`. ⚠️ **Constructor side effect**: if the quote has no emailStatistic it **creates the tracking token row** (`QuoteConfirmation.php:29-35`) | `renderQuoteConfirmation(quote, trackingUrl)`; move the token-fallback creation into the worker (explicit, before render) |
| `QuoteAdminNotification`: subject `New Shipping Quote Request #{id}`, view `emails.quote-admin-notification` | `renderQuoteAdminNotification(quote)` |
| Templates: self-contained HTML (600px, `<style>` in head — fine for most clients, Gmail clips >102KB, currently ~8KB OK). Variables per template documented in 07-frontend. Tracking pixel `<img src="{{trackingUrl}}" width=1 height=1 style="display:none">` at `quote-confirmation.blade.php:224` | Port to `react-email`, MJML, or plain template literals — **keep pixel markup and the `/email/track/{token}` URL format identical** |
| Password-reset email: framework default ResetPassword notification (no custom view in repo) | Simple Nodemailer template with reset link |

## Scheduling
`routes/console.php` contains only the sample `inspire` command. **No `Schedule::` entries, no Kernel schedule → nothing to migrate to cron/BullMQ repeatables.**
The two artisan commands become Node CLI scripts (`tsx scripts/...`):
- `app:create-admin-user {email} {password} {name}` → `scripts/create-admin-user.ts` (bcrypt hash, admin user_type lookup, email_verified_at=now).
- `vendors:geocode [--all|--ids|--delay]` → `scripts/geocode-vendors.ts` (reuse the Nominatim service; keep 1 req/s delay + confirm-over-10 prompt + summary output).

## Broadcasting / Websockets
`BROADCAST_CONNECTION=log`, no events, no Echo/Pusher anywhere in app code or views. **Socket.io: not needed — nothing to port.** (Skip it; add later only if a real-time feature is requested.)

## Cache (adjacent infra being replaced)
Database cache store today holds: FedEx OAuth token (`fedex:oauth_token`, TTL = expires_in−60s), geocode results (`geocode:md5(addr)`, 30 days), reverse-geocode results, country list (1 day). → All to Redis with the same keys/TTLs. Add a simple lock (single-flight) around FedEx token refresh to avoid concurrent-refresh stampedes that the PHP version tolerates.
