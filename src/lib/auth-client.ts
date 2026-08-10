"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

// Client for the Phase A login/logout/reset UI. Same-origin (admin host),
// so no baseURL needed. usernameClient mirrors the server's username()
// plugin — it's what puts signIn.username() on this client.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), usernameClient()],
});

export const { signIn, signOut, useSession } = authClient;
