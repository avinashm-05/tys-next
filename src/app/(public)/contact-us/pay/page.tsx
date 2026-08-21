import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { PaymentTabs } from "@/components/public/payment-tabs";

export const metadata: Metadata = pageMetadata({
  title: "Online Payment — TYS Global Logistics",
  description: "Pay for your TYS Global Logistics shipment securely online. Card and bank transfer accepted.",
  path: "/contact-us/pay",
  noIndex: true,
});

export default function PayPage() {
  return (
    <>
      <PageHeroBand
        title="ONLINE PAYMENT"
        subtitle="Enjoy A Seamless Transaction Process With Highly Secure 128-Bit Payment Gateway"
      />

      <section className="bg-gray-50 px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl">
          <PaymentTabs />
        </div>
      </section>
    </>
  );
}
