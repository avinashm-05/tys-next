import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { getSession } from "@/lib/auth";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { BookShipmentLoginForm } from "@/components/public/book-shipment-login-form";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { PageBody, Section } from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "Book a Shipment | TYS Global Logistics",
  path: "/book-shipment",
  noIndex: true,
});

function LoginGate() {
  return (
    <>
      <PageHeroBand
        quote={false}
        kicker="Book a shipment"
        title="Log in to"
        accent="book a shipment."
        subtitle="Book and manage your shipments from your TYS Global Logistics account."
      />
      <PageBody>
        <Section>
          <div className="mx-auto max-w-md">
            <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[0_20px_60px_rgba(16,24,40,0.06)] sm:p-8">
              <BookShipmentLoginForm />
            </div>
            <p className="mt-6 text-center text-[15px] text-ink-muted">
              Only need a price?{" "}
              <Link href="/quotes" className="font-medium text-brand hover:underline">
                Get a free quote
              </Link>
            </p>
          </div>
        </Section>
      </PageBody>
    </>
  );
}

function VerifyEmailNotice() {
  return (
    <>
      <PageHeroBand
        quote={false}
        kicker="One more step"
        title="Verify your"
        accent="email."
        subtitle="Check your inbox for the verification link before booking a shipment."
      />
      <PageBody>
        <Section>
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-[15.5px] text-ink-muted">
              Can&rsquo;t find the email? Check your spam folder, or send a new one.
            </p>
            <Link href="/account/verify-email" className="btn btn-primary btn-lg">
              Resend the verification email <ArrowRightIcon size={15} />
            </Link>
          </div>
        </Section>
      </PageBody>
    </>
  );
}

// Kept as the logged-out door into scheduling (old links, bookmarks, and the
// "log in to book" path all still land here). Once you're signed in the
// wizard itself lives at /account/schedule, inside the portal shell, so the
// sidebar doesn't vanish mid-flow — this just forwards you there.
export default async function BookShipmentPage() {
  const session = await getSession();
  if (!session?.user) return <LoginGate />;
  if (!session.user.emailVerified) return <VerifyEmailNotice />;
  redirect("/account/schedule");
}
