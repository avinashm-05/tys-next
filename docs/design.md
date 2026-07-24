# Design tokens & interface copy

The rules every admin/public screen follows. Tokens live in
`src/app/globals.css` (the "TYS brand tokens" block) — change them there, not
per-component.

## Tokens

| Token             | Value     | Use                                           |
| ----------------- | --------- | --------------------------------------------- |
| `--tys-navy`      | `#16294e` | Primary actions, focus rings, links           |
| `--tys-navy-deep` | `#0d1a33` | Admin sidebar, dark surfaces                  |
| `--tys-orange`    | `#f26a21` | The one accent: primary CTAs, active nav item |
| `--tys-ink`       | `#1d2534` | Body text                                     |
| `--tys-paper`     | `#f7f8fa` | App background                                |
| `--tys-mist`      | `#dde2ea` | Borders, dividers, inputs                     |

Type scale (`text-display` / `text-h1` / `text-h2` / `text-h3`, ~1.25 ratio) is
defined as Tailwind theme tokens — use those utilities, never ad-hoc
`text-[27px]`. Body stays `text-base`/`text-sm`; everything is the sans stack
(Geist), mono only for ids/tokens/code.

Orange is scarce on purpose: one primary CTA per view. If two things are
orange, one of them is wrong.

## Interface copy

- **Buttons name the action**: "Save changes", "Add vendor", "Send reset link"
  — never "Submit", "OK", "Yes".
- **Same verb through a flow**: if the button says "Add vendor", the dialog
  title is "Add vendor" and the toast says "Vendor added" — don't drift to
  "create"/"new" mid-flow.
- **Errors are directive, not apologetic**: say what to do next —
  "Enter a valid email address.", not "Oops! Something went wrong :(".
  Validation messages from the Laravel app are copied verbatim (04-validation)
  and take precedence.
- **Empty states invite an action**: "No vendors yet. Add your first vendor."
  — never a bare "No data". Pass `emptyMessage` to `<DataTable>`.
- **Destructive confirmations name the object**: "Delete the contact
  'Jane Doe'? This can't be undone." — the confirm button repeats the verb
  ("Delete contact"), the cancel is always "Cancel".
