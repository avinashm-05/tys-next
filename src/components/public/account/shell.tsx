// Shared wrapper for the /account/* pages — public-site styling (the loaded
// legacy stylesheets), NOT admin shadcn. The card class comes from the wizard's
// location card so the portal looks native to the public site.
export function AccountShell({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main
      className="container"
      style={{ paddingTop: 160, paddingBottom: 80, maxWidth: wide ? 960 : 560 }}
    >
      <h1 className="quote-wizard-section-title" style={{ marginBottom: 4 }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted" style={{ marginBottom: 20 }}>
          {subtitle}
        </p>
      )}
      <div className="quote-wizard-location-card">{children}</div>
    </main>
  );
}

/** Inline field error, same look as the wizard's. */
export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="quote-wizard-error-message" style={{ display: "flex" }}>
      <i className="fa-solid fa-circle-exclamation"></i>
      <span>{message}</span>
    </div>
  );
}
