# TYS → SFL Platform — Re-baselined Roadmap
_Supersedes the phase plan in ARCHITECTURE.md. Last updated: 2026-07-14._

## What changed
- **Was:** rebuild the TYS Laravel quote site + vendor CRM (a faithful port).
- **Now:** build the full SFL-style logistics platform — **quote (auto-rate domestic + international) → book shipment → FedEx label → tracking**, every step emailed, with **customer accounts** on the public site. Matching SETU's full depth and its visual look is a *later* phase.
- **Why it matters:** this is materially bigger and longer than the port, and it's gated by two FedEx certifications — one of which (labels) is slow and now the schedule driver.

## The two tracks
Everything below sorts into one of two tracks. Keep them separate — Track A can be finished and demoed without Track B.

- **Track A — Quote & Rate.** Buildable on FedEx **sandbox now**. Gated on the FedEx **Rate + Postal** cert only for showing *real* prices (fast cert).
- **Track B — Fulfillment.** Gated on the FedEx **Ship / Label certification** — the *slow* one (weeks; FedEx manually reviews your labels). Nothing here works until that clears.

---

## Done (built + verified)
- Foundation, auth + admin shell, vendor-types / services / settings CRUD.
- Full vendors subsystem: list, contacts, comments, service-assignment, Leaflet map (+ delete-cascade warning, marker fix). Browser-confirmed.
- Quotes admin: list (FIND_IN_SET filter), detail, status update.
- Admin dark/light/system theme.
- Dependency recovery (Next 16.2.10 / Prisma 6.19.3).
- **A4.2 domestic FedEx rate engine** — verbatim port, verified against the Laravel fixtures + live sandbox.

## Remaining — Track A (quote & rate)
1. **A4.2b — international rating path** (in progress): FedEx International rating + wire the international markup + harden country-format detection.
2. **A4.3 — quote pricing workstation:** the quote-view rate panel (marked-up + retail, retail editable / manual override, international markup applied), **Send quote** (email), quote-list actions (add routes to B2), and the raw-JSON detail cleanup.
3. **B1 — public home + marketing pages.**
4. **B2 — public quote wizard + the shared quote form/rating**, then **admin quote create/edit** as a thin wrapper on the same form. _Resolve the country-format question here (what the wizard actually stores)._ The customer-facing results page matches the SFL layout (retail struck-through, discounted price, save %).
5. **A3.5 — vendor/map polish** (unblocked, slot in anytime): vendor list services filter + services column + created-by column; map postal-code proximity search with a distance-sorted list.

## Remaining — Track B (fulfillment — GATED on the FedEx Ship/Label cert)
6. **Shipment booking:** create a shipment from an accepted quote, with a confirmation email. (This is the SETU shipment *core* — simpler than SETU's full multi-tab shipment.)
7. **FedEx label generation** (FedEx **Ship API**): **cannot ship real labels until the Shipping Label Certification passes.** This is the long pole.
8. **Tracking:** capture the tracking ID from the label; tracking lookup/display.
9. **Per-step confirmation emails** across the flow (quote sent, shipment booked, label ready, etc.), reusing the existing mailer.

## Cross-cutting new subsystems (new since the original plan)
- **Customer accounts (public auth + portal).** Reverses "public site is anonymous." Better Auth public signup + a customer role + a customer dashboard (their quotes / shipments / tracking). Kept strictly separate from admin auth. _Scope TBD — see open questions._
- **File storage.** Needed for generated labels and (later) shipment/vendor documents. Decide server-disk vs object storage on the managed Hostinger box. First needed in Track B.
- **Declared value / commercial-invoice data.** International rating, customs, and labels generally need a per-item value; the current package schema has none. Add it **when sandbox or the label API demands it** — not preemptively.

## Gates (outside the code — start these now)
- **FedEx Rate + Postal certification (TYSGLOB)** — for real prices on Track A. Longest pole #1.
- **FedEx Ship / Label certification** — for label generation on Track B. Longest pole #2, and **slower**; everything past "book shipment" waits on it. **This is the single most time-sensitive action — start it today.**
- **Cutover:** fresh-DB `prisma migrate deploy`, Hostinger managed-Node deploy, DNS flip, rotate the leaked secrets, hPanel env (unescaped `$`), SPF/DKIM for deliverability.

## After the main goal — the "match SETU" phase
Parked until the flow above ships. All reverse-engineered from screenshots, so it needs the SETU extraction run + the open-questions answered first.
- Full SETU **shipment** depth (commercial-invoice, accounts, documentation tabs beyond the basic book→label→track).
- **Containers** (ocean-freight module). **Reports.** Vendor **Documents** tab + the **W-9** field.
- SETU's **visual look** (dark sidebar / magenta) — a deliberate restyle.
- Payment stays **manual** (staff email payment details); SETU's "Accounts" is tracking, not in-app processing. No Stripe.

## Open questions (needed to finalize scope)
1. **Customer accounts:** what can a logged-in customer actually *do* — view quotes/shipments/tracking? book without re-entering details? See invoices?
2. **"Image page instead of quote confirmation":** what is this? The rate-results page (SFL layout) shown after submit, or something with image uploads?
3. **Declared value:** confirm the field once international sandbox / the label API requires it.
4. **SETU boundary:** how much shipment depth belongs in the main goal vs the SETU-match phase?

## Honest read
The **admin** side is largely built. Track A's remainder is **medium** (pricing workstation + public site + wizard). Track B is **large and cert-gated**. Customer accounts is a **new subsystem**. Realistically this is a **multi-month** build, and the **FedEx Ship/Label certification is the schedule driver** — code can outrun it, but launch can't. Estimates past B2 are soft; the wizard and the label integration are where surprises live.
