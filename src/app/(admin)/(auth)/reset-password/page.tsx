import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StripUrlQuery } from "@/components/shared/strip-url-query";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Set new password — TYS Global Logistics" };

// PUBLIC page — no guard. The token arrives as ?token=... from the reset email.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;

  if (typeof token !== "string" || token.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Reset link invalid</CardTitle>
          <CardDescription>
            This reset link is invalid or has expired. Request a new one to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <StripUrlQuery />
      <ResetPasswordForm token={token} />
    </>
  );
}
