"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/admin/theme-toggle";

const ROLE_LABELS: Record<string, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

// Moved out of AdminHeader so the top bar stays free of clutter — theme and
// sign-out live at the bottom of the sidebar instead, collapsing to just the
// avatar (with the same menu behind it) when the sidebar is icon-only.
export function SidebarProfile({
  user,
}: {
  user: { name: string; email: string; role: string | null };
}) {
  async function handleSignOut() {
    await authClient.signOut();
    window.location.assign("/login");
  }

  return (
    <SidebarFooter className="pb-4">
      <div className="flex items-center justify-center gap-1">
        <ThemeToggle />
      </div>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="gap-2.5 rounded-xl">
                <Avatar className="size-7">
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-[11px] text-sidebar-foreground/60">{user.email}</span>
                </div>
                <SignOutIcon aria-hidden className="ml-auto size-4 shrink-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="min-w-56">
              <DropdownMenuLabel className="font-normal">
                <span className="block font-medium">{user.name}</span>
                <span className="block text-xs text-muted-foreground">{user.email}</span>
                {user.role && (
                  <span className="block text-xs text-muted-foreground">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut}>
                <SignOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
