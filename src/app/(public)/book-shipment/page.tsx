import type { Metadata } from "next";
import { PackageIcon } from "@phosphor-icons/react/dist/ssr";
import { ComingSoon } from "@/components/public/coming-soon";

export const metadata: Metadata = { title: "Book Shipment — TYS Global Logistics" };

export default function BookShipmentPage() {
  return (
    <ComingSoon
      icon={PackageIcon}
      title="Book a Shipment"
      body="Online booking is coming soon. Get a free quote today and our team will help you book and confirm your shipment."
    />
  );
}
