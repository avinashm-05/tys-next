"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient, inferAdditionalFields, twoFactorClient, usernameClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

// Client for the Phase A login/logout/reset UI. Same-origin (admin host),
// so no baseURL needed. usernameClient mirrors the server's username()
// plugin — it's what puts signIn.username() on this client.
export const authClient = createAuthClient({
  // twoFactorClient: no onTwoFactorRedirect; the login form reads
  // `twoFactorRedirect` from the sign-in result and shows its code step.
  plugins: [inferAdditionalFields<typeof auth>(), usernameClient(), twoFactorClient(), emailOTPClient()],
});

export const { signIn, signOut, useSession } = authClient;
