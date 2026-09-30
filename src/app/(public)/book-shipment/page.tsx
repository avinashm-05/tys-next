import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { visibleSocialProviders, getSession, isCustomerSession } from "@/lib/auth";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { AccountShell } from "@/components/public/account/shell";
import { LoginForm } from "@/components/public/account/auth-forms";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { PageBody, Section } from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "Book a Shipment | TYS Global Logistics",
  path: "/book-shipment",
  noIndex: true,
});

function LoginGate() {
  return (
    <AccountShell
      kicker="Book a shipment"
      title="Log in to"
      accent="book a shipment."
      subtitle="Use your TYS account to book a pickup. New here? Create an account in a minute, or just get a price first."
    >
      <LoginForm verified={false} socialProviders={visibleSocialProviders()} redirectTo="/account/schedule" />
      <p className="mt-5 border-t border-[#E6EBF2] pt-4 text-center text-[15px] text-ink-muted">
        Only need a price?{" "}
        <Link href="/quotes" className="font-semibold text-brand hover:underline">
          Get a free quote
        </Link>
      </p>
    </AccountShell>
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
  // Staff sessions count as signed out here (see requireCustomerPage).
  if (!session || !isCustomerSession(session)) return <LoginGate />;
  if (!session.user.emailVerified) return <VerifyEmailNotice />;
  redirect("/account/schedule");
}
