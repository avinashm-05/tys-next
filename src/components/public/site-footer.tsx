// Footer ported verbatim from welcome.blade.php.
export function SiteFooter() {
  return (
    <footer>
      <div className="container">
        <div className="row justify-content-start">
          <div className="col-md-4 col-12">
            <div className="footerleft">
              <img
                src="/frontend/logo/TYS_LOGO_25_6_Black.webp"
                className="img-fluid"
                alt="TYS Global Logistics"
                style={{ width: "350px", height: "80px" }}
              />
              <div className="socialicons">
                <div className="socialiconbg">
                  <a
                    href="https://www.instagram.com/tysgloballogistics"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <img
                      src="/frontend/assets/images/instagram.svg"
                      className="img-fluid"
                      alt="Instagram"
                    />
                  </a>
                </div>
                <div className="socialiconbg">
                  <a
                    href="https://www.linkedin.com/company/tys-global-logistics/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <img
                      src="/frontend/assets/images/facebook.svg"
                      className="img-fluid"
                      alt="LinkedIn"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 col-12">
            <div className="footerlinks">
              <h3>Quick Links</h3>
              <div className="footerlinkitems">
                <a href="#heroContent">Home</a>
                <a href="#features">Services</a>
                <a href="#whyus">About Us</a>
                <a href="#faq">FAQs</a>
                <a href="#bookShipmentForm">Track Shipment</a>
              </div>
            </div>
          </div>

          <div className="col-md-4 col-12">
            <div className="footercontact">
              <h3>Contact</h3>
              <div className="footercontactitem">+1 404 793 8759</div>
              <div className="footercontactitem">
                <a href="mailto:hello@tysgloballogistics.com">hello@tysgloballogistics.com</a>
              </div>
              <div className="footercontactitem">United States</div>
            </div>
          </div>

          <div className="col-12 copyrightfooter">
            <div className="copyrightdata">
              Copyright © 2026 TYS Global Logistics LLC. All rights reserved.
            </div>
            <div className="disclaimerdata">
              TYS Global Logistics LLC provides reliable domestic and international logistics
              services.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
