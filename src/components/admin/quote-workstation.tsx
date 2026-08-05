import { FedExRatesPanel } from "@/components/admin/fedex-rates-panel";

// Thin wrapper around the rate panel, which now owns the entire pricing +
// send flow itself (one "Send quote" button, whatever's checked/entered) —
// kept as a separate component only so the quote detail page doesn't need to
// know the estimatedCost → currentAmount conversion.
export function QuoteWorkstation({
  quoteId,
  isResidence,
  currency,
  estimatedCost,
  sendTo,
  packageType,
}: {
  quoteId: number;
  isResidence: boolean;
  currency: string;
  estimatedCost: string | null;
  sendTo: string | null;
  packageType: string;
}) {
  return (
    <FedExRatesPanel
      quoteId={quoteId}
      isResidence={isResidence}
      defaultCurrency={currency}
      currentAmount={estimatedCost != null ? Number(estimatedCost) : null}
      packageType={packageType}
      sendTo={sendTo}
    />
  );
}
