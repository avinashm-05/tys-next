// Health check — same URL Laravel exposed (02-routes). Deliberately does not
// touch the DB so a DB blip can't make the host restart-loop the app.
export function GET() {
  return new Response("OK");
}
