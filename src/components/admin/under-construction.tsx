import { HardHatIcon } from "@phosphor-icons/react/dist/ssr";

// The honest placeholder for anything gated on work that isn't built yet
// (FedEx Ship/Track API, real Shipment records, document storage) — never a
// fabricated row or a silently-broken control. Matches the "no fake rows,
// ever" rule already followed by the customer's own /account dashboard.
export function UnderConstruction({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-tys-mist bg-muted/30 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
        <HardHatIcon size={24} weight="bold" />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
