"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { CftCalculator } from "@/components/admin/cft-calculator";
import { FedExRatesPanel } from "@/components/admin/fedex-rates-panel";

// The interactive half of the quote detail page: rate panel + price-lock,
// CFT calculator, and the Send action. Price state lives on the server; after
// a lock or send we router.refresh() so the server page re-renders with the
// new estimatedCost / status.
export function QuoteWorkstation({
  quoteId,
  isResidence,
  currency,
  hasPrice,
  sendTo,
}: {
  quoteId: number;
  isResidence: boolean;
  currency: string;
  hasPrice: boolean;
  sendTo: string | null;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function send() {
    const res = await adminApi<{ sentTo: string }>(`/api/admin/quotes/${quoteId}/send`, {
      method: "POST",
    });
    toast.success(`Quote sent to ${res.sentTo}.`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <FedExRatesPanel quoteId={quoteId} isResidence={isResidence} defaultCurrency={currency} />
      <CftCalculator />

      <div className="flex items-center gap-3">
        <Button
          className="bg-tys-orange text-white hover:bg-tys-orange/90"
          disabled={!hasPrice}
          onClick={() => setConfirmOpen(true)}
        >
          Send quote
        </Button>
        {!hasPrice && (
          <span className="text-sm text-muted-foreground">
            Lock in a price above before sending.
          </span>
        )}
      </div>

      {/* Reuses the confirm dialog; a thrown ApiError (e.g. 422 unpriced) shows inline. */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Send quote"
        description={
          sendTo
            ? `Email the confirmed quote to ${sendTo}? The status will move to "quoted".`
            : `Email the confirmed quote to the customer? The status will move to "quoted".`
        }
        confirmLabel="Send quote"
        confirmVariant="default"
        busyLabel="Sending…"
        errorFallback="The quote could not be sent. Try again."
        onConfirm={send}
      />
    </div>
  );
}
