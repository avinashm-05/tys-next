"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { FedExRatesPanel } from "@/components/admin/fedex-rates-panel";

// The interactive half of the quote detail page: rate panel (rate-shopping +
// price-lock + callback discount, all in one) and the Send action. Price
// state lives on the server; after a lock or send we router.refresh() so the
// server page re-renders with the new estimatedCost / status.
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
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasPrice = estimatedCost != null;

  async function send() {
    const res = await adminApi<{ sentTo: string }>(`/api/admin/quotes/${quoteId}/send`, {
      method: "POST",
    });
    toast.success(`Quote sent to ${res.sentTo}.`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <FedExRatesPanel
        quoteId={quoteId}
        isResidence={isResidence}
        defaultCurrency={currency}
        currentAmount={hasPrice ? Number(estimatedCost) : null}
        packageType={packageType}
      />

      {/* The one send action on the page — bordered/filled so it reads as a
          distinct final step rather than a button floating in blank space. */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-tys-mist bg-muted/20 p-4">
        <div>
          <p className="text-sm font-medium">
            {hasPrice ? `Ready to send — ${estimatedCost} ${currency}` : "Not priced yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {hasPrice
              ? sendTo
                ? `Emails the confirmed quote to ${sendTo}.`
                : "Emails the confirmed quote to the customer."
              : "Lock in a price above before sending."}
          </p>
        </div>
        <Button
          size="lg"
          className="bg-tys-blue text-white hover:bg-tys-blue/90"
          disabled={!hasPrice}
          onClick={() => setConfirmOpen(true)}
        >
          <PaperPlaneTiltIcon size={16} weight="bold" />
          Send quote
        </Button>
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
