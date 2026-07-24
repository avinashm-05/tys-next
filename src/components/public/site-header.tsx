"use client";

import { useEffect, useState } from "react";

// Header ported verbatim from welcome.blade.php (top-header / top-nav-bar).
// The hamburger toggle reproduces navbar.js exactly: toggling `ham-active` on
// the button and `nav-bar-link-container-hide` on the menu, and closing the
// menu on any outside click below 993px.
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDocClick = () => {
      if (window.innerWidth < 993) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return (
    <header className="top-header">
      <nav className="top-nav-bar">
        <div className="nav-logo-container">
          <a href="/">
            <img
              src="/frontend/logo/TYS_LOGO_25_6.webp"
              alt="TYS GLOBAL LOGISTICS"
              className="nav-logo-img img-fluid"
            />
          </a>
        </div>
        <div className="nav-bar-content nav-menu-container">
          <div
            className={`hamburger-container${open ? " ham-active" : ""}`}
            id="hamburger-container"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            <div className="hamburger-btn" id="hamburger-btn"></div>
          </div>
          <div
            className={`nav-bar-link-container${open ? "" : " nav-bar-link-container-hide"}`}
            id="nav-bar-link-container"
          >
            <div className="nav-bar-link-wrapper-1">
              <div className="nav-bar-link-wrapper-item">
                <a
                  href="#steps"
                  className="nav-bar-link-wrapper-1-items nav-bar-link-wrapper-1-items-active"
                >
                  Steps
                </a>
              </div>
              <div className="nav-bar-link-wrapper-item">
                <a href="#features" className="nav-bar-link-wrapper-1-items">
                  Features
                </a>
              </div>
              <div className="nav-bar-link-wrapper-item">
                <a href="#whyus" className="nav-bar-link-wrapper-1-items">
                  whyus
                </a>
              </div>
              <div className="nav-bar-link-wrapper-item">
                <a href="#faq" className="nav-bar-link-wrapper-1-items">
                  FAQ
                </a>
              </div>
            </div>

            <div className="nav-bar-link-wrapper-2">
              <div className="nav-bar-link-wrapper-item p-0 no-border">
                <a href="tel:+14047938759" className="fillbttn">
                  +1 40479 38759
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
