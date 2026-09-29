"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react/dist/ssr";
import { FlagIcon } from "@/components/public/flag-icon";

export type SearchableOption = {
  value: string;
  label: string;
  /** ISO 3166-1 alpha-2 country code — rendered as real flag artwork via
   *  <FlagIcon>, not a pre-rendered emoji character (see flag-icon.tsx). */
  flag?: string;
  sublabel?: string;
  /** Extra space-separated search terms not shown in the UI (e.g. a
   *  timezone's alternate abbreviations) — matched in addition to `label`. */
  keywords?: string;
};

// Flag/name searchable dropdown used for every country and phone-code
// selector on the public site (mini quote form + wizard). Native <select>
// can't render a flag per option, so this is a small custom combobox instead
// — filters as you type, closes on outside click / Escape / selection, and
// supports Up/Down/Enter keyboard selection like a native <select>.
//
// The open panel is rendered through a portal into document.body instead of
// as a normal absolutely-positioned child. Every section on this page is
// wrapped in a ScrollReveal that applies a CSS transform while animating in
// — and any element with a non-"none" transform creates a new stacking
// context, which traps a descendant's z-index inside it no matter how high
// that z-index is set. That let *later* sections (e.g. the video block)
// paint over an open dropdown in an *earlier* section. Portaling to
// document.body sidesteps the whole problem: the panel is positioned with
// fixed coordinates read from the trigger button, entirely outside any
// ancestor's stacking context.
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select",
  name,
  id,
  invalid,
  pill,
  large,
  bare,
  placeholderIcon,
  label,
}: {
  options: readonly SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  invalid?: boolean;
  pill?: boolean;
  large?: boolean;
  /** No border or background of its own, for sitting inside a composite
   * control (the home page hero's quote card) that draws the frame. */
  bare?: boolean;
  placeholderIcon?: boolean;
  /** Shown as the title of the phone bottom sheet ("Sending to"...). */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  // Phones get a bottom sheet instead of a dropdown (2026-09-29): opening a
  // dropdown there scrolled the page up under your finger and fought the
  // smooth-scroll, which read as a jump and a glitch. The sheet never moves
  // the page; sheetBottom lifts it above the on-screen keyboard.
  const [sheet, setSheet] = useState(false);
  const [sheetBottom, setSheetBottom] = useState(0);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [rect, setRect] = useState<{
    flipUp: boolean;
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelId = `${id ?? "searchable-select"}-panel`;

  const selected = options.find((o) => o.value === value);
  // Best match first: an exact name, then names starting with the query,
  // then any other match. Otherwise typing "India" + Enter picked "British
  // Indian Ocean Territory", the first alphabetical hit.
  const q = query.trim().toLowerCase();
  const rank = (o: SearchableOption) => {
    const l = o.label.toLowerCase();
    return l === q ? 0 : l.startsWith(q) ? 1 : 2;
  };
  const filtered =
    q === ""
      ? options
      : options
          .filter((o) => o.label.toLowerCase().includes(q) || (o.keywords?.toLowerCase().includes(q) ?? false))
          .sort((a, b) => rank(a) - rank(b));

  // The panel is position:fixed at the trigger's coords, so it has to be
  // clamped to what's actually visible — otherwise, with the trigger low on
  // a phone screen, it renders past the bottom edge (and once the on-screen
  // keyboard opens, well past it), which is what made the country list look
  // detached from the field it belongs to. Measured against
  // window.visualViewport, not innerHeight: the keyboard shrinks the visual
  // viewport but NOT innerHeight, so innerHeight alone would keep assuming
  // space that the keyboard is now covering.
  // Returns the rect rather than setting it, so the open handler can compute
  // and commit it synchronously (see the flushSync in onOpen below).
  // In bare mode the button sits inside a composite field (the hero's
  // "Sending to" well), so the panel lines up with that whole frame rather
  // than with the text inside it.
  function anchorEl() {
    const btn = buttonRef.current;
    if (!btn) return null;
    return (bare && (btn.closest("[data-select-anchor]") as HTMLElement | null)) || btn;
  }

  // Direction and height are decided once, when the panel opens, and kept
  // while it's open (see lockedRef): re-deciding on every scroll made the
  // panel jump between above and below and change size mid-use.
  const lockedRef = useRef<{ flipUp: boolean; maxHeight: number } | null>(null);

  function computeRect() {
    const el = anchorEl();
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const vv = window.visualViewport;
    // visualViewport coords are relative to the visual viewport's own
    // origin; offsetTop is how far it's been shifted (keyboard/pinch).
    const viewTop = vv ? vv.offsetTop : 0;
    const viewBottom = viewTop + (vv ? vv.height : window.innerHeight);
    const GAP = 8;

    // Keep a 16px margin from the screen edge on either side.
    const spaceBelow = viewBottom - r.bottom - GAP - 16;
    const spaceAbove = r.top - viewTop - GAP - 16;
    // Flip above the trigger only when below genuinely can't fit a usable
    // list and above is roomier — never flip for a marginal difference,
    // since dropping downward is the expected direction.
    const locked = lockedRef.current;
    const flipUp = locked ? locked.flipUp : spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = locked
      ? locked.maxHeight
      : Math.max(140, Math.min(340, flipUp ? spaceAbove : spaceBelow));

    return {
      flipUp,
      top: flipUp ? r.top - GAP - maxHeight : r.bottom + (bare ? GAP : 4),
      left: r.left,
      width: r.width,
      maxHeight,
    };
  }

  function updateRect(e?: Event) {
    // The list scrolling inside the panel must not move the panel.
    if (e && e.target instanceof Node && document.getElementById(panelId)?.contains(e.target)) return;
    const next = computeRect();
    if (next) setRect(next);
  }

  // Opening has to happen entirely inside the click gesture, synchronously.
  // iOS Safari only raises the on-screen keyboard for a focus() that occurs
  // during a user gesture — a focus() from a useEffect (which is what this
  // used to do) runs after React's async re-render, by which point the
  // gesture is over and iOS silently refuses the keyboard. That's the
  // "keyboard didn't come automatically" report. `autoFocus` used to work
  // for exactly this reason: it ran inside the click's own render pass.
  //
  // So: scroll the field up, measure, then flushSync the open+rect commit so
  // the panel (and its input) actually exist in the DOM before this handler
  // returns — and only then focus, still inside the gesture.
  function onOpen() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      flushSync(() => {
        setSheet(true);
        setSheetBottom(0);
        setOpen(true);
        setHighlighted(Math.max(0, options.findIndex((o) => o.value === value)));
      });
      searchRef.current?.focus({ preventScroll: true });
      return;
    }
    setSheet(false);
    lockedRef.current = null;
    const next = computeRect();
    if (next) lockedRef.current = { flipUp: next.flipUp, maxHeight: next.maxHeight };
    flushSync(() => {
      if (next) setRect(next);
      setOpen(true);
      setHighlighted(Math.max(0, options.findIndex((o) => o.value === value)));
    });
    searchRef.current?.focus({ preventScroll: true });
  }

  // Position/dismiss wiring only — opening (scroll, measure, focus) all
  // happens synchronously in onOpen above, inside the click gesture.
  useEffect(() => {
    if (!open) return;
    // Open with the current choice in view (scrolling only the list, never
    // the page).
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>("[data-index] button.font-medium")?.parentElement;
    if (list && current) list.scrollTop = current.offsetTop - list.clientHeight / 2 + current.offsetHeight / 2;
    // No updateRect() here: onOpen already committed the rect synchronously
    // before this effect runs. Calling it again would just be a setState in
    // an effect body (cascading render) for a value that's already correct.

    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        rootRef.current &&
        !rootRef.current.contains(target) &&
        !document.getElementById(panelId)?.contains(target)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    if (sheet) {
      // Hold the page still behind the sheet, and keep the sheet above the
      // keyboard as it opens and closes.
      const html = document.documentElement;
      const prev = html.style.overflow;
      html.style.overflow = "hidden";
      const vv = window.visualViewport;
      const lift = () => {
        if (!vv) return;
        setSheetBottom(Math.max(0, window.innerHeight - (vv.height + vv.offsetTop)));
      };
      vv?.addEventListener("resize", lift);
      vv?.addEventListener("scroll", lift);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        html.style.overflow = prev;
        vv?.removeEventListener("resize", lift);
        vv?.removeEventListener("scroll", lift);
      };
    }
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    // The on-screen keyboard fires these, not window resize — without them
    // the panel keeps its pre-keyboard height and ends up underneath it.
    window.visualViewport?.addEventListener("resize", updateRect);
    window.visualViewport?.addEventListener("scroll", updateRect);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
      window.visualViewport?.removeEventListener("resize", updateRect);
      window.visualViewport?.removeEventListener("scroll", updateRect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sheet]);

  function selectOption(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => {
        const next = Math.min(i + 1, filtered.length - 1);
        listRef.current
          ?.querySelector(`[data-index="${next}"]`)
          ?.scrollIntoView({ block: "nearest" });
        return next;
      });
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => {
        const next = Math.max(i - 1, 0);
        listRef.current
          ?.querySelector(`[data-index="${next}"]`)
          ?.scrollIntoView({ block: "nearest" });
        return next;
      });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[highlighted];
      if (option) selectOption(option.value);
    }
  }

  const body = (
    <>
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[#EEF0F3] px-3.5 py-2.5">
        <MagnifyingGlassIcon size={16} className="shrink-0 text-ink-muted" />
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
            listRef.current?.scrollTo({ top: 0 });
          }}
          onKeyDown={onSearchKeyDown}
          placeholder="Search country"
          // text-base (16px), not text-sm (14px): iOS Safari auto-zooms the
          // whole page on focusing any input under 16px, which then desyncs
          // this panel's position:fixed coords from the trigger. Staying at
          // 16px+ prevents the zoom entirely.
          className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
        />
      </div>
      {/* overscroll-contain: reaching the end of the list never scrolls the
          page behind it. */}
      <ul ref={listRef} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
        {filtered.length === 0 && <li className="px-3 py-2.5 text-sm text-ink-muted">No matches</li>}
        {filtered.map((o, i) => {
          const isSelected = o.value === value;
          return (
            <li key={o.value} data-index={i}>
              <button
                type="button"
                onMouseMove={() => i !== highlighted && setHighlighted(i)}
                onClick={() => selectOption(o.value)}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[15px] transition-colors duration-75 ${
                  i === highlighted ? "bg-[#F2F4F7]" : ""
                } ${isSelected ? "font-medium text-ink" : "text-ink/85"}`}
              >
                {o.flag && <FlagIcon code={o.flag} className="h-3.5 w-5 shrink-0 rounded-[2px]" />}
                <span className="truncate">{o.label}</span>
                {o.sublabel && <span className="ml-auto shrink-0 text-ink-muted">{o.sublabel}</span>}
                {isSelected && <CheckIcon size={15} weight="bold" className={`${o.sublabel ? "" : "ml-auto"} shrink-0 text-brand`} />}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );

  const dropdown = open && !sheet && rect && (
    <div
      id={panelId}
      style={{
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: Math.max(rect.width, 280),
        // Whole panel (search box + list) is capped to the space measured at
        // open, and the list scrolls inside it, so it never runs off screen.
        maxHeight: rect.maxHeight,
        transformOrigin: rect.flipUp ? "bottom center" : "top center",
      }}
      className="select-pop z-50 flex flex-col overflow-hidden rounded-2xl border border-[#E6E8EC] bg-white shadow-[0_24px_60px_-20px_rgba(16,24,40,0.28),0_2px_6px_-2px_rgba(16,24,40,0.08)]"
    >
      {body}
    </div>
  );

  const bottomSheet = open && sheet && (
    <>
      <div aria-hidden className="sheet-fade fixed inset-0 z-50 bg-[#0B1220]/40" />
      <div
        id={panelId}
        role="dialog"
        aria-label={label ?? placeholder}
        style={{ bottom: sheetBottom, maxHeight: `calc(100dvh - ${sheetBottom}px - 56px)` }}
        className="sheet-up fixed inset-x-0 z-50 flex h-[78dvh] flex-col overflow-hidden rounded-t-[28px] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_60px_-20px_rgba(16,24,40,0.35)]"
      >
        <div className="flex shrink-0 flex-col items-center pb-1 pt-2.5">
          <span aria-hidden className="h-1 w-10 rounded-full bg-[#D5DBE5]" />
          <span className="mt-3 text-[15px] font-semibold text-ink">{label ?? "Choose a country"}</span>
        </div>
        {body}
      </div>
    </>
  );

  return (
    // scroll-mt-28 is the landing offset for the scrollIntoView above — it
    // keeps the field below the sticky header rather than under it.
    <div ref={rootRef} className="relative scroll-mt-28">
      {/* Real, name-bearing input so plain <form> submits and RHF register()
          fallbacks still see the value even if JS interaction is bypassed. */}
      <input type="hidden" name={name} value={value} readOnly />
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false);
            setQuery("");
          } else {
            onOpen();
          }
        }}
        // Non-large triggers: text-base on mobile, text-sm from md up. Same
        // iOS focus-zoom reason as the search input below — a <16px control
        // makes Safari zoom the page in and not back out.
        className={
          bare
            ? "mt-0.5 flex w-full items-center justify-between gap-2 rounded-lg bg-transparent text-left text-[18px] font-semibold tracking-[-0.015em] text-ink outline-none"
            : `flex w-full items-center justify-between gap-2 border bg-white text-left text-ink outline-none focus:border-brand ${large ? "px-4 py-4 text-base" : "px-4 py-3 text-base md:text-sm"} ${pill ? "rounded-full" : "rounded-xl"} ${open ? "border-brand" : invalid ? "border-red-400" : "border-brand-light"}`
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.flag && <FlagIcon code={selected.flag} className="h-3.5 w-5 shrink-0" />}
          {!selected && placeholderIcon && (
            <MapPinIcon size={large ? 18 : 16} className="shrink-0 text-ink-muted" />
          )}
          <span className={`truncate ${selected ? "text-ink" : "text-ink-muted"}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <CaretDownIcon size={large ? 16 : 14} className="shrink-0 text-ink-muted" />
      </button>

      {dropdown ? createPortal(dropdown, document.body) : null}
      {bottomSheet ? createPortal(bottomSheet, document.body) : null}
    </div>
  );
}
