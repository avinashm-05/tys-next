import { SignOutButton } from "@/components/public/account/sign-out-button";

// Portal navigation (C1.2). Shipments/Tracking are wired now so the fulfillment
// track (C3–C5) can light them up — their pages render honest empty states.
const ITEMS = [
  ["/account", "Dashboard"],
  ["/account/quotes", "My Quotes"],
  ["/account/shipments", "Shipments"],
  ["/account/tracking", "Tracking"],
  ["/account/profile", "Profile"],
] as const;

export function AccountNav({ current }: { current: string }) {
  return (
    <nav
      className="d-flex flex-wrap align-items-center gap-3"
      style={{ marginBottom: 24, fontSize: "0.95rem" }}
    >
      {ITEMS.map(([href, label]) => (
        <a
          key={href}
          href={href}
          style={{
            textDecoration: "none",
            fontWeight: current === href ? 700 : 400,
            color: current === href ? "#f26a21" : "#1d2534",
          }}
        >
          {label}
        </a>
      ))}
      <span className="ms-auto">
        <SignOutButton />
      </span>
    </nav>
  );
}

/** Read-only status pill for quote rows (public styling, no shadcn). */
export function QuoteStatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    pending: { bg: "#fff4e5", fg: "#b45309" },
    quoted: { bg: "#e7f1ff", fg: "#0d6efd" },
    accepted: { bg: "#e6f9ee", fg: "#00a843" },
    cancelled: { bg: "#fdecec", fg: "#dc3545" },
  };
  const c = colors[status] ?? { bg: "#eef1f5", fg: "#1d2534" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        borderRadius: 50,
        padding: "3px 12px",
        fontSize: "0.8rem",
        fontWeight: 600,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}
