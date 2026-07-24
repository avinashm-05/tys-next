"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CaretDownIcon, MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react/dist/ssr";

export type SearchableOption = { value: string; label: string; flag?: string; sublabel?: string };

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
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const panelId = `${id ?? "searchable-select"}-panel`;

  const selected = options.find((o) => o.value === value);
  const filtered =
    query.trim() === ""
      ? options
      : options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  function updateRect() {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    setRect({ top: r.bottom + 2, left: r.left, width: r.width });
  }

  useEffect(() => {
    if (!open) return;
    updateRect();
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
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
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
      style={{ position: "fixed", top: rect.top, left: rect.left, width: Math.max(rect.width, 256) }}
      className="z-50 rounded-xl border border-brand-light bg-white shadow-lg"
    >
      <div className="flex items-center gap-2 border-b border-brand-light px-3 py-2">
        <MagnifyingGlassIcon size={14} className="text-ink-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
          }}
          onKeyDown={onSearchKeyDown}
          placeholder="Search country"
          className="w-full text-sm text-ink outline-none placeholder:text-ink-muted"
        />
      </div>
      <ul ref={listRef} className="max-h-64 overflow-y-auto py-1">
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
              {o.flag && <span className="text-base leading-none">{o.flag}</span>}
              <span className="truncate">{o.label}</span>
              {o.sublabel && <span className="ml-auto shrink-0 text-ink-muted">{o.sublabel}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      {/* Real, name-bearing input so plain <form> submits and RHF register()
          fallbacks still see the value even if JS interaction is bypassed. */}
      <input type="hidden" name={name} value={value} readOnly />
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 border bg-white text-left text-ink outline-none focus:border-brand ${large ? "px-4 py-4 text-base" : "px-4 py-3 text-sm"} ${pill ? "rounded-full" : "rounded-xl"} ${open ? "border-brand" : invalid ? "border-red-400" : "border-brand-light"}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.flag && <span className="text-base leading-none">{selected.flag}</span>}
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
