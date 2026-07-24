"use client";

import { useEffect, useRef } from "react";
import { CountryOptions } from "@/components/public/country-options";
import { QuoteWizardManager } from "@/components/public/quote-wizard/wizard-manager";

// The multi-step quote wizard — faithful port of welcome.blade.php's
// #quoteWizardContainer markup, rendered into the hero's wizard slot. The
// QuoteWizardManager (ported class) drives all behavior imperatively against
// this markup, exactly as the old site did; it's booted once after hydration
// (never re-rendered — no React state here).
//
// #quoteWizardContainer / #quoteSuccessMessage / #ratesContainer are siblings
// (as in the original) so showFedExRates can hide the wizard and reveal the
// rates. The default package/vehicle rows mirror the class's createXHtml output
// so add / remove / re-index / validation behave uniformly across rows.
export function QuoteWizard() {
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const manager = new QuoteWizardManager();
    manager.init();
    // The rates "Book Now" onclick (B2.3) calls window.quoteWizard.*; keep parity.
    (window as unknown as { quoteWizard: QuoteWizardManager }).quoteWizard = manager;
  }, []);

  return (
    <>
      {/* Wizard */}
      <div id="quoteWizardContainer" style={{ display: "none" }}>
        {/* Stepper Header */}
        <div className="quote-wizard-stepper-container">
          <div className="quote-wizard-step-pill active" id="wizard-pill-1">
            <i className="fa-solid fa-location-dot quote-wizard-step-icon" id="wizard-icon-1"></i>
            <div className="quote-wizard-step-text">
              <h6>Step 1</h6>
              <p>Location</p>
            </div>
          </div>
          <div className="quote-wizard-step-pill" id="wizard-pill-2">
            <i className="fa-solid fa-box-open quote-wizard-step-icon" id="wizard-icon-2"></i>
            <div className="quote-wizard-step-text">
              <h6>Step 2</h6>
              <p>Package</p>
            </div>
          </div>
          <div className="quote-wizard-step-pill" id="wizard-pill-3">
            <i className="fa-solid fa-box quote-wizard-step-icon" id="wizard-icon-3"></i>
            <div className="quote-wizard-step-text">
              <h6>Step 3</h6>
              <p>Package Details</p>
            </div>
          </div>
          <div className="quote-wizard-step-pill" id="wizard-pill-4">
            <i className="fa-solid fa-headset quote-wizard-step-icon" id="wizard-icon-4"></i>
            <div className="quote-wizard-step-text">
              <h6>Step 4</h6>
              <p>Contact</p>
            </div>
          </div>
        </div>

        {/* Wizard Form */}
        <form id="quoteWizardForm">
          {/* Step 1: Location Details */}
          <div id="wizard-step-1" className="quote-wizard-step-section active-section">
            <h4 className="quote-wizard-section-title">Location Details</h4>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="quote-wizard-location-card">
                  <div className="mb-4">
                    <label className="quote-wizard-form-label">
                      Sending from <span className="text-danger">*</span>
                    </label>
                    <div className="quote-wizard-input-group-pill">
                      <span className="input-icon">
                        <i className="fa-solid fa-location-dot"></i>
                      </span>
                      <select className="form-select" id="wizard_from_country" name="from_country">
                        <CountryOptions />
                      </select>
                    </div>
                    <div className="quote-wizard-error-message" id="error_from_country">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      <span></span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="quote-wizard-form-label">
                      From Zip Code <span className="text-danger">*</span>
                    </label>
                    <div className="quote-wizard-input-group-pill">
                      <span className="input-icon">
                        <i className="fa-solid fa-map-pin"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="wizard_from_zip"
                        name="from_zip"
                        placeholder="From Zip Code"
                        maxLength={10}
                      />
                    </div>
                    <div className="quote-wizard-error-message" id="error_from_zip">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      <span></span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 ps-2">
                  <div className="quote-wizard-custom-radio" id="wizard_is_residence">
                    <i className="fa-regular fa-circle quote-wizard-radio-inactive"></i>
                    <span>I&apos;m shipping to a residence</span>
                    <input
                      type="hidden"
                      id="wizard_is_residence_value"
                      name="is_residence"
                      defaultValue="0"
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="quote-wizard-location-card">
                  <div className="mb-4">
                    <label className="quote-wizard-form-label">
                      Sending to <span className="text-danger">*</span>
                    </label>
                    <div className="quote-wizard-input-group-pill">
                      <span className="input-icon">
                        <i className="fa-solid fa-location-dot"></i>
                      </span>
                      <select className="form-select" id="wizard_to_country" name="to_country">
                        <CountryOptions />
                      </select>
                    </div>
                    <div className="quote-wizard-error-message" id="error_to_country">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      <span></span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="quote-wizard-form-label">
                      Sending Zip Code <span className="text-danger">*</span>
                    </label>
                    <div className="quote-wizard-input-group-pill">
                      <span className="input-icon">
                        <i className="fa-solid fa-map-pin"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="wizard_to_zip"
                        name="to_zip"
                        placeholder="Sending Zip Code"
                        maxLength={10}
                      />
                    </div>
                    <div className="quote-wizard-error-message" id="error_to_zip">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Package Type Selection */}
          <div id="wizard-step-2" className="quote-wizard-step-section">
            <h4 className="quote-wizard-section-title">Select Types of Package</h4>
            <div className="quote-wizard-package-grid">
              <div className="quote-wizard-package-card" data-package-type="envelope">
                <div className="quote-wizard-pkg-icon-box">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <p className="m-0 fw-medium">Envelope</p>
              </div>
              <div className="quote-wizard-package-card" data-package-type="boxes">
                <div className="quote-wizard-pkg-icon-box">
                  <i className="fa-solid fa-box"></i>
                </div>
                <p className="m-0 fw-medium">Boxes</p>
              </div>
              <div className="quote-wizard-package-card" data-package-type="television">
                <div className="quote-wizard-pkg-icon-box">
                  <i className="fa-solid fa-desktop"></i>
                </div>
                <p className="m-0 fw-medium">Television</p>
              </div>
              <div className="quote-wizard-package-card" data-package-type="furniture">
                <div className="quote-wizard-pkg-icon-box">
                  <i className="fa-solid fa-couch"></i>
                </div>
                <p className="m-0 fw-medium">Furniture</p>
              </div>
              <div className="quote-wizard-package-card" data-package-type="auto">
                <div className="quote-wizard-pkg-icon-box">
                  <i className="fa-solid fa-car"></i>
                </div>
                <p className="m-0 fw-medium">Auto</p>
              </div>
            </div>
            <input type="hidden" id="wizard_package_type" name="package_type" defaultValue="" />
            <div className="quote-wizard-error-message" id="error_package_type">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span></span>
            </div>
          </div>

          {/* Step 3: Package Details (Conditional) — separate Box and Television
              sections ported from quotes/index.blade.php (the wizard variant with
              split sections). Each section shows on its OWN flag, has its own
              per-row add (+, last row) / remove (trash, >1 rows) buttons, its own
              re-indexing, and feeds its own payload array. */}
          <div id="wizard-step-3" className="quote-wizard-step-section">
            <h4 className="quote-wizard-section-title">Package Details</h4>

            {/* Box Details Section */}
            <div id="box-details-section" className="package-detail-section" style={{ display: "none" }}>
              <div className="box-details-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0">
                    <i className="fa-solid fa-box text-primary me-2"></i>Box Details
                  </h5>
                </div>

                <div id="boxes-container">
                  {/* Box Row (first) — mirrors createBoxRowHtml(0) so rows are uniform */}
                  <div className="box-row box-item mb-3" data-box-index="0">
                    <div className="row g-3 align-items-end inline-fields">
                      <div className="col-md-1 field-qty">
                        <label className="form-label d-md-none field-label">
                          No. of Boxes <span className="text-danger">*</span>
                        </label>
                        <div className="input-group-pill">
                          <select
                            className="form-select border-0 bg-transparent ps-3 box-quantity"
                            name="boxes[0][quantity]"
                            id="box_quantity_0"
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </div>
                        <div className="quote-wizard-error-message" id="error_box_0_quantity">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span></span>
                        </div>
                      </div>

                      <div className="col-md-3 field-weight">
                        <label className="form-label d-md-none field-label">
                          Weight <span className="text-danger">*</span>
                        </label>
                        <div className="merged-input-group">
                          <input
                            type="number"
                            className="form-control box-weight"
                            name="boxes[0][weight]"
                            id="box_weight_0"
                            placeholder="Weight"
                            step="0.01"
                            min="0.01"
                          />
                          <select
                            className="form-select unit-select box-weight-unit"
                            name="boxes[0][weight_unit]"
                            id="box_weight_unit_0"
                          >
                            <option value="LB">LB</option>
                            <option value="KG">KG</option>
                          </select>
                        </div>
                        <div className="quote-wizard-error-message" id="error_box_0_weight">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span></span>
                        </div>
                      </div>

                      <div className="col-md-4 field-dimensions">
                        <label className="form-label d-md-none field-label">
                          Dimensions <span className="text-danger">*</span>
                        </label>
                        <div className="dimensions-group">
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              className="form-control input-pill box-length"
                              name="boxes[0][length]"
                              id="box_length_0"
                              placeholder="Length"
                              step="0.01"
                              min="0.01"
                            />
                            <div className="quote-wizard-error-message" id="error_box_0_length">
                              <i className="fa-solid fa-circle-exclamation"></i>
                              <span></span>
                            </div>
                          </div>
                          <span className="dimension-separator">X</span>
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              className="form-control input-pill box-width"
                              name="boxes[0][width]"
                              id="box_width_0"
                              placeholder="Width"
                              step="0.01"
                              min="0.01"
                            />
                            <div className="quote-wizard-error-message" id="error_box_0_width">
                              <i className="fa-solid fa-circle-exclamation"></i>
                              <span></span>
                            </div>
                          </div>
                          <span className="dimension-separator">X</span>
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              className="form-control input-pill box-height"
                              name="boxes[0][height]"
                              id="box_height_0"
                              placeholder="Height"
                              step="0.01"
                              min="0.01"
                            />
                            <div className="quote-wizard-error-message" id="error_box_0_height">
                              <i className="fa-solid fa-circle-exclamation"></i>
                              <span></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-2 field-chargeable">
                        <label className="form-label d-md-none field-label">Chargeable Weight</label>
                        <div className="d-flex align-items-center">
                          <input
                            type="text"
                            className="form-control input-pill bg-light box-chargeable-weight"
                            name="boxes[0][chargeable_weight]"
                            id="box_chargeable_weight_0"
                            placeholder="Weight"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="col-md-2 d-flex gap-2 justify-content-end align-items-end field-actions">
                        <button type="button" className="btn btn-success btn-sm add-box-row-btn" style={{ display: "none" }}>
                          <i className="fa fa-plus"></i>
                        </button>
                        <button type="button" className="btn btn-danger btn-sm remove-box-btn" style={{ display: "none" }}>
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Television Details Section */}
            <div id="television-details-section" className="package-detail-section" style={{ display: "none" }}>
              <div className="box-details-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0">
                    <i className="fa-solid fa-tv text-primary me-2"></i>Television Details
                  </h5>
                </div>

                <div id="tvs-container">
                  {/* TV Row (first) — mirrors createTvRowHtml(0) */}
                  <div className="box-row tv-item mb-3" data-tv-index="0">
                    <div className="row g-3 align-items-end inline-fields tv-fields">
                      <div className="col-md-2 field-brand">
                        <label className="form-label d-md-none field-label">
                          Brand Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control input-pill tv-brand-name"
                          name="televisions[0][brand_name]"
                          id="tv_brand_name_0"
                          placeholder="Brand Name"
                        />
                        <div className="quote-wizard-error-message" id="error_tv_0_brand_name">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span></span>
                        </div>
                      </div>

                      <div className="col-md-2 field-model">
                        <label className="form-label d-md-none field-label">
                          Model <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control input-pill tv-model"
                          name="televisions[0][tv_model]"
                          id="tv_tv_model_0"
                          placeholder="TV Model"
                        />
                        <div className="quote-wizard-error-message" id="error_tv_0_tv_model">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span></span>
                        </div>
                      </div>

                      <div className="col-md-2 field-weight">
                        <label className="form-label d-md-none field-label">
                          Weight <span className="text-danger">*</span>
                        </label>
                        <div className="merged-input-group">
                          <input
                            type="number"
                            className="form-control tv-weight"
                            name="televisions[0][weight]"
                            id="tv_weight_0"
                            placeholder="Weight"
                            step="0.01"
                            min="0.01"
                          />
                          <select
                            className="form-select unit-select tv-weight-unit"
                            name="televisions[0][weight_unit]"
                            id="tv_weight_unit_0"
                          >
                            <option value="LB">LB</option>
                            <option value="KG">KG</option>
                          </select>
                        </div>
                        <div className="quote-wizard-error-message" id="error_tv_0_weight">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span></span>
                        </div>
                      </div>

                      <div className="col-md-4 field-dimensions">
                        <label className="form-label d-md-none field-label">
                          Dimensions <span className="text-danger">*</span>
                        </label>
                        <div className="dimensions-group">
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              className="form-control input-pill tv-length"
                              name="televisions[0][length]"
                              id="tv_length_0"
                              placeholder="Length"
                              step="0.01"
                              min="0.01"
                            />
                            <div className="quote-wizard-error-message" id="error_tv_0_length">
                              <i className="fa-solid fa-circle-exclamation"></i>
                              <span></span>
                            </div>
                          </div>
                          <span className="dimension-separator">X</span>
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              className="form-control input-pill tv-width"
                              name="televisions[0][width]"
                              id="tv_width_0"
                              placeholder="Width"
                              step="0.01"
                              min="0.01"
                            />
                            <div className="quote-wizard-error-message" id="error_tv_0_width">
                              <i className="fa-solid fa-circle-exclamation"></i>
                              <span></span>
                            </div>
                          </div>
                          <span className="dimension-separator">X</span>
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              className="form-control input-pill tv-height"
                              name="televisions[0][height]"
                              id="tv_height_0"
                              placeholder="Height"
                              step="0.01"
                              min="0.01"
                            />
                            <div className="quote-wizard-error-message" id="error_tv_0_height">
                              <i className="fa-solid fa-circle-exclamation"></i>
                              <span></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-2 field-chargeable">
                        <label className="form-label d-md-none field-label">Chargeable Weight</label>
                        <div className="d-flex align-items-center">
                          <input
                            type="text"
                            className="form-control input-pill bg-light tv-chargeable-weight"
                            name="televisions[0][chargeable_weight]"
                            id="tv_chargeable_weight_0"
                            placeholder="Weight"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="col-md-1 d-flex gap-2 justify-content-end align-items-end field-actions">
                        <button type="button" className="btn btn-success btn-sm add-tv-row-btn" style={{ display: "none" }}>
                          <i className="fa fa-plus"></i>
                        </button>
                        <button type="button" className="btn btn-danger btn-sm remove-tv-btn" style={{ display: "none" }}>
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Automobile Details (Conditional) */}
            <div
              id="wizard-auto-details-wrapper"
              className="quote-wizard-box-details-wrapper mt-4"
              style={{ display: "none" }}
            >
              <div className="quote-wizard-box-details-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0">
                    <i className="fa-solid fa-car text-primary me-2"></i>Auto Details
                  </h5>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    id="addVehicleBtn"
                  >
                    <i className="fa fa-plus me-1"></i>Add Vehicle
                  </button>
                </div>

                <div id="vehiclesContainer">
                  {/* Vehicle #1 (default) */}
                  <div className="vehicle-item mb-4 pb-4 border-bottom" data-vehicle-index="0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-semibold m-0">Vehicle #1</h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-pill remove-vehicle-btn"
                        style={{ display: "none" }}
                        data-vehicle-index="0"
                      >
                        <i className="fa fa-trash me-1"></i>Remove
                      </button>
                    </div>

                    <div className="row g-4">
                      <div className="col-md-4">
                        <label className="quote-wizard-form-label">
                          Brand Name (Make) <span className="text-danger">*</span>
                        </label>
                        <div className="quote-wizard-input-group-pill">
                          <input
                            type="text"
                            className="form-control vehicle-brand-name"
                            name="autos[0][brand_name]"
                            placeholder="Car Make"
                          />
                        </div>
                        <div className="quote-wizard-error-message" id="error_vehicle_0_brand_name">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span></span>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <label className="quote-wizard-form-label">
                          Car Model <span className="text-danger">*</span>
                        </label>
                        <div className="quote-wizard-input-group-pill">
                          <input
                            type="text"
                            className="form-control vehicle-model"
                            name="autos[0][car_model]"
                            placeholder="Car Model"
                          />
                        </div>
                        <div className="quote-wizard-error-message" id="error_vehicle_0_car_model">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span></span>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <label className="quote-wizard-form-label">
                          Car Year <span className="text-danger">*</span>
                        </label>
                        <div className="quote-wizard-input-group-pill">
                          <select className="form-select vehicle-year" name="autos[0][car_year]">
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
                        <div className="quote-wizard-error-message" id="error_vehicle_0_car_year">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Contact Information */}
          <div id="wizard-step-4" className="quote-wizard-step-section">
            <h4 className="quote-wizard-section-title">Contact Details</h4>
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <label className="quote-wizard-form-label">
                  Name <span className="text-danger">*</span>
                </label>
                <div className="quote-wizard-input-group-pill">
                  <span className="input-icon">
                    <i className="fa-regular fa-user"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="wizard_contact_name"
                    name="contact_name"
                    placeholder="Enter name"
                  />
                </div>
                <div className="quote-wizard-error-message" id="error_contact_name">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span></span>
                </div>
              </div>

              <div className="col-md-4">
                <label className="quote-wizard-form-label">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="quote-wizard-input-group-pill">
                  <span className="input-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    id="wizard_contact_email"
                    name="contact_email"
                    placeholder="Email Address"
                  />
                </div>
                <div className="quote-wizard-error-message" id="error_contact_email">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span></span>
                </div>
              </div>

              <div className="col-md-4">
                <label className="quote-wizard-form-label">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <div className="quote-wizard-contact-input-group">
                  <select
                    className="form-select quote-wizard-country-select"
                    id="wizard_country_code"
                    name="country_code"
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                  </select>
                  <span className="input-group-text">
                    <i className="fa-solid fa-phone text-muted"></i>
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    id="wizard_contact_phone"
                    name="contact_phone"
                    placeholder="1234567890"
                  />
                </div>
                <div className="quote-wizard-error-message" id="error_country_code">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span></span>
                </div>
                <div className="quote-wizard-error-message" id="error_contact_phone">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Navigation Footer */}
        <div className="quote-wizard-nav-footer mt-4">
          <button
            type="button"
            className="btn quote-wizard-btn-nav quote-wizard-btn-back"
            id="wizardBackBtn"
            style={{ display: "none" }}
          >
            <i className="fa fa-arrow-left me-1"></i>Back
          </button>
          <button
            type="button"
            className="btn quote-wizard-btn-nav quote-wizard-btn-next"
            id="wizardNextBtn"
          >
            Next<i className="fa fa-arrow-right ms-1"></i>
          </button>
        </div>
      </div>

      {/* Success Message (hidden by default) */}
      <div id="quoteSuccessMessage" style={{ display: "none" }}>
        <div className="quote-wizard-success-card text-center py-5">
          <i className="fa-solid fa-circle-check text-success" style={{ fontSize: "4rem" }}></i>
          <h4 className="mt-3 fw-bold">Quote Submitted Successfully!</h4>
          <p className="text-muted mb-0">
            We&apos;ll get back to you shortly with your quote details.
          </p>
        </div>
      </div>

      {/* FedEx Rates Container (shown conditionally on USA→USA success; B2.3 fills it) */}
      <div
        id="ratesContainer"
        className="quote-rates-container"
        style={{
          display: "none",
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          marginTop: "20px",
        }}
      ></div>
    </>
  );
}
