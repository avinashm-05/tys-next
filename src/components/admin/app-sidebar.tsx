"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalculatorIcon,
  FileTextIcon,
  PackageIcon,
  SlidersHorizontalIcon,
  SquaresFourIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// Full nav per migration/07-frontend.md. Unbuilt sections resolve to the
// shared [...unbuilt] placeholder page until their phase ships.
const ITEMS = [
  { title: "Dashboard", href: "/admin", icon: SquaresFourIcon },
  { title: "Quotes", href: "/admin/quotes", icon: FileTextIcon },
  { title: "Price Check", href: "/admin/price-check", icon: CalculatorIcon },
  { title: "Services", href: "/admin/services", icon: PackageIcon },
] as const;

const VENDOR_ITEMS = [
  { title: "List", href: "/admin/vendors" },
  { title: "Map", href: "/admin/vendors/map" },
  { title: "Types", href: "/admin/vendor-types" },
] as const;

const SETTINGS_ITEMS = [{ title: "FedEx Markup", href: "/admin/settings" }] as const;

// Active nav item is the one orange element per view (docs/design.md).
const ACTIVE =
  "data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground";

export function AppSidebar() {
  const pathname = usePathname();
  // Exact for the dashboard; prefix for sections — longest match wins so
  // /admin/vendors/map lights "Map", not "List".
  const allHrefs = [...ITEMS, ...VENDOR_ITEMS, ...SETTINGS_ITEMS].map((i) => i.href);
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (pathname !== href && !pathname.startsWith(href + "/")) return false;
    return !allHrefs.some(
      (other) => other.length > href.length && pathname.startsWith(other),
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <Link href="/admin" className="text-sm font-semibold text-sidebar-primary-foreground">
          TYS Global Logistics
          <span className="block text-xs font-normal text-sidebar-foreground/70">Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} className={ACTIVE}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={ACTIVE}>
                  <Link href="/admin/vendors">
                    <TruckIcon />
                    <span>Vendors</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {VENDOR_ITEMS.map((item) => (
                    <SidebarMenuSubItem key={item.href}>
                      <SidebarMenuSubButton asChild isActive={isActive(item.href)} className={ACTIVE}>
                        <Link href={item.href}>{item.title}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={ACTIVE}>
                  <Link href="/admin/settings">
                    <SlidersHorizontalIcon />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {SETTINGS_ITEMS.map((item) => (
                    <SidebarMenuSubItem key={item.href}>
                      <SidebarMenuSubButton asChild isActive={isActive(item.href)} className={ACTIVE}>
                        <Link href={item.href}>{item.title}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
