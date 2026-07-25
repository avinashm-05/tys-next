import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BookShipmentLoginForm } from "@/components/public/book-shipment-login-form";

export const metadata: Metadata = { title: "Book Shipment — TYS Global Logistics" };

export default async function BookShipmentPage() {
  const session = await getSession();
  if (session?.user) redirect("/account");

  return (
    <section className="relative overflow-hidden bg-gray-50 px-4 py-20 md:px-8">
      <svg
        aria-hidden
        viewBox="0 0 1440 500"
        className="pointer-events-none absolute inset-0 h-full w-full text-brand-light"
      >
        <path
          d="M0,120 Q360,20 720,140 T1440,90"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="8 10"
        />
        <path
          d="M0,420 Q400,470 760,360 T1440,410"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="8 10"
        />
      </svg>

      <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border-t-4 border-brand bg-white p-8 shadow-[0_20px_60px_rgba(16,24,40,0.1)] md:p-10">
        <img
          src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png"
          alt="TYS Global Logistics"
          width={480}
          height={177}
          draggable={false}
          className="mx-auto h-12 w-auto select-none"
        />
        <p className="mt-4 text-center text-sm text-ink-muted">
          Log in to book and manage your shipments.
        </p>
        <div className="mt-6">
          <BookShipmentLoginForm />
        </div>
      </div>
    </section>
  );
}
