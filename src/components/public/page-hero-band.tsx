// Flat title band used on the simpler interior pages (Destinations, Moving,
// Online Payment, etc.) — no curve, unlike the /quotes hero.
export function PageHeroBand({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-brand-light px-4 py-14 text-center md:px-8 md:py-20">
      <h1 className="text-3xl font-extrabold text-ink md:text-4xl">{title}</h1>
      {subtitle && <p className="mx-auto mt-3 max-w-xl text-ink-muted">{subtitle}</p>}
    </section>
  );
}
