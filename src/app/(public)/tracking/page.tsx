import type { Metadata } from "next";
import { MapPinLineIcon } from "@phosphor-icons/react/dist/ssr";
import { ComingSoon } from "@/components/public/coming-soon";

export const metadata: Metadata = { title: "Track a Shipment — TYS Global Logistics" };

export default function TrackingPage() {
  return (
    <ComingSoon
      icon={MapPinLineIcon}
      title="Track a Shipment"
      body="Shipment tracking is on its way. Once your quote turns into a booking, you'll get a tracking link by email — this page will let you look it up directly too."
    />
  );
}
