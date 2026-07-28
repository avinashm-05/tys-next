"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  LightningIcon,
  PhoneCallIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { buildConvertToShipmentHref } from "@/lib/quote-to-shipment";
import { Button } from "@/components/ui/button";

type Quote = {
  id: number;
  status: string;
  hasPrice: boolean;
  fromCountry: string;
  fromZip: string;
  toCountry: string;
  toZip: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

// One always-visible answer to "what do I do with this quote right now" —
// support handles dozens of these a day, so the page shouldn't make them
// hunt through cards/tabs to figure out the next step for each status.
export function QuoteNextStep({ quote }: { quote: Quote }) {
  const router = useRouter();
  const [changing, setChanging] = useState(false);

  async function setStatus(next: "accepted" | "cancelled") {
    setChanging(true);
    try {
      await adminApi(`/api/admin/quotes/${quote.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      toast.success(next === "accepted" ? "Marked accepted." : "Marked declined.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't update the status.");
    } finally {
      setChanging(false);
    }
  }

  if (quote.status === "pending") {
    return (
      <Banner icon={LightningIcon} tone="blue" title="New request — get live rates and send it.">
        <a href="#pricing">
          <Button className="bg-tys-blue text-white hover:bg-tys-blue/90">
            Get rates &amp; send
            <ArrowRightIcon size={16} weight="bold" />
          </Button>
        </a>
      </Banner>
    );
  }

  if (quote.status === "quoted") {
    return (
      <Banner
        icon={PhoneCallIcon}
        tone="indigo"
        title="Sent — waiting on the customer."
        subtitle="When they call back: accept to move to booking, decline to close it out, or adjust the price with the discount tool below and re-send."
      >
        <Button
          className="bg-emerald-600 text-white hover:bg-emerald-600/90"
          disabled={changing}
          onClick={() => setStatus("accepted")}
        >
          Customer accepted
        </Button>
        <Button variant="outline" disabled={changing} onClick={() => setStatus("cancelled")}>
          Customer declined
        </Button>
      </Banner>
    );
  }

  if (quote.status === "accepted") {
    return (
      <Banner icon={CheckCircleIcon} tone="emerald" title="Accepted — ready to book.">
        <Button asChild className="bg-tys-indigo text-white hover:bg-tys-indigo/90">
          <Link
            href={buildConvertToShipmentHref({
              id: quote.id,
              fromCountry: quote.fromCountry,
              fromZip: quote.fromZip,
              toCountry: quote.toCountry,
              toZip: quote.toZip,
              contactName: quote.contactName,
              contactEmail: quote.contactEmail,
              contactPhone: quote.contactPhone,
            })}
          >
            Convert to Shipment
            <ArrowRightIcon size={16} weight="bold" />
          </Link>
        </Button>
      </Banner>
    );
  }

  return (
    <Banner icon={XCircleIcon} tone="muted" title="Declined — no further action needed." />
  );
}

function Banner({
  icon: Icon,
  tone,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; weight?: "bold"; className?: string }>;
  tone: "blue" | "indigo" | "emerald" | "muted";
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const toneClasses: Record<string, string> = {
    blue: "border-tys-blue/30 bg-tys-blue/5",
    indigo: "border-tys-indigo/30 bg-tys-indigo/5",
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    muted: "border-tys-mist bg-muted/30",
  };
  const iconToneClasses: Record<string, string> = {
    blue: "bg-tys-blue text-white",
    indigo: "bg-tys-indigo text-white",
    emerald: "bg-emerald-600 text-white",
    muted: "bg-muted-foreground/20 text-muted-foreground",
  };
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconToneClasses[tone]}`}>
          <Icon size={20} weight="bold" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
