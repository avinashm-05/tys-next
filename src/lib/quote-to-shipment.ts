// Shared by the Quotes list row action and the quote detail page's "Convert
// to Shipment" banner — builds the prefill query string once so the two
// call sites can't drift on which fields get carried over.
export function buildConvertToShipmentHref(quote: {
  id: number;
  fromCountry: string;
  fromZip: string;
  toCountry: string;
  toZip: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}): string {
  const params = new URLSearchParams({
    quoteId: String(quote.id),
    fromCountry: quote.fromCountry,
    fromZip: quote.fromZip,
    toCountry: quote.toCountry,
    toZip: quote.toZip,
    ...(quote.contactName ? { contactName: quote.contactName } : {}),
    ...(quote.contactEmail ? { contactEmail: quote.contactEmail } : {}),
    ...(quote.contactPhone ? { contactPhone: quote.contactPhone } : {}),
  });
  return `/admin/shipments/new?${params.toString()}`;
}
