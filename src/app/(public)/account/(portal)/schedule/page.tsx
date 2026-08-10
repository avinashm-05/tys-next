import type { Metadata } from "next";
import { requireCustomerPage } from "@/lib/auth";
import { ShipmentWizardForm } from "@/components/public/shipment-wizard-form";

export const metadata: Metadata = { title: "Schedule Shipment — TYS Global Logistics" };

// Scheduling lives INSIDE the portal so the sidebar stays put while you move
// between it and My Shipments — the reference hub keeps its nav on every
// screen, and the old /book-shipment route sat outside this route group, so
// picking "Schedule Shipment" made the whole sidebar disappear.
//
// No login/verify gating here: the (portal) layout's requireCustomerPage()
// already redirects unauthenticated visitors to /account/login and
// unverified ones to /account/verify-email. /book-shipment still exists for
// logged-out visitors and deep links, and forwards here once you're in.
export default async function SchedulePage() {
  await requireCustomerPage();
  return <ShipmentWizardForm />;
}
