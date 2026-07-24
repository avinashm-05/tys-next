import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You - TYS Global Logistics",
};

// Faithful port of quotes/thank-you.blade.php. The (public) layout already
// provides the header, footer, stylesheets, and scripts, so this page renders
// only the hero band + the thank-you card. The card's page-specific CSS is a
// scoped <style> (present only while on /thank-you), copied from the blade's
// inline styles. `name` comes from the wizard redirect (?name=) — React
// escapes it, so the interpolation is XSS-safe.
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const customer = name?.trim() || "Customer";

  return (
    <>
      <style>{`
        body { background-color: #f8fbff; }
        .thank-you-card { background: #fff; border-radius: 20px; padding: 50px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e9ecef; text-align: center; }
        .thank-you-card .success-icon { font-size: 5rem; color: #00c851; margin-bottom: 25px; }
        .thank-you-card h2 { font-family: "DM Sans", sans-serif; font-weight: 700; color: #2c3e50; margin-bottom: 20px; }
        .thank-you-card p { font-family: "DM Sans", sans-serif; color: #6c757d; font-size: 1.1rem; line-height: 1.7; max-width: 600px; margin: 0 auto 15px auto; }
        .thank-you-card .btn-container { display: flex; justify-content: center; gap: 15px; margin-top: 35px; flex-wrap: wrap; }
        .thank-you-card .btn-container .fillbttn { min-width: 180px; text-decoration: none; }
      `}</style>

      {/* Hero band */}
      <div
        className="hero-bg"
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundPosition: "unset",
          paddingTop: "160px",
          paddingBottom: "60px",
          backgroundColor: "#0d6efd",
        }}
      >
        <img
          src="/frontend/assets/images/herotop.png"
          alt=""
          className="herotoppngimg img-fluid"
          style={{ top: "82%" }}
        />
        <div className="container herocontainercss text-center text-white">
          <h1
            className="header-text herosectitle"
            id="heroContent"
            style={{ fontSize: "clamp(32px, 5vw, 60px)", color: "white", margin: 0 }}
          >
            Submission Success
          </h1>
        </div>
      </div>

      {/* Main content */}
      <main className="container my-5 py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-12">
            <div className="thank-you-card">
              <div className="success-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>

              <h2>Dear {customer},</h2>

              <p>
                Thank you for requesting a shipping quote. We have received your request and our
                team will review your details and get back to you within 24 hours with a custom
                quote.
              </p>

              <p>
                If you have any urgent questions, please feel free to reach out to our customer
                support.
              </p>

              <div className="btn-container">
                <a href="/" className="fillbttn">
                  Back to Home
                </a>
                <a href="/#bookShipmentForm" className="fillbttn fillbttn2">
                  Get New Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
