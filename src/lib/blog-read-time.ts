/**
 * Computed from the post body, not stored — always accurate, nothing for
 * staff to keep in sync (the old BLOG_POSTS array had a hand-typed
 * "6 min read" per post; this replaces that with the real word count).
 * 200 wpm is the standard reading-speed estimate other "N min read"
 * badges use; rounds up so a very short post still reads "1 min read"
 * rather than "0 min read".
 */
export function estimateReadTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/** Matches the old hand-typed listing/post-header date format ("May 4,
 * 2026"), just computed from a real Date instead of a free-text string. */
export function formatBlogDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
    date,
  );
}
