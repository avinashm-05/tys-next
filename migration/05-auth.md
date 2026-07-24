# 05 — Auth & Authorization

## Current mechanism (verified)

- **Plain session auth. No Sanctum. No Passport. No Breeze/Jetstream package installed** — the auth controllers are hand-rolled Breeze-style (`app/Http/Controllers/Auth/*`). Guard: `web` (session driver, sessions stored in the **`sessions` DB table**), provider: eloquent `users` (`config/auth.php:17,40-41,64`).
- **Registration is disabled**: a `register.blade.php` view exists, but there is **no register route or controller**. Users are created via seeder or `php artisan app:create-admin-user {email} {password} {name}` (`app/Console/Commands/CreateAdminUser.php`).
- **CSRF** on every POST/PUT/PATCH/DELETE (web group), except `/email/track/*` (`bootstrap/app.php:18-20`). The SPA's AJAX sends `X-CSRF-TOKEN` from the Blade meta tag.
- **Remember me**: supported (`LoginRequest.php:44` passes `remember`; `users.remember_token`).
- **Login throttling**: 5 failed attempts per `transliterate(lower(email))|ip` → 422 with lockout seconds (`LoginRequest.php:60-76`); fires `Illuminate\Auth\Events\Lockout`.
- **Session fixation defenses**: `session()->regenerate()` on login, `invalidate()+regenerateToken()` on logout/account-delete — replaced by JWT semantics.

## Password hashing — ✅ bcrypt confirmed

- No `config/hashing.php` override exists → Laravel default **bcrypt**; `BCRYPT_ROUNDS=12` (`.env.example:16`). `User` casts `password => 'hashed'` (`User.php:47`); reset flow uses `Hash::make` (`ResetPasswordController.php:42`); CreateAdminUser uses `bcrypt()`.
- **Existing hashes keep working** in Node with `bcryptjs`/`bcrypt`: `bcrypt.compare(plain, storedHash)`. PHP produces `$2y$` prefixed hashes; node bcrypt accepts `$2y$` (treat as `$2b$` — verify with a real hash from the DB during cutover testing; if the lib rejects `$2y$`, replace prefix `$2y$`→`$2b$` before compare, which is safe).
- New hashes from Node (`$2b$`, cost 12 to match) remain verifiable if PHP ever reads them (`password_verify` accepts `$2b$`).

## Roles

- `user_types` table, slugs: `super-admin`, `admin`, `staff`, `user` (constants in `UserType.php:13-19`; ⚠️ seeder omits `staff`).
- `User::isAdmin()` = slug ∈ {super-admin, admin} (`User.php:62-68`). This is **the only authorization primitive in the app**.
- Login redirect by role (`LoginController.php:56-73`): super-admin/admin → `/admin/dashboard`; staff/user/null → `/dashboard`.

## Authorization map (⚠️ no Policies, no Gates anywhere)

| Layer | What exists today |
|---|---|
| Route middleware | Only `auth` (+ `guest`, `verified`). **No role middleware on `/admin/*`** — any logged-in user reaches admin GET pages |
| FormRequest `authorize()` | `isAdmin()` on all admin **writes** (service/vendor/type/contact/comment/assignment CRUD, quote status) → 403 |
| Inline checks | `VendorContactController@index:30` and `VendorCommentController@index:30` return 403 JSON if `!isAdmin()` |
| **Unprotected by role** (auth only) | `admin.dashboard`, `admin.quotes.index/show/fedex-rates`, `admin.settings.index`, `admin.services.index/show/create/edit`, `admin.vendor-types.*` GETs, `admin.vendors.index/show/create/edit`, vendor map (all endpoints), `vendors.services.index/search`, `comments.export/count`, and **`SettingController@store` (a write with NO admin check)** |

**Decision for the user:** replicate this permissive reality, or (recommended) put `requireAdmin` on the whole `/api/admin/*` router. Since the only non-admin roles are `staff`/`user` and there's no UI for them beyond an empty `/dashboard`, tightening is almost certainly intended — but it IS a behavior change; get sign-off. (Risk R19.)

## Email verification — effectively OFF
`/dashboard` uses `verified` middleware (`web.php:33`) but `User` does **not** implement `MustVerifyEmail` (commented out, `User.php:5`), so the middleware passes everyone. `ProfileController@update` nulls `email_verified_at` on email change, and `verify-email.blade.php` exists, but nothing enforces verification. **Port as: no verification** (keep the `email_verified_at` column).

## Password reset flow
`Password` broker + `password_reset_tokens` table; default 60-min expiry, throttle 60s (config/auth.php defaults); emails via the framework's ResetPassword notification (default markdown template — no custom mail view in the repo). Status translations (`__($status)`) surface as flash/errors.
**Node port:** POST forgot-password → generate token (store bcrypt/sha256 hash of token, 60-min expiry, delete prior tokens for email), email link `{APP_URL}/reset-password/{token}?email=...` via Nodemailer; POST reset-password → verify token+expiry, update bcrypt hash, delete token. Keep "we emailed you if the account exists" behavior: Laravel's broker actually **reveals** whether email exists (returns error status shown in form — `ForgotPasswordController.php:33-39`). Match current behavior for parity; flag as a hardening opportunity.

## Target JWT design

1. `POST /api/auth/login` → verify bcrypt → issue **short-lived access JWT** (15 min; claims: `sub`, `role` slug, `name`) + **httpOnly secure refresh cookie** (7 days, rotating, server-side denylist table or Redis). Rationale: the current UX is session-cookie "stay logged in" — pure stateless JWT with no refresh would degrade admin UX; refresh cookie preserves it.
2. Middleware chain: `authenticate` (verify JWT → `req.user`) → `requireAdmin` (role ∈ {super-admin, admin}) on `/api/admin/*`.
3. Replicate login rate-limit (5/`email|ip`, lockout seconds in the 422 payload).
4. Logout = clear refresh cookie + denylist the refresh token.
5. `remember` flag → refresh-cookie lifetime 7d vs session-length (or drop the checkbox; decision).
6. **Policy layer**: a single `can(user, action)` module today reduces to `isAdmin` — build it as a function table (`policies.ts`) so per-model rules can grow, but don't invent permissions that don't exist.

## What changes for existing users at cutover (flag to stakeholders)

- **All active sessions die** (sessions table abandoned) — everyone logs in again once. Password hashes carry over, so no resets needed.
- **Remember-me cookies** die (Laravel recaller cookie is framework-specific).
- **In-flight password-reset links** die unless the Node reset flow reads the same `password_reset_tokens` table during a transition window (tokens are bcrypt-hashed by Laravel; Node can `bcrypt.compare` incoming tokens — feasible, decide if worth it; expiry is 60 min so probably not).
- **CSRF disappears** with JWT-in-header; the **public** quote endpoints (`/quotes`, `/quotes/calculate`, `/quotes/validate-postal`) currently get incidental CSRF + same-origin protection. In the new stack they are open endpoints protected only by rate limits — add origin checks/captcha if abuse appears (R16).
- Email tracking URLs (`/email/track/{token}`) must keep working verbatim — they are in customers' inboxes.
