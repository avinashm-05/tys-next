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
      <label className="text-[13px] font-medium text-foreground/70" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

// Was a trailing-icon input (SETU reference: an icon in every field). Since
// the 2026-10-05 admin restyle the icons are gone (they made long forms
// noisy); kept as a plain Input so the shipment and quote forms don't change.
export function IconInput({
  className,
  ...props
}: ComponentProps<typeof Input> & { icon?: React.ComponentType<{ size?: number; className?: string }> }) {
  const { icon, ...inputProps } = props;
  void icon;
  return <Input className={cn(className)} {...inputProps} />;
}
