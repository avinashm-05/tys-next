// Real flag artwork (flag-icons npm package, imported once in globals.css)
// instead of Unicode flag emoji. Regional-indicator emoji flags render as
// plain two-letter text on a lot of real-world setups — notably Windows
// Chrome/Edge on anything before Windows 11's newer Segoe UI Emoji, and many
// Linux browsers — because the OS/browser has no colored flag glyph to draw,
// so it falls back to showing the two letters literally (exactly what was
// reported: "the flags not opening in some"). An SVG-backed CSS class
// (`.fi.fi-us`) always renders identically everywhere, same as the site's own
// hand-traced <UsFlag>, but for every ISO code instead of just one.
export function FlagIcon({ code, className = "" }: { code: string; className?: string }) {
  if (!/^[A-Za-z]{2}$/.test(code)) return null;
  return (
    <span
      aria-hidden
      className={`fi fi-${code.toLowerCase()} inline-block rounded-[2px] bg-cover bg-center ${className}`}
    />
  );
}
