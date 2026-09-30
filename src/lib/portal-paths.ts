// The signed-in customer portal's routes. On these the marketing header,
// promo bar and footer are replaced by the portal's own top bar and sidebar
// (2026-09-30, modelled on SFL's hub): an app screen, not a web page.
export const PORTAL_PATH = /^\/account\/(schedule|shipments|profile|quotes|tracking)(\/|$)/;

/** Customer sign-in pages where "Book now" / "Sign in" in the header would point at the page you're on. */
export const CUSTOMER_AUTH_PATH = /^\/(account(\/|$)|book-shipment(\/|$))/;
