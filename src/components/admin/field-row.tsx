import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Shared label-above-input wrapper for the Shipment forms — matches the
// plain label/input pattern already used in Get Rates (price-check-tool.tsx)
// rather than pulling in the full Field/FieldSet form-kit for a page with no
// real submission target yet.
export function FieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

// Trailing field icon (SETU reference: every Sender/Recipient field carries
// one) — same absolute-positioned pattern already used in vendor-form.tsx's
// `text()` helper, reused here as a standalone Input variant.
export function IconInput({
  icon: Icon,
  className,
  ...props
}: ComponentProps<typeof Input> & { icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="relative">
      <Input className={cn("pr-9", className)} {...props} />
      <Icon
        size={15}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-tys-rose/70"
      />
    </div>
  );
}
