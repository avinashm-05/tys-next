import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TrackingLookupForm } from "@/components/public/tracking-lookup-form";

export const metadata: Metadata = pageMetadata({
  title: "Track a Shipment — TYS Global Logistics",
  description: "Track your TYS Global Logistics shipment. Enter your reference number for real-time delivery status.",
  path: "/tracking",
});

export default function TrackingPage() {
  return (
    <section className="bg-gray-50 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(16,24,40,0.04)] md:p-8">
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-brand md:text-3xl">
            Track Your Shipment
          </h1>
          <TrackingLookupForm />
        </div>

        <h2 className="mt-10 text-2xl font-bold text-ink md:text-3xl">How To Track Your Shipment</h2>
        <p className="mt-3 text-ink-muted">
          Track your shipment with confidence using the tracking number provided at the time of
          booking. Get real-time updates and complete visibility from dispatch to delivery.
        </p>

        <div className="mt-6 rounded-3xl bg-gray-100 p-6 md:p-8">
          <h3 className="text-xl font-bold text-brand">Ways you can track your shipment</h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-ink-muted marker:font-semibold marker:text-ink">
            <li>
              <span className="font-semibold text-ink">Confirmation Email</span> - The reference
              number or tracking number is printed on your confirmation email and shipping labels
              for easy lookup.
            </li>
            <li>
              Sign in to your <span className="font-semibold text-ink">TYS Global Logistics</span>{" "}
              account to track all your shipments, access booking details, and receive real-time
              delivery updates from one convenient dashboard.
            </li>
          </ol>
        </div>

        <p className="mt-6 text-ink-muted">
          Share your tracking number with the recipient so they can monitor the shipment in real
          time until it arrives at their doorstep.
        </p>
        <p className="mt-3 text-ink-muted">
          Need assistance with your shipment? Our dedicated support team is here to help with
          tracking, delivery updates, and any shipping-related questions. Contact us through our{" "}
          <a href="/contact-us" className="font-semibold text-ink hover:text-brand">
            Contact Us
          </a>{" "}
          page or call <span className="font-semibold text-ink">+1 (404) 793-8759</span> for
          prompt assistance.
        </p>
      </div>
    </section>
  );
}
