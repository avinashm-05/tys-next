import { CalendarIcon, ClockIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";

export function BlogPostHero({
  category,
  title,
  subtitle,
  date,
  readTime,
}: {
  category: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
}) {
  return (
    <section className="bg-brand-light px-4 py-14 text-center md:px-8 md:py-20">
      <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand shadow-sm">
        {category}
      </span>
      <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold text-ink md:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-ink-muted">{subtitle}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-muted">
        <span className="flex items-center gap-1.5">
          <UserIcon size={16} /> By Avinash
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarIcon size={16} /> {date}
        </span>
        <span className="flex items-center gap-1.5">
          <ClockIcon size={16} /> {readTime}
        </span>
      </div>
    </section>
  );
}
