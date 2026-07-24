import { CountryOptions } from "@/components/public/country-options";
import { QuoteWizard } from "@/components/public/quote-wizard";
import { LearnMoreModal } from "@/components/public/learn-more-modal";

// Home page — ported section-by-section from welcome.blade.php with the exact
// markup/classes/assets. Bootstrap JS (loaded in the public layout) drives the
// pill tabs and the FAQ accordion via their data-bs-* attributes, so behavior
// matches the old site. The tracking box + "Track your Shipment" stay INERT
// (Track B). The hero quick-quote (From/To + Get a Free Quote) and the embedded
// wizard are wired in B2 via <QuoteWizard/> + the QuoteWizardManager class.

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="hero-bg">
        <img
          src="/frontend/assets/images/herotop.png"
          alt=""
          className="herotoppngimg img-fluid"
          data-aos="fade-in"
          data-aos-duration="3000"
          data-aos-delay="900"
        />
        <div className="container herocontainercss">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-12">
              <div className="text-center heder-text">
                <p
                  className="bold-text herosecsubtitle"
                  id="heroContent"
                  data-aos="fade-in"
                  data-aos-duration="3000"
                  data-aos-delay="100"
                >
                  Trusted Logistics Across the USA &amp; Worldwide
                </p>
                <h1
                  className="header-text herosectitle"
                  data-aos="fade-in"
                  data-aos-duration="3000"
                  data-aos-delay="400"
                >
                  Ship Anything, Anywhere On Time
                </h1>
                <p
                  className="bold-text hreodec"
                  data-aos="fade-in"
                  data-aos-duration="3000"
                  data-aos-delay="800"
                >
                  From the USA to anywhere in the world. Save time. Save money.
                </p>
              </div>
              <div
                className="form-main"
                id="bookShipmentForm"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="1000"
              >
                <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="pills-home-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-home"
                      type="button"
                      role="tab"
                      aria-controls="pills-home"
                      aria-selected="true"
                    >
                      Book Shipment
                    </button>
                  </li>
                  <li className="nav-item ms-3" role="presentation">
                    <button
                      className="nav-link"
                      id="pills-profile-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-profile"
                      type="button"
                      role="tab"
                      aria-controls="pills-profile"
                      aria-selected="false"
                    >
                      Tracking
                    </button>
                  </li>
                </ul>
                <div className="tab-content" id="pills-tabContent">
                  {/* Book Shipment quick-quote — From/To prefill the wizard; #getQuoteBtn opens it (QuoteWizardManager). */}
                  <div
                    className="tab-pane fade show active"
                    id="pills-home"
                    role="tabpanel"
                    aria-labelledby="pills-home-tab"
                  >
                    <form className=" row ">
                      <div className="col-6 pe-md-2 pe-1">
                        <label className="formlabelcss" htmlFor="select_page2">
                          From
                        </label>
                        <div className="input-group quoteinputcss">
                          <span className="input-group-text">
                            <img
                              src="/frontend/assets/images/MapPin.svg"
                              className="img-fluid"
                              alt=""
                            />
                          </span>
                          <select id="select_page2" className="operator form-control">
                            <CountryOptions placeholder="Select From" />
                          </select>
                        </div>
                      </div>

                      <div className="col-6 ps-md-2 ps-1">
                        <label className="formlabelcss" htmlFor="select_page3">
                          To
                        </label>
                        <div className="input-group quoteinputcss">
                          <span className="input-group-text">
                            <img
                              src="/frontend/assets/images/MapPin.svg"
                              className="img-fluid"
                              alt=""
                            />
                          </span>
                          <select id="select_page3" className="operator form-control">
                            <CountryOptions placeholder="Select To" />
                          </select>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="nav-bar-link-wrapper-item p-0 spaceakhover">
                          {/* #getQuoteBtn — QuoteWizardManager opens the wizard with these selects prefilled. */}
                          <button
                            type="button"
                            id="getQuoteBtn"
                            className="fillbttn fillbttn2 w-100 mt-3"
                            style={{ border: "none" }}
                          >
                            Get a Free Quote
                            <img src="/frontend/assets/images/arrowright.svg" alt="" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                  {/* Tracking box — INERT. TODO(Track B): wire the tracking lookup. */}
                  <div
                    className="tab-pane fade"
                    id="pills-profile"
                    role="tabpanel"
                    aria-labelledby="pills-profile-tab"
                  >
                    <form className=" row ">
                      <div className="col-12 pe-md-2 pe-1">
                        <label className="formlabelcss" htmlFor="">
                          Enter you 12 Digit Tracking/reference no.
                        </label>
                        <div className="">
                          <input
                            type="text"
                            className="input-group quoteinputcss py-2 hero-input"
                            placeholder="Enter Tracking Number"
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="nav-bar-link-wrapper-item p-0 spaceakhover">
                          {/* TODO(Track B): perform the tracking lookup */}
                          <a href="#" className="fillbttn fillbttn2 w-100 mt-3">
                            Track your Shipment
                            <img src="/frontend/assets/images/arrowright.svg" alt="" />
                          </a>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Embedded quote wizard (+ success/rates siblings), driven by
                  the ported QuoteWizardManager class. */}
              <QuoteWizard />
            </div>
          </div>
        </div>
      </div>

      <img src="/frontend/assets/images/herobottom.png" className="herobottomimg" alt="" />

      {/* step */}
      <section className="stepsssection" id="steps">
        <div className="container ">
          <div className="row ">
            <div
              className="col-12 secsmalltitle"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="-900"
            >
              <span>
                <img src="/frontend/assets/images/diskblue.svg" className="img-fluid" alt="" />
              </span>
              steps
            </div>
          </div>

          <div className="row justify-content-center align-items-center">
            <div
              className="col-12 secmaintitle"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="200"
            >
              <h2>Shipping Made Simple in 3 Steps</h2>
            </div>
            <div className="col-md-6 col-12 secdcpart d-flex flex-column align-items-center">
              <div
                className="secdec"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="300"
              >
                As your trusted logistics service provide, we can help you and your customer with
                all shipping and moving services within USA and worldwide.
              </div>
              <div
                className="nav-bar-link-wrapper-item p-0 spaceakhover "
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="400"
              >
                <a href="#quoteWizardContainer" data-open-quote-wizard className="fillbttn fillbttn2 ">
                  Get a Free Quote
                  <img src="/frontend/assets/images/arrowright.svg" alt="" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row layoutbgcss">
            <div
              className="col-lg-4 col-md-6 col-12 mt-md-0 ps-2 pe-2"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="100"
            >
              <div className="maincardbox">
                <img
                  src="/frontend/assets/images/cardimg/img12.png"
                  className="img-fluid imgcardcss"
                  alt="Logistics consultation for shipping quote"
                />
                <div className="carddetails">
                  <div className="cardsmalltitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                    Step-1
                  </div>
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      Tell Us What You Need to Ship
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                      Share your pickup location, destination, and shipment details. Our team
                      reviews your requirements and prepares a customized shipping quote with
                      delivery options.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-lg-4 col-md-6 col-12 mt-md-0 mt-3 ps-2 pe-2"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="350"
            >
              <div className="maincardbox">
                <img
                  src="/frontend/assets/images/cardimg/img11.png"
                  className="img-fluid imgcardcss"
                  alt="Package pickup by TYS Global Logistics"
                />
                <div className="carddetails">
                  <div className="cardsmalltitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                    Step-2
                  </div>
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      We Pick Up Your Shipment
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                      Once your booking is confirmed, our team schedules the pickup and securely
                      processes your shipment for domestic or international transportation using
                      trusted carrier networks.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-lg-4 col-md-6 col-12 mt-lg-0 mt-3 ps-2 pe-2"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="450"
            >
              <div className="maincardbox">
                <img
                  src="/frontend/assets/images/cardimg/img10.png"
                  className="img-fluid imgcardcss"
                  alt="Safe cargo delivery by TYS Global Logistics"
                />
                <div className="carddetails">
                  <div className="cardsmalltitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                    Step-3
                  </div>
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      We Deliver While You Stay Focused
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                      Sit back while we manage the transportation and delivery of your shipment with
                      reliability, transparency, and professional logistics support from start to
                      finish.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="featuresssection" id="features">
        <div className="container ">
          <div className="row ">
            <div className="col-12 secsmalltitle" data-aos="fade-up" data-aos-duration="1000">
              <span>
                <img src="/frontend/assets/images/diskblue.svg" className="img-fluid" alt="" />
              </span>
              features
            </div>
          </div>

          <div className="row justify-content-center align-items-center">
            <div className="col-12">
              <div className="row justify-content-center align-items-center">
                <div
                  className="col-lg-6 col-12 secmaintitle"
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  data-aos-delay="200"
                >
                  Send docs, boxes, or full containers. We&rsquo;ll handle it all.
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-12 secdcpart d-flex flex-column align-items-center">
              <div
                className="secdec"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="300"
              >
                As your trusted logistics service provide, we can help you and your customer with
                all shipping and moving services within USA and worldwide.
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row ">
            <div className="col-lg-7 col-md-6 col-12 mt-md-0  ps-2 pe-2">
              <div className="maincardbox">
                <img src="/frontend/assets/images/cardimg/img09.png" className="img-fluid imgcardcss" alt="" />
                <div className="carddetails">
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                      Domestic Shipping (US to US)
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      Our domestic shipping service offers reliable door-to-door transportation
                      across the United States for documents, parcels, freight, and commercial
                      shipments. Whether you&rsquo;re sending personal packages or business
                      inventory, we ensure timely pickups, secure handling, and dependable delivery
                      through our trusted logistics network. Certain restricted items, including
                      cash, firearms, explosives, hazardous materials, and illegal goods, cannot be
                      shipped and must comply with applicable carrier regulations.
                    </div>
                  </div>
                  <a href="#" target="_blank" className="textbtncss" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="100">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-6 col-12 mt-md-0 mt-3 ps-2 pe-2">
              <div className="maincardbox">
                <img src="/frontend/assets/images/cardimg/img08.png" className="img-fluid imgcardcss" alt="" />
                <div className="carddetails">
                  <div className="cardcontentcss" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                    <div className="cardmiantitle">International Shipping (US to Worldwide)</div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      Ship confidently from the United States to destinations across the globe with
                      TYS Global Logistics LLC. Through our discounted FedEx international shipping
                      solutions, you can save on express delivery for documents, parcels, excess
                      baggage, and commercial shipments while enjoying reliable tracking and fast
                      transit times. Our team also assists with shipping documentation ...
                    </div>
                  </div>
                  <a href="#" target="_blank" className="textbtncss" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="100">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-12 mt-3  ps-2 pe-2">
              <div className="maincardbox">
                <img src="/frontend/assets/images/cardimg/img07.png" className="img-fluid imgcardcss" alt="" />
                <div className="carddetails">
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                      FedEx Envelope Shipping (Discounted)
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      Our discounted FedEx Envelope service is designed for urgent documents such as
                      contracts, legal paperwork, academic records, and business correspondence.
                      This service is intended for documents only and should not be used to send
                      cash, cheque, negotiable instruments, gift cards, or other prohibited
                      valuables that violate carrier policies.
                    </div>
                  </div>
                  <a href="#" target="_blank" className="textbtncss" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="100">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-12 mt-3 ps-2 pe-2">
              <div className="maincardbox">
                <img src="/frontend/assets/images/cardimg/img06.png" className="img-fluid imgcardcss" alt="" />
                <div className="carddetails">
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                      Packers &amp; Movers Across USA
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      We provide professional packing and moving solutions for residential and
                      commercial customers across the United States. From household furniture and
                      office equipment to personal belongings and business inventory, our
                      experienced team ensures every move is planned and executed with care. We
                      bring high-quality professional packing materials and ...
                    </div>
                  </div>
                  <a href="#" target="_blank" className="textbtncss" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="100">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-12 mt-3 ps-2 pe-2">
              <div className="maincardbox  d-flex flex-lg-row flex-column align-items-center justify-content-center ">
                <div className="carddetails carddetails2 justify-content-end order-lg-0 order-1">
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                      LTL &amp; FTL Freight Shipping
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      Our Less-Than-Truckload (LTL) and Full Truckload (FTL) freight services offer
                      flexible transportation for pallets, machinery, inventory, and commercial
                      cargo across the country.
                    </div>
                  </div>
                  <a href="#" target="_blank" className="textbtncss" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="100">
                    Learn More
                  </a>
                </div>
                <div className="imgcardcsss">
                  <img src="/frontend/assets/images/cardimg/img05.png" className="img-fluid imgcardcss " alt="" />
                </div>
              </div>
            </div>
            <div className="col-md-6 col-12 mt-3  ps-2 pe-2">
              <div className="maincardbox">
                <img src="/frontend/assets/images/cardimg/img03.png" className="img-fluid imgcardcss" alt="" />
                <div className="carddetails">
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                      LCL &amp; FCL Door-to-Door Ocean Freight Shipping
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      Our Less-than-Container Load (LCL) and Full Container Load (FCL) door-to-door
                      ocean freight services provide seamless international shipping from pickup at
                      the origin to final delivery at your destination. Whether you&rsquo;re
                      transporting a small commercial consignment or a full container, TYS Global
                      Logistics LLC manages ...
                    </div>
                  </div>
                  <a href="#" target="_blank" className="textbtncss" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="100">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-12 mt-3 ps-2 pe-2">
              <div className="maincardbox">
                <img src="/frontend/assets/images/cardimg/img04.png" className="img-fluid imgcardcss" alt="" />
                <div className="carddetails">
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                      Residential House Moving
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      Relocating your home is easier with our end-to-end moving services that
                      include packing, loading, transportation, and unloading. We recommend keeping
                      important documents, jewelry, cash, medications, and irreplaceable valuables
                      with you during the move rather than packing them with household goods.
                    </div>
                  </div>
                  <a href="#" target="_blank" className="textbtncss" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="100">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-7 col-md-6 col-12 mt-3  ps-2 pe-2">
              <div className="maincardbox">
                <img src="/frontend/assets/images/cardimg/img02.png" className="img-fluid imgcardcss" alt="" />
                <div className="carddetails">
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                      Vehicle Transport Services
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      Our vehicle transportation solutions safely move cars, SUVs, motorcycles, and
                      other eligible vehicles across the United States. Before shipment, vehicles
                      should be prepared according to transport guidelines, including removing
                      personal belongings and documenting their condition, to ensure a smooth pickup
                      and delivery process.
                    </div>
                  </div>
                  <a href="#" target="_blank" className="textbtncss" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="100">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-6 col-12 mt-3 ps-2 pe-2">
              <div className="maincardbox">
                <img src="/frontend/assets/images/cardimg/img01.png" className="img-fluid imgcardcss" alt="" />
                <div className="carddetails">
                  <div className="cardcontentcss">
                    <div className="cardmiantitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
                      Warehouse &amp; Storage Facilities
                    </div>
                    <div className="carddec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                      TYS Global Logistics LLC offers secure warehousing and storage solutions for
                      personal belongings, business inventory, and commercial goods. Our facilities
                      are designed to provide safe storage with organized inventory handling...
                    </div>
                  </div>
                  <a href="#" target="_blank" className="textbtncss" data-aos="fade-in" data-aos-duration="1000" data-aos-delay="100">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn More modal — markup + open/close behavior in the client component. */}
      <LearnMoreModal />

      {/* why us */}
      <section className="whyusssection" id="whyus">
        <div className="container ">
          <div className="row ">
            <div className="col-12 secsmalltitle  justify-content-start">
              <span>
                <img src="/frontend/assets/images/diskblue.svg" className="img-fluid" alt="" />
              </span>
              Why Us
            </div>
          </div>

          <div className="row justify-content-center align-items-center">
            <div
              className="col-lg-6 col-12 secmaintitle text-start"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="200"
            >
              Why Businesses Choose TYS Global Logistics LLC
            </div>
            <div className="col-lg-6 col-12 secdcpart d-flex flex-column align-items-start">
              <div className="secdec text-start" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
                From local deliveries to international freight, TYS Global Logistics LLC is committed
                to providing dependable, cost-effective, and customer-focused logistics solutions.
                We combine industry expertise with reliable service to keep your shipments moving on
                time.
              </div>
              <div className="nav-bar-link-wrapper-item p-0 spaceakhover " data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                <a href="#quoteWizardContainer" data-open-quote-wizard className="fillbttn fillbttn2 ">
                  Get a Free Quote
                  <img src="/frontend/assets/images/arrowright.svg" alt="" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row layoutbgcss ">
            <div className="col-12">
              <div className="gridboxss">
                <div className="div1 gridmaincard" data-aos="zoom-in" data-aos-duration="2000">
                  <div className="iconboxbg gridimgbggreen">
                    <img src="/frontend/assets/images/delivery.svg" className="img-fluid" alt="Delivery icon" />
                  </div>
                  <div className="gridcardcontentcss">
                    <div className="gridcardmiantitle">Reliable &amp; On-Time Delivery</div>
                    <div className="gridcarddec">
                      We prioritize punctual pickups and timely deliveries, ensuring your shipments
                      reach their destination safely and according to schedule.
                    </div>
                  </div>
                </div>
                <div className="div2 gridmaincard" data-aos="zoom-in" data-aos-duration="2000">
                  <div className="iconboxbg gridimgbggreen">
                    <img src="/frontend/assets/images/support.svg" className="img-fluid" alt="Support icon" />
                  </div>
                  <div className="gridcardcontentcss">
                    <div className="gridcardmiantitle">Dedicated Customer Support</div>
                    <div className="gridcarddec">
                      Our experienced support team is available to assist you throughout the shipping
                      process, providing updates and prompt resolutions.
                    </div>
                  </div>
                </div>
                <div className="div3 gridmaincard" data-aos="zoom-in" data-aos-duration="2000">
                  <div className="iconboxbg gridimgbgred">
                    <img src="/frontend/assets/images/secure.svg" className="img-fluid" alt="Secure icon" />
                  </div>
                  <div className="gridcardcontentcss">
                    <div className="gridcardmiantitle">Secure Handling</div>
                    <div className="gridcarddec">
                      Every shipment is handled with care using professional packing, transportation,
                      and tracking practices to minimize risk and ensure safety.
                    </div>
                  </div>
                </div>
                <div className="div4 gridmaincard" data-aos="zoom-in" data-aos-duration="2000">
                  <div className="iconboxbg gridimgbgred">
                    <img src="/frontend/assets/images/customized.svg" className="img-fluid" alt="Customized logistics icon" />
                  </div>
                  <div className="gridcardcontentcss">
                    <div className="gridcardmiantitle">Customized Logistics Solutions</div>
                    <div className="gridcarddec">
                      From documents and parcels to freight, vehicle transport, warehousing, and
                      relocations, we tailor our services to meet your unique business and personal
                      shipping needs.
                    </div>
                  </div>
                </div>
                <div className="div6 gridmaincard" data-aos="zoom-in" data-aos-duration="2000">
                  <div className="iconboxbg gridimgbggreen">
                    <img src="/frontend/assets/images/pricing.svg" className="img-fluid" alt="Pricing icon" />
                  </div>
                  <div className="gridcardcontentcss">
                    <div className="gridcardmiantitle">Competitive Pricing</div>
                    <div className="gridcarddec">
                      Get affordable shipping rates without compromising on service quality. Our
                      transparent pricing helps you reduce logistics costs.
                    </div>
                  </div>
                </div>
                <div className="div7 gridmaincard" data-aos="zoom-in" data-aos-duration="2000">
                  <div className="iconboxbg gridimgbgred">
                    <img src="/frontend/assets/images/truckicon.svg" className="img-fluid" alt="Global reach icon" />
                  </div>
                  <div className="gridcardcontentcss">
                    <div className="gridcardmiantitle">Domestic &amp; Global Reach</div>
                    <div className="gridcarddec">
                      Whether shipping across the United States or internationally, our extensive
                      logistics network ensures seamless transportation worldwide.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proofs */}
      <section className="proofssection">
        <div className="container ">
          <div className="row ">
            <div className="col-12 secsmalltitle  justify-content-start">
              <span>
                <img src="/frontend/assets/images/diskblue.svg" className="img-fluid" alt="" />
              </span>
              TRUSTED SHIPPING
            </div>
          </div>

          <div className="row justify-content-start align-items-start">
            <div className="col-lg-9 col-12 secmaintitle text-start">
              As your trusted logistics service provide, we can help you and your customer with all
              shipping and moving services within USA and worldwide.
              <div className="nav-bar-link-wrapper-item p-0 spaceakhover">
                <a href="#quoteWizardContainer" data-open-quote-wizard className="fillbttn fillbttn2 ">
                  Get a Free Quote
                  <img src="/frontend/assets/images/arrowright.svg" alt="" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-12 d-flex justify-content-center">
              <div className="mapsvagproof">
                <img src="/frontend/assets/images/fullmap.svg" className="img-fluid" alt="" />
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-12 ">
              <div className="proofcard">
                <div className="proofcount">24/7</div>
                <div className="proofname">Customer Support</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-12 ">
              <div className="proofcard">
                <div className="proofcount">Transparent</div>
                <div className="proofname">Pricing</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-12 ">
              <div className="proofcard">
                <div className="proofcount">Secure</div>
                <div className="proofname">Shipment Handling</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-12 ">
              <div className="proofcard">
                <div className="proofcount">Worldwide</div>
                <div className="proofname">Logistics Network</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* quote */}
      <section className="quotesection">
        <div className="container ">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-6 col-12 order-lg-0 order-1 ">
              <div className="quotedetails">
                <div className="secsmalltitle  justify-content-start ">GET AN INSTANT QUOTE</div>
                <div className="secmaintitle text-start mt-0">
                  Get Your Shipping <br /> Quote In Seconds
                </div>
                <div className="secdcpart d-flex flex-column align-items-start">
                  <div className="secdec text-start">
                    As your trusted logistics service provider, we can help you and your customer
                    with all shipping and moving services within the USA and worldwide.
                  </div>
                </div>
              </div>

              {/* Instant-quote CTA — INERT. TODO(B2): wire to the wizard. */}
              <form className="quoteformbox row ">
                <div className="col-6 pe-md-2 pe-1">
                  <label className="formlabelcss" htmlFor="select_page">
                    From
                  </label>
                  <div className="input-group quoteinputcss">
                    <span className="input-group-text">
                      <img src="/frontend/assets/images/MapPin.svg" className="img-fluid" alt="" />
                    </span>
                    <select id="select_page" className="operator form-control">
                      <CountryOptions placeholder="Select From" />
                    </select>
                  </div>
                </div>

                <div className="col-6 ps-md-2 ps-1">
                  <label className="formlabelcss" htmlFor="select_page1">
                    To
                  </label>
                  <div className="input-group quoteinputcss">
                    <span className="input-group-text">
                      <img src="/frontend/assets/images/MapPin.svg" className="img-fluid" alt="" />
                    </span>
                    <select id="select_page1" className="operator form-control">
                      <CountryOptions placeholder="Select To" />
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="nav-bar-link-wrapper-item p-0 spaceakhover">
                    <a
                      href="#quoteWizardContainer"
                      data-open-quote-wizard
                      data-prefill-from="select_page"
                      data-prefill-to="select_page1"
                      className="fillbttn fillbttn2 w-100 mt-3"
                    >
                      Get a Free Quote
                      <img src="/frontend/assets/images/arrowright.svg" alt="" />
                    </a>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-lg-6 col-12 imgcolcss ">
              <div className="quoteimgcssdiv">
                <img src="/frontend/assets/images/cardimg/img14.png" className="img-fluid quoteimgcss" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="faqsection" id="faq">
        <div className="container ">
          <div className="row ">
            <div
              className="col-12 secsmalltitle"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="-900"
            >
              <span>
                <img src="/frontend/assets/images/diskblue.svg" className="img-fluid" alt="" />
              </span>
              FAQ
            </div>
          </div>

          <div className="row justify-content-center align-items-center">
            <div className="col-12 secmaintitle" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
              FAQs
            </div>
            <div className="col-md-6 col-12 secdcpart d-flex flex-column align-items-center">
              <div className="secdec" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
                Find answers to the most common questions about shipping, moving, freight, and
                logistics services offered by TYS Global Logistics LLC.
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-12">
              <div className="accordion accordion-flush" id="accordionFlushExample">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="flush-headingOne">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#flush-collapseOne"
                      aria-expanded="false"
                      aria-controls="flush-collapseOne"
                    >
                      How do I get a shipping quote?
                    </button>
                  </h2>
                  <div
                    id="flush-collapseOne"
                    className="accordion-collapse collapse"
                    aria-labelledby="flush-headingOne"
                    data-bs-parent="#accordionFlushExample"
                  >
                    <div className="accordion-body">
                      Simply fill out our quote request form or contact our team with your shipment
                      details. We&rsquo;ll provide a customized quote based on your requirements.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="flush-headingTwo">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#flush-collapseTwo"
                      aria-expanded="false"
                      aria-controls="flush-collapseTwo"
                    >
                      Do you offer international shipping?
                    </button>
                  </h2>
                  <div
                    id="flush-collapseTwo"
                    className="accordion-collapse collapse"
                    aria-labelledby="flush-headingTwo"
                    data-bs-parent="#accordionFlushExample"
                  >
                    <div className="accordion-body">
                      Yes. We provide reliable international shipping solutions from the United States
                      to destinations worldwide, including documents, parcels, freight, and
                      commercial cargo.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="flush-headingThree">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#flush-collapseThree"
                      aria-expanded="false"
                      aria-controls="flush-collapseThree"
                    >
                      Can I ship documents and small parcels?
                    </button>
                  </h2>
                  <div
                    id="flush-collapseThree"
                    className="accordion-collapse collapse"
                    aria-labelledby="flush-headingThree"
                    data-bs-parent="#accordionFlushExample"
                  >
                    <div className="accordion-body">
                      Absolutely. We offer secure and cost-effective document and parcel shipping
                      services, including discounted express options for time-sensitive deliveries.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="flush-headingFour">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#flush-collapseFour"
                      aria-expanded="false"
                      aria-controls="flush-collapseFour"
                    >
                      Do you provide vehicle transportation services?
                    </button>
                  </h2>
                  <div
                    id="flush-collapseFour"
                    className="accordion-collapse collapse"
                    aria-labelledby="flush-headingThree"
                    data-bs-parent="#accordionFlushExample"
                  >
                    <div className="accordion-body">
                      Yes. We arrange safe and dependable transport for cars, SUVs, motorcycles, and
                      other vehicles across the United States.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="flush-headingFive">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#flush-collapseFive"
                      aria-expanded="false"
                      aria-controls="flush-collapseFive"
                    >
                      Do you offer packing, moving, and storage services?
                    </button>
                  </h2>
                  <div
                    id="flush-collapseFive"
                    className="accordion-collapse collapse"
                    aria-labelledby="flush-headingThree"
                    data-bs-parent="#accordionFlushExample"
                  >
                    <div className="accordion-body">
                      Yes. TYS Global Logistics LLC provides residential moving, commercial
                      relocation, professional packing, and secure warehousing and storage solutions
                      to meet a wide range of logistics needs.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
