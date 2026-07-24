"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Faithful port of welcome.blade.php's Learn More modal script. Behavior is
// identical to the old site: clicking any "Learn More" link inside a
// .maincardbox opens this modal, populated from that card (title + image) plus
// the fuller copy in FULL_DETAILS; Escape / the × / the backdrop close it; Tab
// is trapped inside the dialog; <html>/<body> get .learn-more-modal-open to
// lock scroll. Reimplemented in React (state-driven, not a shadcn Dialog) so
// the emitted markup and interactions match the original exactly.
//
// The trigger links live in the server-rendered page (page.tsx feature cards),
// so opening stays a delegated document click — same mechanism as the original.

// Verbatim from the original inline script — the modal shows richer copy than
// the card summary; keyed by the card title (.cardmiantitle text).
const FULL_DETAILS: Record<string, string[]> = {
  "Domestic Shipping (US to US)": [
    "Our domestic shipping service offers reliable door-to-door transportation across the United States for documents, parcels, freight, and commercial shipments. Whether you are sending personal packages or business inventory, we help coordinate timely pickups, secure handling, and dependable delivery through trusted logistics networks.",
    "TYS Global Logistics LLC supports each shipment with clear communication, practical shipping guidance, and professional handling from pickup through final delivery. Certain restricted items, including cash, firearms, explosives, hazardous materials, and illegal goods, cannot be shipped and must comply with applicable carrier regulations.",
  ],
  "International Shipping (US to Worldwide)": [
    "Ship confidently from the United States to destinations across the globe with TYS Global Logistics LLC. Through our discounted FedEx international shipping solutions, you can save on express delivery for documents, parcels, excess baggage, and commercial shipments while enjoying reliable tracking and fast transit times.",
    "Our team also assists with shipping documentation, basic customs guidance, packaging recommendations, and shipment preparation so your international delivery is handled with fewer surprises. We help customers choose suitable service options based on destination, urgency, shipment type, and budget.",
  ],
  "FedEx Envelope Shipping (Discounted)": [
    "Our discounted FedEx Envelope service is designed for urgent documents such as contracts, legal paperwork, academic records, immigration documents, and business correspondence. It is a practical option when speed, tracking, and professional document handling matter.",
    "This service is intended for documents only and should not be used to send cash, cheques, negotiable instruments, gift cards, or other prohibited valuables that violate carrier policies. Our team can help you confirm whether your item is suitable before shipment.",
  ],
  "Packers & Movers Across USA": [
    "We provide professional packing and moving solutions for residential and commercial customers across the United States. From household furniture and office equipment to personal belongings and business inventory, our experienced team helps plan and execute each move with care.",
    "We use high-quality packing materials, organized handling, and practical coordination so items are prepared for safe transportation. Whether you are moving locally, relocating to another state, or shifting business equipment, TYS Global Logistics LLC can support the process from packing to delivery.",
  ],
  "LTL & FTL Freight Shipping": [
    "Our Less-Than-Truckload (LTL) and Full Truckload (FTL) freight services offer flexible transportation for pallets, machinery, inventory, and commercial cargo across the country.",
    "LTL is suitable when your shipment does not require an entire truck, while FTL is ideal for larger loads, dedicated truck space, or time-sensitive freight. We help coordinate pickup, routing, carrier selection, and delivery updates to keep your freight moving efficiently.",
  ],
  "LCL & FCL Door-to-Door Ocean Freight Shipping": [
    "Our Less-than-Container Load (LCL) and Full Container Load (FCL) door-to-door ocean freight services provide seamless international shipping from pickup at the origin to final delivery at your destination.",
    "Whether you are transporting a small commercial consignment or a full container, TYS Global Logistics LLC manages planning, carrier coordination, container movement, documentation support, and delivery communication. This service is designed for customers who need dependable ocean freight without managing every step alone.",
  ],
  "Residential House Moving": [
    "Relocating your home is easier with our end-to-end moving services that include packing, loading, transportation, and unloading. Our team helps organize the move so furniture, household goods, and personal items are handled carefully throughout the journey.",
    "We recommend keeping important documents, jewelry, cash, medications, and irreplaceable valuables with you during the move rather than packing them with household goods. This helps protect the items that need your direct attention.",
  ],
  "Vehicle Transport Services": [
    "Our vehicle transportation solutions safely move cars, SUVs, motorcycles, and other eligible vehicles across the United States. We help coordinate transport options based on vehicle type, route, timing, and customer needs.",
    "Before shipment, vehicles should be prepared according to transport guidelines, including removing personal belongings, documenting their condition, checking fluid levels, and confirming pickup access. These steps help ensure a smoother pickup and delivery process.",
  ],
  "Warehouse & Storage Facilities": [
    "TYS Global Logistics LLC offers secure warehousing and storage solutions for personal belongings, business inventory, and commercial goods. Our facilities are designed to provide safe storage with organized inventory handling and convenient logistics support.",
    "Storage can be paired with shipping, moving, freight, or distribution needs, giving customers a flexible way to manage goods before final delivery. We help arrange practical solutions based on item type, duration, volume, and handling requirements.",
  ],
};

type ModalContent = { title: string; paragraphs: string[]; imgSrc?: string; imgAlt: string };

export function LearnMoreModal() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ModalContent | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  // Delegated open — the "Learn More" links are rendered by the server page.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest("a");
      if (!link || link.textContent?.trim().toLowerCase() !== "learn more") return;
      const card = link.closest(".maincardbox");
      if (!card) return;

      event.preventDefault();
      const title = card.querySelector(".cardmiantitle")?.textContent?.trim() || "Service Details";
      const summary = card.querySelector(".carddec")?.textContent?.trim() || "";
      const image =
        card.querySelector<HTMLImageElement>(".imgcardcss") ?? card.querySelector("img");
      lastFocused.current = document.activeElement as HTMLElement | null;
      setContent({
        title,
        paragraphs: FULL_DETAILS[title] ?? [summary],
        imgSrc: image ? image.currentSrc || image.src : undefined,
        imgAlt: image?.alt || title,
      });
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Scroll-lock + focus management + Escape/Tab trap, only while open.
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("learn-more-modal-open");
    document.body.classList.add("learn-more-modal-open");
    closeButtonRef.current?.focus();

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.documentElement.classList.remove("learn-more-modal-open");
      document.body.classList.remove("learn-more-modal-open");
      lastFocused.current?.focus?.();
    };
  }, [open, close]);

  return (
    <div
      className={open ? "learn-more-modal is-open" : "learn-more-modal"}
      id="learnMoreModal"
      aria-hidden={open ? "false" : "true"}
      ref={modalRef}
    >
      <div className="learn-more-modal__backdrop" data-learn-more-close onClick={close}></div>
      <div
        className="learn-more-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="learnMoreModalTitle"
      >
        <button
          type="button"
          className="learn-more-modal__close"
          data-learn-more-close
          aria-label="Close details popup"
          ref={closeButtonRef}
          onClick={close}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="learn-more-modal__media">
          {/* src is set only when opened (a real URL) or omitted — never "" */}
          <img src={content?.imgSrc} alt={content?.imgAlt ?? ""} id="learnMoreModalImage" />
        </div>
        <div className="learn-more-modal__content">
          <div className="learn-more-modal__eyebrow">Service Details</div>
          <h2 className="learn-more-modal__title" id="learnMoreModalTitle">
            {content?.title}
          </h2>
          <div className="learn-more-modal__text" id="learnMoreModalText">
            {content?.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="learn-more-modal__actions">
            {/* Opens the wizard inline (and data-learn-more-close closes this modal). */}
            <a
              href="#quoteWizardContainer"
              data-open-quote-wizard
              data-learn-more-close
              className="fillbttn fillbttn2"
            >
              Get a Free Quote
              <img src="/frontend/assets/images/arrowright.svg" alt="" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
