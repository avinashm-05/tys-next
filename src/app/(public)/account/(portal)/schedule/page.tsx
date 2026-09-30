import type { Metadata } from "next";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { PortalCard } from "@/components/public/account/portal-card";
import { ShipmentWizardForm } from "@/components/public/shipment-wizard-form";

export const metadata: Metadata = { title: "Schedule Shipment | TYS Global Logistics" };

// Scheduling lives INSIDE the portal so the sidebar stays put while you move
// between it and My Shipments — the reference hub keeps its nav on every
// screen, and the old /book-shipment route sat outside this route group, so
// picking "Schedule Shipment" made the whole sidebar disappear.
//
// No login/verify gating here: the (portal) layout's requireCustomerPage()
// already redirects unauthenticated visitors to /account/login and
// unverified ones to /account/verify-email. /book-shipment still exists for
// logged-out visitors and deep links, and forwards here once you're in.
//
export default async function SchedulePage() {
  const session = await requireCustomerPage();
  // Saved profile details pre-fill the Sender step.
  const u = await db.user.findUnique({
    where: { id: BigInt(session.user.id) },
    select: {
      name: true,
      email: true,
      phone: true,
      companyName: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
    },
  });
  return (
    <div className="mx-auto max-w-[1100px]">
      <PortalCard>
        <ShipmentWizardForm
          senderDefaults={{
            contact_name: u?.name ?? session.user.name,
            email: u?.email ?? session.user.email,
            phone_1: u?.phone ?? undefined,
            company_name: u?.companyName ?? undefined,
            address_line_1: u?.addressLine1 ?? undefined,
            address_line_2: u?.addressLine2 ?? undefined,
            city: u?.city ?? undefined,
            state: u?.state ?? undefined,
            country: u?.country ?? undefined,
            postal_code: u?.postalCode ?? undefined,
          }}
        />
      </PortalCard>
    </div>
  );
}
