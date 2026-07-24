import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password — TYS Global Logistics" };

// PUBLIC page — no guard.
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
