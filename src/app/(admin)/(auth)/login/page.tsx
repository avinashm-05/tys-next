import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in — TYS Global Logistics" };

// PUBLIC page (proxy.ts routes it on the admin host) — no guard.
export default function LoginPage() {
  return <LoginForm />;
}
