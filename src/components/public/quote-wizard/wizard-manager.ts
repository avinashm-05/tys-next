// Faithful port of the old site's quote wizard behavior. Step flow (4 steps)
// comes from welcome.blade.php's QuoteWizardManager; Step 3's SEPARATE Box and
// Television detail sections come from quotes/index.blade.php (the variant with
// split sections — separate containers, boxes[i]/televisions[i] names, per-row
// add/remove buttons, per-section visibility via updatePackageDetailsVisibility,
// and a payload that fills box_details/television_details independently).
// Deliberate adaptations for the new single-page stack (each marked inline):
//   - getQuoteBtn + the "Get a Free Quote" CTAs open the wizard inline
//     (was a /quotes redirect; that page doesn't exist on the new site).
//   - Chargeable weight is computed client-side via the reused A4.2 lib.
//   - submitQuote POSTs /api/quotes (no CSRF in the new stack).
// jQuery/select2 are the globals B1 loads.

import { calculateChargeableWeight as computeChargeableWeight } from "@/lib/chargeable-weight";
import { normalizeCode } from "@/lib/countries";

type AnyInput = HTMLInputElement & HTMLSelectElement;
const byId = (id: string) => document.getElementById(id);
const inById = (id: string) => document.getElementById(id) as HTMLInputElement | null;
const q = (root: ParentNode, sel: string) => root.querySelector(sel) as AnyInput | null;

// jQuery is loaded globally by B1's PublicScripts (for select2). Minimal typing
// for the two select2 calls the wizard makes.
interface JQueryObject {
  val(v: string): JQueryObject;
  trigger(e: string): JQueryObject;
  data(k: string): unknown;
}
type JQ = (el: Element | string) => JQueryObject;
const jq = (): JQ | undefined => (window as unknown as { jQuery?: JQ }).jQuery;

interface AutoData {
  brand_name: string;
  car_model: string;
  car_year: string;
}
interface FormData {
  location: {
    from_country: string;
    from_zip: string;
    to_country: string;
    to_zip: string;
    is_residence: boolean;
  };
  packageType: string | null;
  autos: AutoData[];
  contact: { name: string; email: string; country_code: string; phone: string };
}

const emptyFormData = (): FormData => ({
  location: { from_country: "", from_zip: "", to_country: "", to_zip: "", is_residence: false },
  packageType: null,
  autos: [],
  contact: { name: "", email: "", country_code: "+1", phone: "" },
});

// One config per detail section (quotes/index.blade.php structure). The box
// and television sections share the engine below but nothing else — own
// container, own names, own error ids, own add/remove/reindex.
type SectionCfg = {
  key: "box" | "tv";
  sectionId: string; // wrapper shown/hidden on its own flag
  containerId: string;
  itemClass: string; // box-item / tv-item
  indexAttr: string; // data-box-index / data-tv-index
  namePrefix: string; // boxes / televisions
  addBtnClass: string;
  removeBtnClass: string;
};

const BOX: SectionCfg = {
  key: "box",
  sectionId: "box-details-section",
  containerId: "boxes-container",
  itemClass: "box-item",
  indexAttr: "data-box-index",
  namePrefix: "boxes",
  addBtnClass: "add-box-row-btn",
  removeBtnClass: "remove-box-btn",
};

const TV: SectionCfg = {
  key: "tv",
  sectionId: "television-details-section",
  containerId: "tvs-container",
  itemClass: "tv-item",
  indexAttr: "data-tv-index",
  namePrefix: "televisions",
  addBtnClass: "add-tv-row-btn",
  removeBtnClass: "remove-tv-btn",
};

export class QuoteWizardManager {
  currentStep = 1;
  wizardVisible = false;
  formData: FormData = emptyFormData();
  errors: Record<string, string> = {};
  debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  elements: {
    getQuoteBtn: HTMLElement | null;
    heroContent: HTMLElement | null;
    bookShipmentForm: HTMLElement | null;
    wizardContainer: HTMLElement | null;
    successMessage: HTMLElement | null;
    wizardForm: HTMLElement | null;
    backBtn: HTMLElement | null;
    nextBtn: HTMLElement | null;
    heroFromCountry: HTMLInputElement | null;
    heroToCountry: HTMLInputElement | null;
  } = {
    getQuoteBtn: null,
    heroContent: null,
    bookShipmentForm: null,
    wizardContainer: null,
    successMessage: null,
    wizardForm: null,
    backBtn: null,
    nextBtn: null,
    heroFromCountry: null,
    heroToCountry: null,
  };

  init() {
    this.elements.getQuoteBtn = byId("getQuoteBtn");
    this.elements.heroContent = byId("heroContent");
    this.elements.bookShipmentForm = byId("bookShipmentForm");
    this.elements.wizardContainer = byId("quoteWizardContainer");
    this.elements.successMessage = byId("quoteSuccessMessage");
    this.elements.wizardForm = byId("quoteWizardForm");
    this.elements.backBtn = byId("wizardBackBtn");
    this.elements.nextBtn = byId("wizardNextBtn");
    this.elements.heroFromCountry = inById("select_page2");
    this.elements.heroToCountry = inById("select_page3");

    this.attachEventListeners();
    this.setupErrorClearing();
  }

  attachEventListeners() {
    // Get Quote button: opens the wizard inline with the hero's From/To
    // prefilled (the old site redirected to /quotes).
    if (this.elements.getQuoteBtn) {
      this.elements.getQuoteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const fromCountry = normalizeCode(this.elements.heroFromCountry?.value || "");
        const toCountry = normalizeCode(this.elements.heroToCountry?.value || "");
        this.showWizard(fromCountry, toCountry);
      });
    }

    // Marketing CTAs (feature cards, quote section, learn-more modal): the old
    // site linked them to /quotes; on the single-page site they open the wizard
    // inline. Optional data-prefill-from/-to name <select> ids to prefill from.
    document.addEventListener("click", (e) => {
      const trigger = (e.target as Element | null)?.closest("[data-open-quote-wizard]");
      if (!trigger) return;
      e.preventDefault();
      const fromSel = trigger.getAttribute("data-prefill-from");
      const toSel = trigger.getAttribute("data-prefill-to");
      const from = fromSel ? normalizeCode(inById(fromSel)?.value || "") : "";
      const to = toSel ? normalizeCode(inById(toSel)?.value || "") : "";
      this.showWizard(from, to);
    });

    if (this.elements.backBtn) {
      this.elements.backBtn.addEventListener("click", () => this.previousStep());
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.addEventListener("click", () => this.nextStep());
    }

    const packageCards = document.querySelectorAll(".quote-wizard-package-card");
    packageCards.forEach((card) => {
      card.addEventListener("click", () => {
        const packageType = card.getAttribute("data-package-type");
        if (packageType) this.selectPackageType(packageType);
      });
    });

    // Per-row add/remove for the box + television sections (delegated, like the
    // original — rows are created/removed dynamically).
    document.addEventListener("click", (e) => {
      const target = e.target as Element | null;
      for (const cfg of [BOX, TV]) {
        if (target?.closest(`.${cfg.addBtnClass}`)) {
          e.preventDefault();
          const item = target.closest(`.${cfg.itemClass}`);
          const index = parseInt(item?.getAttribute(cfg.indexAttr) || "0");
          this.addSectionRowAfter(cfg, index);
          return;
        }
        if (target?.closest(`.${cfg.removeBtnClass}`)) {
          e.preventDefault();
          const item = target.closest(`.${cfg.itemClass}`);
          const index = parseInt(item?.getAttribute(cfg.indexAttr) || "0");
          this.removeSectionRow(cfg, index);
          return;
        }
      }
    });

    const residenceCheckbox = byId("wizard_is_residence");
    if (residenceCheckbox) {
      residenceCheckbox.addEventListener("click", () => {
        const hiddenInput = inById("wizard_is_residence_value");
        const icon = residenceCheckbox.querySelector("i");
        if (!hiddenInput || !icon) return;
        if (hiddenInput.value === "0") {
          hiddenInput.value = "1";
          icon.classList.remove("fa-circle", "quote-wizard-radio-inactive");
          icon.classList.add("fa-circle-check", "quote-wizard-radio-active");
          this.formData.location.is_residence = true;
        } else {
          hiddenInput.value = "0";
          icon.classList.remove("fa-circle-check", "quote-wizard-radio-active");
          icon.classList.add("fa-circle", "quote-wizard-radio-inactive");
          this.formData.location.is_residence = false;
        }
      });
    }

    const addVehicleBtn = byId("addVehicleBtn");
    if (addVehicleBtn) {
      addVehicleBtn.addEventListener("click", () => this.addVehicle());
    }

    const initialRemoveVehicleBtn = document.querySelector(".remove-vehicle-btn");
    if (initialRemoveVehicleBtn) {
      initialRemoveVehicleBtn.addEventListener("click", (e) => {
        const index = parseInt(
          (e.currentTarget as HTMLElement).getAttribute("data-vehicle-index") || "0",
        );
        this.removeVehicle(index);
      });
    }

    // First row of each detail section.
    this.setupSectionRow(BOX, this.sectionRows(BOX)[0]);
    this.setupSectionRow(TV, this.sectionRows(TV)[0]);
    this.setupVehicleFieldListeners(0);
    this.setupVehicleErrorClearing(0);
  }

  showWizard(fromCountry = "", toCountry = "") {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (this.elements.heroContent) this.elements.heroContent.style.display = "none";
    this.hideBookShipmentForm();
    document.body.classList.add("wizard-open");

    if (this.elements.wizardContainer) {
      this.elements.wizardContainer.style.display = "block";
      this.wizardVisible = true;
    }

    if (fromCountry) {
      const wizardFromCountry = inById("wizard_from_country");
      if (wizardFromCountry) {
        wizardFromCountry.value = fromCountry;
        this.formData.location.from_country = fromCountry;
        const $ = jq();
        if ($ && $(wizardFromCountry).data("select2")) {
          $(wizardFromCountry).val(fromCountry).trigger("change");
        }
      }
    }
    if (toCountry) {
      const wizardToCountry = inById("wizard_to_country");
      if (wizardToCountry) {
        wizardToCountry.value = toCountry;
        this.formData.location.to_country = toCountry;
        const $ = jq();
        if ($ && $(wizardToCountry).data("select2")) {
          $(wizardToCountry).val(toCountry).trigger("change");
        }
      }
    }

    this.showStep(1);
  }

  hideWizard() {
    if (this.elements.wizardContainer) {
      this.elements.wizardContainer.style.display = "none";
      this.wizardVisible = false;
    }
    document.body.classList.remove("wizard-open");
    if (this.elements.heroContent) this.elements.heroContent.style.display = "block";
    this.currentStep = 1;
    this.formData = emptyFormData();
    this.errors = {};
  }

  showBookShipmentForm() {
    if (this.elements.bookShipmentForm) this.elements.bookShipmentForm.style.display = "block";
    document.body.classList.remove("wizard-open");
    if (this.elements.heroContent) this.elements.heroContent.style.display = "block";
  }

  hideBookShipmentForm() {
    if (this.elements.bookShipmentForm) this.elements.bookShipmentForm.style.display = "none";
  }

  showSuccessMessage() {
    this.hideWizard();
    if (this.elements.successMessage) this.elements.successMessage.style.display = "block";
    setTimeout(() => {
      this.hideSuccessMessage();
      this.showBookShipmentForm();
    }, 3000);
  }

  hideSuccessMessage() {
    if (this.elements.successMessage) this.elements.successMessage.style.display = "none";
  }

  showStep(stepNumber: number) {
    for (let i = 1; i <= 4; i++) {
      byId(`wizard-step-${i}`)?.classList.remove("active-section");
    }
    byId(`wizard-step-${stepNumber}`)?.classList.add("active-section");
    this.currentStep = stepNumber;
    this.updateStepper();
    this.updateNavigationButtons();
  }

  nextStep() {
    this.clearAllErrors();
    if (!this.validateCurrentStep()) {
      this.displayErrors();
      this.focusFirstErrorField();
      return;
    }

    let nextStep = this.currentStep + 1;

    if (this.currentStep === 2) {
      const selectedTypes = this.selectedPackageTypes();
      const hasBoxes = selectedTypes.includes("boxes");
      const hasTelevision = selectedTypes.includes("television");
      const hasAuto = selectedTypes.includes("auto");
      const hasEnvelope = selectedTypes.includes("envelope");
      const hasFurniture = selectedTypes.includes("furniture");

      // Envelope / furniture override (updatePackageDetailsVisibility): hide +
      // CLEAR every detail section, then skip the details step entirely.
      const skipDetails = hasEnvelope || hasFurniture;
      const needsDetails = !skipDetails && (hasBoxes || hasTelevision || hasAuto);

      if (needsDetails) {
        nextStep = 3;
        // Each section shows on its OWN flag (never a shared box||tv).
        this.setSectionVisible(BOX, hasBoxes);
        this.setSectionVisible(TV, hasTelevision);
        const autoDetailsWrapper = byId("wizard-auto-details-wrapper");
        if (autoDetailsWrapper) {
          autoDetailsWrapper.style.display = hasAuto ? "block" : "none";
        }
      } else {
        if (skipDetails) this.clearPackageDetailForms();
        nextStep = 4;
      }
    }

    if (this.currentStep === 3) nextStep = 4;

    if (nextStep <= 4) {
      this.showStep(nextStep);
    } else if (this.currentStep === 4) {
      this.submitQuote();
    }
  }

  focusFirstErrorField() {
    const firstError = document.querySelector(
      '.quote-wizard-error-message[style*="display: flex"], .quote-wizard-error-message[style*="display: block"]',
    );
    if (!firstError) return;
    const errorId = firstError.id;
    const fieldId = errorId.replace("error_", "wizard_");
    let field: HTMLElement | null = byId(fieldId);
    if (!field) {
      const alternateFieldId = errorId.replace("error_", "");
      field = document.querySelector(`[name="${alternateFieldId}"]`);
    }
    if (!field) field = this.resolveFieldElement(errorId.replace("error_", ""));
    if (field) {
      field.focus();
      field.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async submitQuote() {
    if (!this.validateStep4()) {
      this.displayErrors();
      this.focusFirstErrorField();
      return;
    }
    const payload = this.constructPayload();

    const nextBtn = this.elements.nextBtn as HTMLButtonElement | null;
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '<i class="fa fa-spinner fa-spin me-1"></i>Submitting...';
    }

    try {
      // No CSRF in the new stack — the endpoint's guard is same-origin + rate
      // limit. 201 → handleSubmitSuccess; 422 → field errors; else notification.
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        this.handleSubmitSuccess(data);
      } else {
        this.handleSubmitError(response, data);
      }
    } catch (error) {
      this.handleNetworkError(error as Error);
    } finally {
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.innerHTML = '<i class="fa fa-paper-plane me-1"></i>Submit Quote';
      }
    }
  }

  // Payload build ported from quotes/index.blade.php submitQuoteRequest():
  // envelope/furniture override sends EMPTY detail arrays; box_details and
  // television_details are collected from their OWN sections; the legacy
  // `packages` fallback is boxes if any, else televisions — never merged.
  constructPayload() {
    const fromCountry = inById("wizard_from_country")?.value || "";
    const fromZip = inById("wizard_from_zip")?.value || "";
    const toCountry = inById("wizard_to_country")?.value || "";
    const toZip = inById("wizard_to_zip")?.value || "";
    const isResidence = inById("wizard_is_residence_value")?.value === "1";

    const packageType = inById("wizard_package_type")?.value || "";

    const selectedTypes = this.selectedPackageTypes();
    const shouldSkipDetails =
      selectedTypes.includes("envelope") || selectedTypes.includes("furniture");
    const hasBoxes = !shouldSkipDetails && selectedTypes.includes("boxes");
    const hasTelevision = !shouldSkipDetails && selectedTypes.includes("television");
    const hasAuto = !shouldSkipDetails && selectedTypes.includes("auto");

    const boxDetails = hasBoxes ? this.collectBoxPackages() : [];
    const televisionDetails = hasTelevision ? this.collectTelevisionPackages() : [];

    const autoDetails: AutoData[] = [];
    if (hasAuto) {
      document.querySelectorAll(".vehicle-item").forEach((vehicleItem) => {
        autoDetails.push({
          brand_name: q(vehicleItem, ".vehicle-brand-name")?.value || "",
          car_model: q(vehicleItem, ".vehicle-model")?.value || "",
          car_year: q(vehicleItem, ".vehicle-year")?.value || "",
        });
      });
    }

    // Legacy fallback payload for old backend handlers (verbatim port).
    let packages: Record<string, unknown>[] = [];
    if (boxDetails.length > 0) {
      packages = boxDetails;
    } else if (televisionDetails.length > 0) {
      packages = televisionDetails;
    }

    return {
      from_country: fromCountry,
      from_zip: fromZip,
      to_country: toCountry,
      to_zip: toZip,
      is_residence: isResidence,
      package_type: packageType,
      packages,
      box_details: boxDetails,
      television_details: televisionDetails,
      auto_details: autoDetails,
      contact: {
        name: inById("wizard_contact_name")?.value || "",
        email: inById("wizard_contact_email")?.value || "",
        country_code: inById("wizard_country_code")?.value || "",
        phone: inById("wizard_contact_phone")?.value || "",
      },
    };
  }

  collectBoxPackages(): Record<string, unknown>[] {
    const rows: Record<string, unknown>[] = [];
    document.querySelectorAll(`#${BOX.containerId} .${BOX.itemClass}`).forEach((item) => {
      rows.push({
        quantity: parseInt(q(item, ".box-quantity")?.value || "1", 10),
        weight: parseFloat(q(item, ".box-weight")?.value || "0"),
        weight_unit: (q(item, ".box-weight-unit")?.value || "LB").toLowerCase(),
        length: parseFloat(q(item, ".box-length")?.value || "0"),
        width: parseFloat(q(item, ".box-width")?.value || "0"),
        height: parseFloat(q(item, ".box-height")?.value || "0"),
        chargeable_weight: parseFloat(q(item, ".box-chargeable-weight")?.value || "0"),
      });
    });
    return rows;
  }

  collectTelevisionPackages(): Record<string, unknown>[] {
    const rows: Record<string, unknown>[] = [];
    document.querySelectorAll(`#${TV.containerId} .${TV.itemClass}`).forEach((item) => {
      rows.push({
        quantity: 1, // fixed in the original — TV rows have no quantity field
        brand_name: q(item, ".tv-brand-name")?.value || "",
        tv_model: q(item, ".tv-model")?.value || "",
        weight: parseFloat(q(item, ".tv-weight")?.value || "0"),
        weight_unit: (q(item, ".tv-weight-unit")?.value || "LB").toLowerCase(),
        length: parseFloat(q(item, ".tv-length")?.value || "0"),
        width: parseFloat(q(item, ".tv-width")?.value || "0"),
        height: parseFloat(q(item, ".tv-height")?.value || "0"),
        chargeable_weight: parseFloat(q(item, ".tv-chargeable-weight")?.value || "0"),
      });
    });
    return rows;
  }

  handleSubmitSuccess(data: Record<string, unknown>) {
    this.clearAllErrors();
    if (data.show_fedex_rates) {
      this.showFedExRates(data);
    } else {
      // Single-page site: no inline success screen — go to /thank-you (B2.4).
      // Covers international + any NULL-cost quote (R26).
      const name = inById("wizard_contact_name")?.value?.trim() || "Customer";
      window.location.href = `/thank-you?name=${encodeURIComponent(name)}`;
    }
  }

  showFedExRates(data: Record<string, unknown>) {
    const ratesContainer = byId("ratesContainer");
    const wizardContainer = byId("quoteWizardContainer");
    if (!ratesContainer || !wizardContainer) return;

    wizardContainer.style.display = "none";
    ratesContainer.style.display = "block";
    ratesContainer.scrollIntoView({ behavior: "smooth" });

    const summary = (data.summary as Record<string, string>) || {};
    const routeStr = summary.route || "";
    const packageLabel = summary.package_label || "Package";
    const weightStr = summary.weight || "";

    let htmlContent = `
      <div class="rates-header mb-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h3 class="fw-bold mb-2">Available Shipping Rates</h3>
            <div class="route-badge-line mt-1"><span>${routeStr}</span></div>
            <div class="text-muted mt-2 small">
              <i class="fa-solid fa-box me-1"></i> ${packageLabel} ${weightStr ? `(${weightStr})` : ""}
            </div>
          </div>
          <div class="text-end">
            <span class="badge bg-primary rounded-pill px-3 py-2">FedEx Live Rates</span>
          </div>
        </div>
      </div>
    `;

    const rates = data.rates as Array<Record<string, string>> | undefined;
    if (data.rates_error) {
      htmlContent += `
        <div class="alert alert-warning rounded-3 p-4 d-flex align-items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation fs-3 text-warning"></i>
          <div>
            <h5 class="fw-bold m-0">Live rates are temporarily unavailable</h5>
            <p class="m-0 mt-2 small">${data.rates_error}</p>
            <p class="m-0 mt-2 small">Our team will manually calculate the best rates and contact you within 24 hours.</p>
          </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button type="button" class="btn btn-outline-primary rounded-pill px-4" onclick="window.location.href='/'">Go to Home</button>
        </div>
      `;
    } else if (!rates || rates.length === 0) {
      htmlContent += `
        <div class="alert alert-info rounded-3 p-4 d-flex align-items-start gap-3">
          <i class="fa-solid fa-info-circle fs-3 text-info"></i>
          <div>
            <h5 class="fw-bold m-0">No active carrier rates returned</h5>
            <p class="m-0 mt-2 small">Our team will manually review your shipping details and send you a custom quote within 24 hours.</p>
          </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button type="button" class="btn btn-outline-primary rounded-pill px-4" onclick="window.location.href='/'">Go to Home</button>
        </div>
      `;
    } else {
      htmlContent += `<div class="rates-list mt-3">`;
      rates.forEach((rate) => {
        const totalCharge = parseFloat(rate.total_charge).toFixed(2);
        const currency = rate.currency || "USD";
        const serviceName = rate.service_name || "FedEx Ground";
        const transitDays = rate.transit_time
          ? `${rate.transit_time} ${rate.transit_time === "1" ? "Day" : "Days"}`
          : "";
        htmlContent += `
          <div class="rate-card-item d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div class="d-flex align-items-center gap-4">
              <div class="text-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/FedEx_Express_logo.svg" class="rate-carrier-logo img-fluid" alt="FedEx">
              </div>
              <div>
                <div class="rate-service-name">${serviceName}</div>
                ${transitDays ? `<div class="rate-delivery-date"><i class="fa-regular fa-clock me-1"></i>Estimated Delivery: <strong>${transitDays}</strong></div>` : ""}
              </div>
            </div>
            <div class="d-flex align-items-center gap-4 flex-wrap ms-md-auto">
              <div class="text-end">
                <div class="rate-price-tag">$${totalCharge}<span class="rate-currency">${currency}</span></div>
              </div>
              <button type="button" class="rate-book-btn" onclick="window.quoteWizard.bookFedExWizardService('${serviceName}', '${totalCharge}', '${currency}')">Book Now</button>
            </div>
          </div>
        `;
      });
      htmlContent += `</div>`;
    }

    ratesContainer.innerHTML = htmlContent;
  }

  bookFedExWizardService(serviceName: string, price: string, currency: string) {
    const contactName = inById("wizard_contact_name")?.value?.trim() || "Customer";
    const ratesContainer = byId("ratesContainer");
    if (ratesContainer) {
      ratesContainer.innerHTML = `
        <div class="text-center py-5">
          <div class="mb-4"><i class="fa-solid fa-circle-check text-success display-1"></i></div>
          <h3 class="fw-bold mb-3">Booking Confirmed!</h3>
          <p class="text-muted max-width-500 mx-auto">
            Dear <strong>${contactName}</strong>, thank you for booking <strong>${serviceName}</strong> for <strong>$${price} ${currency}</strong>.
            We have reserved your shipment and our operations team will reach out to schedule pickup.
          </p>
          <p class="text-muted small mt-2">Redirecting to home page in 8 seconds...</p>
          <div class="mt-4"><a href="/" class="btn btn-primary rounded-pill px-4">Go to Home</a></div>
        </div>
      `;
    }
    setTimeout(() => {
      window.location.href = "/";
    }, 8000);
  }

  handleSubmitError(response: { status: number }, data: { errors?: Record<string, unknown>; message?: string }) {
    if (response.status === 422 && data.errors) {
      this.mapServerErrors(data.errors);
      this.displayErrors();
      this.focusFirstErrorField();
      this.showNotification("error", "Please correct the errors in the form.");
    } else {
      this.showNotification("error", data.message || "Failed to submit quote. Please try again.");
    }
  }

  mapServerErrors(serverErrors: Record<string, unknown>) {
    this.errors = {};
    Object.keys(serverErrors).forEach((fieldKey) => {
      const raw = serverErrors[fieldKey];
      const errorMessage = Array.isArray(raw) ? String(raw[0]) : String(raw);

      let mappedFieldKey = fieldKey;
      // Legacy `packages` errors land on the box section (packages = boxes
      // first in the fallback order).
      if (fieldKey.startsWith("packages.")) {
        mappedFieldKey = fieldKey.replace("packages.", "box_").replace(".", "_");
      }
      const boxMatch = fieldKey.match(/^box_details\.(\d+)\.(.+)$/);
      if (boxMatch) mappedFieldKey = `box_${boxMatch[1]}_${boxMatch[2]}`;
      const tvMatch = fieldKey.match(/^television_details\.(\d+)\.(.+)$/);
      if (tvMatch) mappedFieldKey = `tv_${tvMatch[1]}_${tvMatch[2]}`;
      const autoMatch = fieldKey.match(/^auto_details\.(\d+)\.(.+)$/);
      if (autoMatch) mappedFieldKey = `vehicle_${autoMatch[1]}_${autoMatch[2]}`;
      if (fieldKey.startsWith("contact.")) {
        mappedFieldKey = fieldKey.replace("contact.", "contact_");
      }
      this.errors[mappedFieldKey] = errorMessage;
    });
  }

  resetWizardState() {
    this.formData = emptyFormData();
    this.clearFormFields();
    this.currentStep = 1;
    this.errors = {};
  }

  clearFormFields() {
    ["wizard_from_country", "wizard_from_zip", "wizard_to_country", "wizard_to_zip"].forEach((fieldId) => {
      const element = inById(fieldId);
      if (element) element.value = "";
    });

    const residenceCheckbox = inById("wizard_is_residence_value");
    if (residenceCheckbox) residenceCheckbox.value = "0";
    const residenceIcon = document.querySelector("#wizard_is_residence i");
    if (residenceIcon) {
      residenceIcon.classList.remove("fa-circle-check", "quote-wizard-radio-active");
      residenceIcon.classList.add("fa-circle", "quote-wizard-radio-inactive");
    }

    const packageTypeInput = inById("wizard_package_type");
    if (packageTypeInput) packageTypeInput.value = "";
    document.querySelectorAll(".quote-wizard-package-card").forEach((card) => {
      card.classList.remove("selected");
    });

    this.clearPackageDetailForms();

    ["wizard_contact_name", "wizard_contact_email", "wizard_country_code", "wizard_contact_phone"].forEach(
      (fieldId) => {
        const element = inById(fieldId);
        if (element) element.value = "";
      },
    );
  }

  // clearPackageDetailForms (quotes/index.blade.php): reset each detail
  // section to a single clean row and hide it. Runs on the envelope/furniture
  // override and on full form reset.
  clearPackageDetailForms() {
    for (const cfg of [BOX, TV]) {
      const container = byId(cfg.containerId);
      if (container) {
        container.querySelectorAll(`.${cfg.itemClass}`).forEach((item, index) => {
          if (index > 0) item.remove();
        });
        const first = container.querySelector(`.${cfg.itemClass}`);
        if (first) {
          first.querySelectorAll("input").forEach((input) => {
            input.value = "";
          });
          first.querySelectorAll("select").forEach((select) => {
            select.selectedIndex = 0;
          });
        }
        this.reindexSection(cfg);
        this.updateSectionRowButtons(cfg);
      }
      this.setSectionVisible(cfg, false);
    }

    const vehiclesContainer = byId("vehiclesContainer");
    if (vehiclesContainer) {
      vehiclesContainer.querySelectorAll(".vehicle-item").forEach((item, index) => {
        if (index > 0) item.remove();
      });
      const firstVehicle = vehiclesContainer.querySelector(".vehicle-item");
      if (firstVehicle) {
        firstVehicle.querySelectorAll("input").forEach((input) => {
          input.value = "";
        });
        firstVehicle.querySelectorAll("select").forEach((select) => {
          select.selectedIndex = 0;
        });
      }
    }
    const autoDetailsWrapper = byId("wizard-auto-details-wrapper");
    if (autoDetailsWrapper) autoDetailsWrapper.style.display = "none";
  }

  showNotification(type: string, message: string) {
    const notification = document.createElement("div");
    notification.className = `quote-wizard-notification quote-wizard-notification-${type}`;
    notification.innerHTML = `
      <div class="quote-wizard-notification-content">
        <i class="fa-solid ${this.getNotificationIcon(type)} me-2"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  getNotificationIcon(type: string) {
    const icons: Record<string, string> = {
      success: "fa-circle-check",
      error: "fa-circle-exclamation",
      warning: "fa-triangle-exclamation",
      info: "fa-circle-info",
    };
    return icons[type] || "fa-circle-info";
  }

  handleNetworkError(error: Error) {
    console.error("Network error during quote submission:", error);
    let errorMessage = "Failed to submit quote. Please check your connection and try again.";
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage = "Network error: Unable to connect to server. Please check your internet connection.";
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    this.showNotification("error", errorMessage);
  }

  previousStep() {
    let prevStep = this.currentStep - 1;
    if (this.currentStep === 4) {
      const selectedTypes = this.selectedPackageTypes();
      const hasBoxes = selectedTypes.includes("boxes");
      const hasTelevision = selectedTypes.includes("television");
      const hasAuto = selectedTypes.includes("auto");
      const hasEnvelope = selectedTypes.includes("envelope");
      const hasFurniture = selectedTypes.includes("furniture");
      const skipDetails = hasEnvelope || hasFurniture;
      const needsStep3 = !skipDetails && (hasBoxes || hasTelevision || hasAuto);
      prevStep = needsStep3 ? 3 : 2;
    }
    if (prevStep >= 1) this.showStep(prevStep);
  }

  updateStepper() {
    for (let i = 1; i <= 4; i++) {
      const pill = byId(`wizard-pill-${i}`);
      const icon = byId(`wizard-icon-${i}`);
      if (!pill || !icon) continue;
      pill.classList.remove("active", "completed");
      const originalIconClasses = this.getOriginalIconClass(i);
      if (i < this.currentStep) {
        pill.classList.add("completed");
        icon.className = "fa-solid fa-circle-check quote-wizard-step-icon";
      } else if (i === this.currentStep) {
        pill.classList.add("active");
        icon.className = originalIconClasses;
      } else {
        icon.className = originalIconClasses;
      }
    }
  }

  getOriginalIconClass(stepNumber: number) {
    const iconMap: Record<number, string> = {
      1: "fa-solid fa-location-dot quote-wizard-step-icon",
      2: "fa-solid fa-box-open quote-wizard-step-icon",
      3: "fa-solid fa-box quote-wizard-step-icon",
      4: "fa-solid fa-headset quote-wizard-step-icon",
    };
    return iconMap[stepNumber] || "fa-solid fa-circle quote-wizard-step-icon";
  }

  updateNavigationButtons() {
    if (this.elements.backBtn) {
      this.elements.backBtn.style.display = this.currentStep === 1 ? "none" : "inline-block";
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.innerHTML =
        this.currentStep === 4
          ? '<i class="fa fa-paper-plane me-1"></i>Submit Quote'
          : 'Next<i class="fa fa-arrow-right ms-1"></i>';
    }
  }

  private selectedPackageTypes(): string[] {
    const selectedCards = document.querySelectorAll(".quote-wizard-package-card.selected");
    return Array.from(selectedCards).map((card) => card.getAttribute("data-package-type") || "");
  }

  selectPackageType(type: string) {
    const selectedCard = document.querySelector(`[data-package-type="${type}"]`);
    if (!selectedCard) return;

    if (selectedCard.classList.contains("selected")) {
      selectedCard.classList.remove("selected");
      if (this.formData.packageType === type) this.formData.packageType = null;
    } else {
      selectedCard.classList.add("selected");
      this.formData.packageType = type;
    }

    const selectedTypes = this.selectedPackageTypes();
    const packageTypeInput = inById("wizard_package_type");
    if (packageTypeInput) packageTypeInput.value = selectedTypes.join(",");

    if (selectedTypes.length > 0) this.clearError("package_type");

    if (selectedTypes.includes("auto") && this.formData.autos.length === 0) {
      this.formData.autos = [{ brand_name: "", car_model: "", car_year: "" }];
    }
  }

  // ── Detail-section engine (box + television share it, nothing else) ──────

  sectionRows(cfg: SectionCfg): Element[] {
    return Array.from(document.querySelectorAll(`#${cfg.containerId} .${cfg.itemClass}`));
  }

  setSectionVisible(cfg: SectionCfg, visible: boolean) {
    const section = byId(cfg.sectionId);
    if (!section) return;
    section.style.display = visible ? "block" : "none";
    if (visible) this.updateSectionRowButtons(cfg);
  }

  addSectionRowAfter(cfg: SectionCfg, afterIndex: number) {
    const container = byId(cfg.containerId);
    if (!container) return;
    const afterRow = container.querySelector(`[${cfg.indexAttr}="${afterIndex}"]`);
    if (!afterRow) return;

    const newIndex = this.sectionRows(cfg).length; // reindexed below anyway
    const html = cfg.key === "box" ? this.createBoxRowHtml(newIndex) : this.createTvRowHtml(newIndex);
    afterRow.insertAdjacentHTML("afterend", html);
    const newRow = afterRow.nextElementSibling;

    this.reindexSection(cfg);
    this.updateSectionRowButtons(cfg);
    if (newRow) this.setupSectionRow(cfg, newRow);
  }

  removeSectionRow(cfg: SectionCfg, index: number) {
    if (this.sectionRows(cfg).length <= 1) return; // buttons hidden at 1 row anyway
    const container = byId(cfg.containerId);
    container?.querySelector(`[${cfg.indexAttr}="${index}"]`)?.remove();
    this.reindexSection(cfg);
    this.updateSectionRowButtons(cfg);
  }

  /** Green + on the LAST row only; red trash on every row when more than one. */
  updateSectionRowButtons(cfg: SectionCfg) {
    const rows = this.sectionRows(cfg);
    rows.forEach((row, i) => {
      const addBtn = row.querySelector(`.${cfg.addBtnClass}`) as HTMLElement | null;
      const removeBtn = row.querySelector(`.${cfg.removeBtnClass}`) as HTMLElement | null;
      if (addBtn) addBtn.style.display = i === rows.length - 1 ? "flex" : "none";
      if (removeBtn) removeBtn.style.display = rows.length > 1 ? "flex" : "none";
    });
  }

  reindexSection(cfg: SectionCfg) {
    const p = cfg.key; // id prefix: box_weight_0 / tv_weight_0
    this.sectionRows(cfg).forEach((row, newIndex) => {
      row.setAttribute(cfg.indexAttr, String(newIndex));
      row.querySelectorAll("input, select").forEach((input) => {
        const name = input.getAttribute("name");
        if (name) {
          input.setAttribute(
            "name",
            name.replace(new RegExp(`${cfg.namePrefix}\\[\\d+\\]`), `${cfg.namePrefix}[${newIndex}]`),
          );
        }
        if (input.id) input.id = input.id.replace(new RegExp(`^${p}_(.+)_\\d+$`), `${p}_$1_${newIndex}`);
      });
      row.querySelectorAll(".quote-wizard-error-message").forEach((errorMsg) => {
        if (errorMsg.id) {
          errorMsg.id = errorMsg.id.replace(new RegExp(`^error_${p}_\\d+_`), `error_${p}_${newIndex}_`);
        }
      });
    });
  }

  /** Field listeners for one row: chargeable-weight recompute + error clearing. */
  setupSectionRow(cfg: SectionCfg, row: Element | undefined) {
    if (!row) return;
    const p = cfg.key;
    const cwFields = [".weight", ".weight-unit", ".length", ".width", ".height"].map(
      (s) => `.${p}${s.replace(".", "-")}`,
    );
    cwFields.forEach((sel) => {
      const el = row.querySelector(sel);
      if (!el) return;
      const recalc = () => this.debouncedCalculateSectionWeight(cfg, row);
      el.addEventListener("input", recalc);
      el.addEventListener("change", recalc);
    });

    // Error clearing keyed by the row's CURRENT index (resolved at event time —
    // survives re-indexing).
    const errorFields: Array<[string, string]> =
      cfg.key === "box"
        ? [
            [`.box-quantity`, "quantity"],
            [`.box-weight`, "weight"],
            [`.box-length`, "length"],
            [`.box-width`, "width"],
            [`.box-height`, "height"],
          ]
        : [
            [`.tv-brand-name`, "brand_name"],
            [`.tv-model`, "tv_model"],
            [`.tv-weight`, "weight"],
            [`.tv-length`, "length"],
            [`.tv-width`, "width"],
            [`.tv-height`, "height"],
          ];
    errorFields.forEach(([sel, field]) => {
      const el = row.querySelector(sel);
      if (!el) return;
      const clear = () => {
        const index = row.getAttribute(cfg.indexAttr) || "0";
        this.clearError(`${p}_${index}_${field}`);
      };
      el.addEventListener("input", clear);
      el.addEventListener("change", clear);
    });
  }

  debouncedCalculateSectionWeight(cfg: SectionCfg, row: Element) {
    const key = `${cfg.key}:${row.getAttribute(cfg.indexAttr) || "0"}`;
    if (this.debounceTimers[key]) clearTimeout(this.debounceTimers[key]);
    this.debounceTimers[key] = setTimeout(() => {
      this.calculateSectionWeight(cfg, row);
    }, 500);
  }

  // Client-side chargeable weight — the reused A4.2 formula. Unit values are
  // LB/KG (uppercase, as in the original select) and lowercased for the lib,
  // so KG uses the metric divisor (5000).
  calculateSectionWeight(cfg: SectionCfg, row: Element) {
    const p = cfg.key;
    const weight = parseFloat(q(row, `.${p}-weight`)?.value || "0");
    const weightUnit = (q(row, `.${p}-weight-unit`)?.value || "LB").toLowerCase();
    const length = parseFloat(q(row, `.${p}-length`)?.value || "0");
    const width = parseFloat(q(row, `.${p}-width`)?.value || "0");
    const height = parseFloat(q(row, `.${p}-height`)?.value || "0");

    if (!weight || !length || !width || !height) return;

    const chargeableWeight = computeChargeableWeight(weight, { length, width, height }, weightUnit);
    const field = q(row, `.${p}-chargeable-weight`);
    if (field) field.value = chargeableWeight.toFixed(2);
  }

  createBoxRowHtml(index: number) {
    return `
      <div class="box-row box-item mb-3" data-box-index="${index}">
        <div class="row g-3 align-items-end inline-fields">
          <div class="col-md-1 field-qty">
            <label class="form-label d-md-none field-label">No. of Boxes <span class="text-danger">*</span></label>
            <div class="input-group-pill">
              <select class="form-select border-0 bg-transparent ps-3 box-quantity" name="boxes[${index}][quantity]" id="box_quantity_${index}">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div class="quote-wizard-error-message" id="error_box_${index}_quantity"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
          </div>
          <div class="col-md-3 field-weight">
            <label class="form-label d-md-none field-label">Weight <span class="text-danger">*</span></label>
            <div class="merged-input-group">
              <input type="number" class="form-control box-weight" name="boxes[${index}][weight]" id="box_weight_${index}" placeholder="Weight" step="0.01" min="0.01">
              <select class="form-select unit-select box-weight-unit" name="boxes[${index}][weight_unit]" id="box_weight_unit_${index}">
                <option value="LB">LB</option>
                <option value="KG">KG</option>
              </select>
            </div>
            <div class="quote-wizard-error-message" id="error_box_${index}_weight"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
          </div>
          <div class="col-md-4 field-dimensions">
            <label class="form-label d-md-none field-label">Dimensions <span class="text-danger">*</span></label>
            <div class="dimensions-group">
              <div style="flex: 1;">
                <input type="number" class="form-control input-pill box-length" name="boxes[${index}][length]" id="box_length_${index}" placeholder="Length" step="0.01" min="0.01">
                <div class="quote-wizard-error-message" id="error_box_${index}_length"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
              </div>
              <span class="dimension-separator">X</span>
              <div style="flex: 1;">
                <input type="number" class="form-control input-pill box-width" name="boxes[${index}][width]" id="box_width_${index}" placeholder="Width" step="0.01" min="0.01">
                <div class="quote-wizard-error-message" id="error_box_${index}_width"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
              </div>
              <span class="dimension-separator">X</span>
              <div style="flex: 1;">
                <input type="number" class="form-control input-pill box-height" name="boxes[${index}][height]" id="box_height_${index}" placeholder="Height" step="0.01" min="0.01">
                <div class="quote-wizard-error-message" id="error_box_${index}_height"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
              </div>
            </div>
          </div>
          <div class="col-md-2 field-chargeable">
            <label class="form-label d-md-none field-label">Chargeable Weight</label>
            <div class="d-flex align-items-center">
              <input type="text" class="form-control input-pill bg-light box-chargeable-weight" name="boxes[${index}][chargeable_weight]" id="box_chargeable_weight_${index}" placeholder="Weight" disabled>
            </div>
          </div>
          <div class="col-md-2 d-flex gap-2 justify-content-end align-items-end field-actions">
            <button type="button" class="btn btn-success btn-sm add-box-row-btn" style="display: none;"><i class="fa fa-plus"></i></button>
            <button type="button" class="btn btn-danger btn-sm remove-box-btn" style="display: none;"><i class="fa fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }

  createTvRowHtml(index: number) {
    return `
      <div class="box-row tv-item mb-3" data-tv-index="${index}">
        <div class="row g-3 align-items-end inline-fields tv-fields">
          <div class="col-md-2 field-brand">
            <label class="form-label d-md-none field-label">Brand Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control input-pill tv-brand-name" name="televisions[${index}][brand_name]" id="tv_brand_name_${index}" placeholder="Brand Name">
            <div class="quote-wizard-error-message" id="error_tv_${index}_brand_name"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
          </div>
          <div class="col-md-2 field-model">
            <label class="form-label d-md-none field-label">Model <span class="text-danger">*</span></label>
            <input type="text" class="form-control input-pill tv-model" name="televisions[${index}][tv_model]" id="tv_tv_model_${index}" placeholder="TV Model">
            <div class="quote-wizard-error-message" id="error_tv_${index}_tv_model"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
          </div>
          <div class="col-md-2 field-weight">
            <label class="form-label d-md-none field-label">Weight <span class="text-danger">*</span></label>
            <div class="merged-input-group">
              <input type="number" class="form-control tv-weight" name="televisions[${index}][weight]" id="tv_weight_${index}" placeholder="Weight" step="0.01" min="0.01">
              <select class="form-select unit-select tv-weight-unit" name="televisions[${index}][weight_unit]" id="tv_weight_unit_${index}">
                <option value="LB">LB</option>
                <option value="KG">KG</option>
              </select>
            </div>
            <div class="quote-wizard-error-message" id="error_tv_${index}_weight"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
          </div>
          <div class="col-md-4 field-dimensions">
            <label class="form-label d-md-none field-label">Dimensions <span class="text-danger">*</span></label>
            <div class="dimensions-group">
              <div style="flex: 1;">
                <input type="number" class="form-control input-pill tv-length" name="televisions[${index}][length]" id="tv_length_${index}" placeholder="Length" step="0.01" min="0.01">
                <div class="quote-wizard-error-message" id="error_tv_${index}_length"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
              </div>
              <span class="dimension-separator">X</span>
              <div style="flex: 1;">
                <input type="number" class="form-control input-pill tv-width" name="televisions[${index}][width]" id="tv_width_${index}" placeholder="Width" step="0.01" min="0.01">
                <div class="quote-wizard-error-message" id="error_tv_${index}_width"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
              </div>
              <span class="dimension-separator">X</span>
              <div style="flex: 1;">
                <input type="number" class="form-control input-pill tv-height" name="televisions[${index}][height]" id="tv_height_${index}" placeholder="Height" step="0.01" min="0.01">
                <div class="quote-wizard-error-message" id="error_tv_${index}_height"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
              </div>
            </div>
          </div>
          <div class="col-md-2 field-chargeable">
            <label class="form-label d-md-none field-label">Chargeable Weight</label>
            <div class="d-flex align-items-center">
              <input type="text" class="form-control input-pill bg-light tv-chargeable-weight" name="televisions[${index}][chargeable_weight]" id="tv_chargeable_weight_${index}" placeholder="Weight" disabled>
            </div>
          </div>
          <div class="col-md-1 d-flex gap-2 justify-content-end align-items-end field-actions">
            <button type="button" class="btn btn-success btn-sm add-tv-row-btn" style="display: none;"><i class="fa fa-plus"></i></button>
            <button type="button" class="btn btn-danger btn-sm remove-tv-btn" style="display: none;"><i class="fa fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Vehicles (unchanged from the HOME port) ──────────────────────────────

  addVehicle() {
    const vehiclesContainer = byId("vehiclesContainer");
    if (!vehiclesContainer) return;
    const newIndex = document.querySelectorAll(".vehicle-item").length;
    this.formData.autos.push({ brand_name: "", car_model: "", car_year: "" });
    vehiclesContainer.insertAdjacentHTML("beforeend", this.createVehicleHtml(newIndex));
    this.updateVehicleRemoveButtons();
    this.setupVehicleErrorClearing(newIndex);
    this.setupVehicleFieldListeners(newIndex);
  }

  removeVehicle(index: number) {
    if (document.querySelectorAll(".vehicle-item").length <= 1) return;
    document.querySelector(`[data-vehicle-index="${index}"]`)?.remove();
    this.formData.autos.splice(index, 1);
    this.reindexVehicles();
    this.updateVehicleRemoveButtons();
  }

  createVehicleHtml(index: number) {
    const vehicleNumber = index + 1;
    return `
      <div class="vehicle-item mb-4 pb-4 border-bottom" data-vehicle-index="${index}">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-semibold m-0">Vehicle #${vehicleNumber}</h6>
          <button type="button" class="btn btn-sm btn-outline-danger rounded-pill remove-vehicle-btn" data-vehicle-index="${index}">
            <i class="fa fa-trash me-1"></i>Remove
          </button>
        </div>
        <div class="row g-4">
          <div class="col-md-4">
            <label class="quote-wizard-form-label">Brand Name (Make) <span class="text-danger">*</span></label>
            <div class="quote-wizard-input-group-pill">
              <input type="text" class="form-control vehicle-brand-name" name="autos[${index}][brand_name]" placeholder="Car Make">
            </div>
            <div class="quote-wizard-error-message" id="error_vehicle_${index}_brand_name"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
          </div>
          <div class="col-md-4">
            <label class="quote-wizard-form-label">Car Model <span class="text-danger">*</span></label>
            <div class="quote-wizard-input-group-pill">
              <input type="text" class="form-control vehicle-model" name="autos[${index}][car_model]" placeholder="Car Model">
            </div>
            <div class="quote-wizard-error-message" id="error_vehicle_${index}_car_model"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
          </div>
          <div class="col-md-4">
            <label class="quote-wizard-form-label">Car Year <span class="text-danger">*</span></label>
            <div class="quote-wizard-input-group-pill">
              <select class="form-select vehicle-year" name="autos[${index}][car_year]">
                <option value="">Select Year</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
                <option value="2017">2017</option>
                <option value="2016">2016</option>
                <option value="2015">2015</option>
              </select>
            </div>
            <div class="quote-wizard-error-message" id="error_vehicle_${index}_car_year"><i class="fa-solid fa-circle-exclamation"></i><span></span></div>
          </div>
        </div>
      </div>
    `;
  }

  reindexVehicles() {
    document.querySelectorAll(".vehicle-item").forEach((vehicleItem, newIndex) => {
      vehicleItem.setAttribute("data-vehicle-index", String(newIndex));
      const heading = vehicleItem.querySelector("h6");
      if (heading) heading.textContent = `Vehicle #${newIndex + 1}`;
      const removeBtn = vehicleItem.querySelector(".remove-vehicle-btn");
      if (removeBtn) removeBtn.setAttribute("data-vehicle-index", String(newIndex));
      vehicleItem.querySelectorAll("input, select").forEach((input) => {
        const name = input.getAttribute("name");
        if (name) input.setAttribute("name", name.replace(/autos\[\d+\]/, `autos[${newIndex}]`));
      });
      vehicleItem.querySelectorAll(".quote-wizard-error-message").forEach((errorMsg) => {
        if (errorMsg.id) errorMsg.id = errorMsg.id.replace(/vehicle_\d+_/, `vehicle_${newIndex}_`);
      });
    });
  }

  updateVehicleRemoveButtons() {
    const many = document.querySelectorAll(".vehicle-item").length > 1;
    document.querySelectorAll<HTMLElement>(".remove-vehicle-btn").forEach((btn) => {
      btn.style.display = many ? "inline-block" : "none";
    });
  }

  setupVehicleFieldListeners(vehicleIndex: number) {
    const vehicleItem = document.querySelector(`[data-vehicle-index="${vehicleIndex}"]`);
    if (!vehicleItem) return;
    const removeBtn = vehicleItem.querySelector(".remove-vehicle-btn");
    if (removeBtn) removeBtn.addEventListener("click", () => this.removeVehicle(vehicleIndex));
  }

  setupVehicleErrorClearing(vehicleIndex: number) {
    const vehicleItem = document.querySelector(`[data-vehicle-index="${vehicleIndex}"]`);
    if (!vehicleItem) return;
    const fields = [
      { selector: ".vehicle-brand-name", errorId: `vehicle_${vehicleIndex}_brand_name` },
      { selector: ".vehicle-model", errorId: `vehicle_${vehicleIndex}_car_model` },
      { selector: ".vehicle-year", errorId: `vehicle_${vehicleIndex}_car_year` },
    ];
    fields.forEach((field) => {
      const element = vehicleItem.querySelector(field.selector);
      if (element) {
        element.addEventListener("input", () => this.clearError(field.errorId));
        element.addEventListener("change", () => this.clearError(field.errorId));
      }
    });
  }

  // ── Validation ────────────────────────────────────────────────────────────

  validateStep1() {
    let isValid = true;
    this.errors = {};
    const fromCountry = inById("wizard_from_country")?.value || "";
    const fromZip = inById("wizard_from_zip")?.value || "";
    const toCountry = inById("wizard_to_country")?.value || "";
    const toZip = inById("wizard_to_zip")?.value || "";

    if (!fromCountry || fromCountry.trim() === "") {
      this.errors.from_country = "Please select a sending country.";
      isValid = false;
    }
    if (!fromZip || fromZip.trim() === "") {
      this.errors.from_zip = "Please enter a sending zip code.";
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(fromZip.trim())) {
      this.errors.from_zip = "Zip code must be 3-10 alphanumeric characters.";
      isValid = false;
    }
    if (!toCountry || toCountry.trim() === "") {
      this.errors.to_country = "Please select a destination country.";
      isValid = false;
    }
    if (!toZip || toZip.trim() === "") {
      this.errors.to_zip = "Please enter a destination zip code.";
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(toZip.trim())) {
      this.errors.to_zip = "Zip code must be 3-10 alphanumeric characters.";
      isValid = false;
    }
    return isValid;
  }

  validateStep2() {
    this.errors = {};
    const selectedCards = document.querySelectorAll(".quote-wizard-package-card.selected");
    if (selectedCards.length === 0) {
      this.errors.package_type = "Please select at least one package type.";
      return false;
    }
    return true;
  }

  validateStep3() {
    let isValid = true;
    this.errors = {};
    const selectedTypes = this.selectedPackageTypes();
    const hasBoxes = selectedTypes.includes("boxes");
    const hasTelevision = selectedTypes.includes("television");
    const hasAuto = selectedTypes.includes("auto");

    // Box section — validated independently, only when boxes are selected.
    if (hasBoxes) {
      this.sectionRows(BOX).forEach((row, index) => {
        const quantity = q(row, ".box-quantity")?.value || "";
        const weight = q(row, ".box-weight")?.value || "";
        const length = q(row, ".box-length")?.value || "";
        const width = q(row, ".box-width")?.value || "";
        const height = q(row, ".box-height")?.value || "";

        if (!quantity || quantity.trim() === "") {
          this.errors[`box_${index}_quantity`] = "Quantity is required.";
          isValid = false;
        }
        if (!weight || weight.trim() === "") {
          this.errors[`box_${index}_weight`] = "Weight is required.";
          isValid = false;
        } else if (parseFloat(weight) <= 0) {
          this.errors[`box_${index}_weight`] = "Weight must be greater than 0.";
          isValid = false;
        }
        if (!length || length.trim() === "") {
          this.errors[`box_${index}_length`] = "Length is required.";
          isValid = false;
        } else if (parseFloat(length) <= 0) {
          this.errors[`box_${index}_length`] = "Length must be greater than 0.";
          isValid = false;
        }
        if (!width || width.trim() === "") {
          this.errors[`box_${index}_width`] = "Width is required.";
          isValid = false;
        } else if (parseFloat(width) <= 0) {
          this.errors[`box_${index}_width`] = "Width must be greater than 0.";
          isValid = false;
        }
        if (!height || height.trim() === "") {
          this.errors[`box_${index}_height`] = "Height is required.";
          isValid = false;
        } else if (parseFloat(height) <= 0) {
          this.errors[`box_${index}_height`] = "Height must be greater than 0.";
          isValid = false;
        }
      });
    }

    // Television section — validated independently, only when TV is selected.
    if (hasTelevision) {
      this.sectionRows(TV).forEach((row, index) => {
        const brandName = q(row, ".tv-brand-name")?.value || "";
        const tvModel = q(row, ".tv-model")?.value || "";
        const weight = q(row, ".tv-weight")?.value || "";
        const length = q(row, ".tv-length")?.value || "";
        const width = q(row, ".tv-width")?.value || "";
        const height = q(row, ".tv-height")?.value || "";

        if (!brandName || brandName.trim() === "") {
          this.errors[`tv_${index}_brand_name`] = "Brand name is required for televisions.";
          isValid = false;
        }
        if (!tvModel || tvModel.trim() === "") {
          this.errors[`tv_${index}_tv_model`] = "TV model is required for televisions.";
          isValid = false;
        }
        if (!weight || weight.trim() === "") {
          this.errors[`tv_${index}_weight`] = "Weight is required.";
          isValid = false;
        } else if (parseFloat(weight) <= 0) {
          this.errors[`tv_${index}_weight`] = "Weight must be greater than 0.";
          isValid = false;
        }
        if (!length || length.trim() === "") {
          this.errors[`tv_${index}_length`] = "Length is required.";
          isValid = false;
        } else if (parseFloat(length) <= 0) {
          this.errors[`tv_${index}_length`] = "Length must be greater than 0.";
          isValid = false;
        }
        if (!width || width.trim() === "") {
          this.errors[`tv_${index}_width`] = "Width is required.";
          isValid = false;
        } else if (parseFloat(width) <= 0) {
          this.errors[`tv_${index}_width`] = "Width must be greater than 0.";
          isValid = false;
        }
        if (!height || height.trim() === "") {
          this.errors[`tv_${index}_height`] = "Height is required.";
          isValid = false;
        } else if (parseFloat(height) <= 0) {
          this.errors[`tv_${index}_height`] = "Height must be greater than 0.";
          isValid = false;
        }
      });
    }

    if (hasAuto) {
      const vehicleItems = document.querySelectorAll(".vehicle-item");
      if (vehicleItems.length === 0) {
        this.errors.vehicles = "Please add at least one vehicle.";
        return false;
      }
      vehicleItems.forEach((vehicleItem, index) => {
        const brandName = q(vehicleItem, ".vehicle-brand-name")?.value || "";
        const carModel = q(vehicleItem, ".vehicle-model")?.value || "";
        const carYear = q(vehicleItem, ".vehicle-year")?.value || "";
        if (!brandName || brandName.trim() === "") {
          this.errors[`vehicle_${index}_brand_name`] = "Brand name is required.";
          isValid = false;
        }
        if (!carModel || carModel.trim() === "") {
          this.errors[`vehicle_${index}_car_model`] = "Car model is required.";
          isValid = false;
        }
        if (!carYear || carYear.trim() === "") {
          this.errors[`vehicle_${index}_car_year`] = "Car year is required.";
          isValid = false;
        }
      });
    }

    return isValid;
  }

  validateStep4() {
    let isValid = true;
    this.errors = {};
    const name = inById("wizard_contact_name")?.value || "";
    const email = inById("wizard_contact_email")?.value || "";
    const countryCode = inById("wizard_country_code")?.value || "";
    const phone = inById("wizard_contact_phone")?.value || "";

    if (!name || name.trim() === "") {
      this.errors.contact_name = "Please enter your name.";
      isValid = false;
    } else if (name.trim().length < 2) {
      this.errors.contact_name = "Name must be at least 2 characters.";
      isValid = false;
    }
    if (!email || email.trim() === "") {
      this.errors.contact_email = "Please enter your email address.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      this.errors.contact_email = "Please enter a valid email address.";
      isValid = false;
    }
    if (!countryCode || countryCode.trim() === "") {
      this.errors.country_code = "Please select a country code.";
      isValid = false;
    }
    if (!phone || phone.trim() === "") {
      this.errors.contact_phone = "Please enter your phone number.";
      isValid = false;
    } else if (!/^\d{7,20}$/.test(phone.replace(/[\s\-()]/g, ""))) {
      this.errors.contact_phone = "Phone number must be 7-20 digits.";
      isValid = false;
    }
    return isValid;
  }

  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
        return this.validateStep3();
      case 4:
        return this.validateStep4();
      default:
        return true;
    }
  }

  // ── Error display ─────────────────────────────────────────────────────────

  /** Resolve a fieldId like box_0_weight / tv_1_tv_model / vehicle_0_car_year to its input. */
  private resolveFieldElement(fieldId: string): HTMLElement | null {
    const boxMatch = fieldId.match(/^box_(\d+)_(.+)$/);
    if (boxMatch) {
      return document.querySelector(`[name="boxes[${boxMatch[1]}][${boxMatch[2]}]"]`);
    }
    const tvMatch = fieldId.match(/^tv_(\d+)_(.+)$/);
    if (tvMatch) {
      return document.querySelector(`[name="televisions[${tvMatch[1]}][${tvMatch[2]}]"]`);
    }
    const vehicleMatch = fieldId.match(/^vehicle_(\d+)_(.+)$/);
    if (vehicleMatch) {
      return document.querySelector(`[name="autos[${vehicleMatch[1]}][${vehicleMatch[2]}]"]`);
    }
    return null;
  }

  showError(fieldId: string, message: string) {
    const errorElement = byId(`error_${fieldId}`);
    if (errorElement) {
      const messageSpan = errorElement.querySelector("span");
      if (messageSpan) messageSpan.textContent = message;
      errorElement.style.display = "flex";
    }
    const inputElement: HTMLElement | null =
      byId(`wizard_${fieldId}`) ||
      document.querySelector(`[name="${fieldId}"]`) ||
      this.resolveFieldElement(fieldId);
    if (inputElement) inputElement.classList.add("is-invalid");
  }

  clearError(fieldId: string) {
    const errorElement = byId(`error_${fieldId}`);
    if (errorElement) {
      errorElement.style.display = "none";
      const messageSpan = errorElement.querySelector("span");
      if (messageSpan) messageSpan.textContent = "";
    }
    const inputElement: HTMLElement | null =
      byId(`wizard_${fieldId}`) ||
      document.querySelector(`[name="${fieldId}"]`) ||
      this.resolveFieldElement(fieldId);
    if (inputElement) inputElement.classList.remove("is-invalid");
  }

  clearAllErrors() {
    document.querySelectorAll<HTMLElement>(".quote-wizard-error-message").forEach((errorElement) => {
      errorElement.style.display = "none";
      const messageSpan = errorElement.querySelector("span");
      if (messageSpan) messageSpan.textContent = "";
    });
    document.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
    this.errors = {};
  }

  displayErrors() {
    this.clearAllErrors();
    Object.keys(this.errors).forEach((fieldId) => this.showError(fieldId, this.errors[fieldId]));
  }

  setupErrorClearing() {
    const step1Fields = ["wizard_from_country", "wizard_from_zip", "wizard_to_country", "wizard_to_zip"];
    const step4Fields = ["wizard_contact_name", "wizard_contact_email", "wizard_country_code", "wizard_contact_phone"];
    [...step1Fields, ...step4Fields].forEach((fieldId) => {
      const element = byId(fieldId);
      if (element) {
        const clear = () => this.clearError(fieldId.replace("wizard_", ""));
        element.addEventListener("input", clear);
        element.addEventListener("change", clear);
      }
    });
  }
}
