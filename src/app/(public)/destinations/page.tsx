import type { Metadata } from "next";
import { GlobeIcon } from "@phosphor-icons/react/dist/ssr";
import { ComingSoon } from "@/components/public/coming-soon";

export const metadata: Metadata = { title: "Destinations — TYS Global Logistics" };

export default function DestinationsPage() {
  return (
    <ComingSoon
      icon={GlobeIcon}
      title="Worldwide Destinations"
      body="We're building out a full country-by-country guide to our shipping and moving destinations. In the meantime, get a free quote for your route."
    />
  );
}
