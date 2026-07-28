"use client";

import { useMemo, useState } from "react";
import { Popover } from "radix-ui";
import { CaretDownIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type ComboboxOption = { id: number; name: string };

/**
 * Search-and-select, or type a name that doesn't exist yet and create it on
 * the fly (persisted via `onCreate`, then selected). Used wherever a small
 * lookup list (vendor types, services, …) doesn't need its own management
 * page — creating a new option happens right where it's needed.
 */
export function CreatableCombobox({
  id,
  value,
  onChange,
  options,
  onCreate,
  placeholder = "Select or type to add…",
  triggerClassName,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (id: string) => void;
  options: ComboboxOption[];
  onCreate: (name: string) => Promise<ComboboxOption>;
  placeholder?: string;
  triggerClassName?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const selected = options.find((o) => String(o.id) === value);
  const trimmed = query.trim();
  const filtered = useMemo(
    () => options.filter((o) => o.name.toLowerCase().includes(trimmed.toLowerCase())),
    [options, trimmed],
  );
  const exactMatch = filtered.some((o) => o.name.toLowerCase() === trimmed.toLowerCase());

  async function handleCreate() {
    if (!trimmed || creating) return;
    setCreating(true);
    try {
      const created = await onCreate(trimmed);
      onChange(String(created.id));
      setQuery("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-1.5 rounded-xl border border-input bg-transparent px-3.5 py-2 text-left text-sm whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
            triggerClassName,
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.name : placeholder}
          </span>
          <CaretDownIcon size={14} className="shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-(--radix-popover-trigger-width) overflow-hidden rounded-xl border border-tys-mist bg-popover text-popover-foreground shadow-lg"
        >
          <div className="border-b border-tys-mist p-2">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type to add new…"
              className="h-9"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(String(o.id));
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-accent"
              >
                <CheckIcon
                  size={14}
                  className={String(o.id) === value ? "opacity-100" : "opacity-0"}
                />
                {o.name}
              </button>
            ))}
            {filtered.length === 0 && !trimmed && (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                Nothing yet — type to add the first one.
              </div>
            )}
            {trimmed && !exactMatch && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-tys-blue hover:bg-accent disabled:opacity-50"
              >
                <PlusIcon size={14} />
                {creating ? "Adding…" : `Add "${trimmed}"`}
              </button>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
