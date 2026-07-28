"use client";

import { useState } from "react";
import { CalendarIcon, CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Airbnb-style range calendar for the admin list filter bars — replaces the
// two native <input type="date"> fields (browser chrome that can't be
// restyled beyond its border box) with a real month grid: filled circle on
// the two endpoints, soft band across the days between, one click each for
// start/end. Dates are kept as plain "YYYY-MM-DD" strings, matching what the
// native inputs produced, so the list's query-param plumbing is unchanged.

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Parsed via y/m/d parts (not `new Date(iso)`) so it lands on the intended
// calendar day regardless of the browser's local timezone offset.
function fromIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function formatShort(iso: string): string {
  const d = fromIso(iso);
  if (!d) return "";
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

export function DateRangeFilter({
  fromDate,
  toDate,
  onChange,
  label = "Date",
}: {
  fromDate: string;
  toDate: string;
  onChange: (fromDate: string, toDate: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const start = fromIso(fromDate) ?? new Date();
    return new Date(start.getFullYear(), start.getMonth(), 1);
  });

  const from = fromIso(fromDate);
  const to = fromIso(toDate);

  function selectDay(day: Date) {
    const iso = toIso(day);
    if (!from || (from && to)) {
      // Starting a fresh range.
      onChange(iso, "");
      return;
    }
    // `from` is set, `to` isn't — this click finishes (or restarts) the range.
    if (day < from) {
      onChange(iso, "");
      return;
    }
    onChange(toIso(from), iso);
    setOpen(false);
  }

  function clear() {
    onChange("", "");
  }

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const triggerLabel =
    from && to
      ? `${formatShort(fromDate)} – ${formatShort(toDate)}`
      : from
        ? `${formatShort(fromDate)} – Select end`
        : `Any ${label.toLowerCase()}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("gap-2", !from && "text-muted-foreground")}
          aria-label={`Filter by ${label.toLowerCase()}`}
        >
          <CalendarIcon size={16} />
          {triggerLabel}
          {from && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear dates"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  clear();
                }
              }}
              className="ml-1 flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <XIcon size={11} weight="bold" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px]">
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setViewMonth(new Date(year, month - 1, 1))}
            className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <CaretLeftIcon size={14} />
          </button>
          <span className="text-sm font-semibold">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setViewMonth(new Date(year, month + 1, 1))}
            className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <CaretRightIcon size={14} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-muted-foreground">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="flex h-7 items-center justify-center">
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <span key={i} />;
            const iso = toIso(day);
            const isStart = from && iso === toIso(from);
            const isEnd = to && iso === toIso(to);
            const inRange = from && to && day > from && day < to;
            const isToday = iso === toIso(new Date());

            return (
              <div
                key={i}
                className={cn(
                  "relative flex h-9 items-center justify-center",
                  inRange && "bg-primary/10",
                  isStart && to && "rounded-l-full bg-primary/10",
                  isEnd && from && "rounded-r-full bg-primary/10",
                )}
              >
                <button
                  type="button"
                  onClick={() => selectDay(day)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm transition-colors hover:border hover:border-foreground",
                    (isStart || isEnd) && "bg-foreground text-background font-semibold hover:border-transparent",
                    !isStart && !isEnd && isToday && "border border-foreground/40",
                  )}
                >
                  {day.getDate()}
                </button>
              </div>
            );
          })}
        </div>

        {from && (
          <button
            type="button"
            onClick={clear}
            className="mt-3 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear dates
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
