"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { CaretDownIcon, MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react/dist/ssr";
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
  placeholderIcon,
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
  placeholderIcon?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [rect, setRect] = useState<{
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
  const filtered =
    query.trim() === ""
      ? options
      : options.filter((o) => {
          const q = query.trim().toLowerCase();
          return o.label.toLowerCase().includes(q) || (o.keywords?.toLowerCase().includes(q) ?? false);
        });

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
  function computeRect() {
    const btn = buttonRef.current;
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    const vv = window.visualViewport;
    // visualViewport coords are relative to the visual viewport's own
    // origin; offsetTop is how far it's been shifted (keyboard/pinch).
    const viewTop = vv ? vv.offsetTop : 0;
    const viewBottom = viewTop + (vv ? vv.height : window.innerHeight);
    const GAP = 8;

    const spaceBelow = viewBottom - r.bottom - GAP;
    const spaceAbove = r.top - viewTop - GAP;
    // Flip above the trigger only when below genuinely can't fit a usable
    // list and above is roomier — never flip for a marginal difference,
    // since dropping downward is the expected direction.
    const flipUp = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(140, Math.min(360, flipUp ? spaceAbove : spaceBelow));

    return {
      top: flipUp ? r.top - GAP - maxHeight : r.bottom + 2,
      left: r.left,
      width: r.width,
      maxHeight,
    };
  }

  function updateRect() {
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
    const root = rootRef.current;
    if (root && window.matchMedia("(max-width: 767px)").matches) {
      if (root.getBoundingClientRect().top > 240) {
        root.scrollIntoView({ block: "start", behavior: "auto" });
      }
    }
    const next = computeRect();
    flushSync(() => {
      if (next) setRect(next);
      setOpen(true);
    });
    searchRef.current?.focus({ preventScroll: true });
  }

  // Position/dismiss wiring only — opening (scroll, measure, focus) all
  // happens synchronously in onOpen above, inside the click gesture.
  useEffect(() => {
    if (!open) return;
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
  }, [open]);

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

  const panel = open && rect && (
    <div
      id={panelId}
      style={{
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: Math.max(rect.width, 256),
        // Whole panel (search box + list) is capped to the measured space,
        // and the list scrolls inside it — so it can never run off the
        // bottom of the screen or under the keyboard.
        maxHeight: rect.maxHeight,
      }}
      className="z-50 flex flex-col overflow-hidden rounded-xl border border-brand-light bg-white shadow-lg"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-brand-light px-3 py-2">
        <MagnifyingGlassIcon size={14} className="text-ink-muted" />
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
          }}
          onKeyDown={onSearchKeyDown}
          placeholder="Search country"
          // text-base (16px), not text-sm (14px): iOS Safari auto-zooms the
          // whole page on focusing any input under 16px, which then desyncs
          // this panel's position:fixed coords (captured pre-zoom in
          // updateRect) from the trigger button — reproduced as "zooms in,
          // dropdown moves away" on iPhone Safari, absent on desktop Safari
          // (no focus-zoom there). Staying at 16px+ prevents the zoom
          // entirely rather than chasing a reposition after the fact.
          className="w-full text-base text-ink outline-none placeholder:text-ink-muted"
        />
      </div>
      {/* flex-1 + min-h-0 instead of a fixed max-h-64: the panel's own
          measured maxHeight is the real constraint now, and min-h-0 is what
          lets a flex child actually shrink enough to scroll. */}
      <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-1">
        {filtered.length === 0 && <li className="px-4 py-2 text-sm text-ink-muted">No matches</li>}
        {filtered.map((o, i) => (
          <li key={o.value} data-index={i}>
            <button
              type="button"
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => selectOption(o.value)}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${
                i === highlighted || o.value === value ? "bg-brand-pale text-brand" : "text-ink"
              }`}
            >
              {o.flag && <FlagIcon code={o.flag} className="h-3.5 w-5 shrink-0" />}
              <span className="truncate">{o.label}</span>
              {o.sublabel && <span className="ml-auto shrink-0 text-ink-muted">{o.sublabel}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
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
        className={`flex w-full items-center justify-between gap-2 border bg-white text-left text-ink outline-none focus:border-brand ${large ? "px-4 py-4 text-base" : "px-4 py-3 text-base md:text-sm"} ${pill ? "rounded-full" : "rounded-xl"} ${open ? "border-brand" : invalid ? "border-red-400" : "border-brand-light"}`}
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

      {panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
