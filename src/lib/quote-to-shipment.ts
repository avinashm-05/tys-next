// "Convert to Shipment" link. Carries ONLY the quote id: the new-shipment
// page re-reads route and contact details from the database. It used to put
// the customer's name, email and phone in the URL, which leaked them into
// browser history and server/CDN access logs (privacy audit 2026-09-30).
export function buildConvertToShipmentHref(quote: { id: number }): string {
  return `/admin/shipments/new?quoteId=${encodeURIComponent(String(quote.id))}`;
}
