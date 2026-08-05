import { redirect } from "next/navigation";

// Dashboard is no longer a sidebar item (matches the SFL reference's
// minimal Schedule Shipment / My Shipment(s) / Profile nav) — bare /account
// now lands on Shipments, the portal's new default view.
export default function AccountRootPage() {
  redirect("/account/shipments");
}
