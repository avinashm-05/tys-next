"use client";

import type { Icon } from "@phosphor-icons/react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  ClockCounterClockwiseIcon,
  CurrencyDollarIcon,
  FileTextIcon,
  MapPinLineIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  ShippingContainerIcon,
  SlidersHorizontalIcon,
  SpinnerIcon,
  SquaresFourIcon,
  TruckIcon,
  UsersIcon,
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
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarProfile } from "@/components/admin/sidebar-profile";

// Full nav per migration/07-frontend.md. Unbuilt sections resolve to the
// shared [...unbuilt] placeholder page until their phase ships.
const ITEMS = [
  { title: "Dashboard", href: "/admin", icon: SquaresFourIcon },
  { title: "Quotes", href: "/admin/quotes", icon: FileTextIcon },
  { title: "Customers", href: "/admin/customers", icon: UsersIcon },
  { title: "Get Rates", href: "/admin/price-check", icon: CurrencyDollarIcon },
  { title: "Shipments", href: "/admin/shipments", icon: ShippingContainerIcon },
  { title: "Tracking", href: "/admin/tracking", icon: MapPinLineIcon },
  // Flat, not nested under Vendors-style sub-items — this resource has no
  // separate sub-view (no map/settings-equivalent), just the one list.
  { title: "Blog", href: "/admin/blog", icon: NewspaperIcon },
  { title: "Activity", href: "/admin/activity", icon: ClockCounterClockwiseIcon },
] as const;

// Owner only (2026-09-30): add/remove staff, roles, 2-step resets. Hidden
// for admins; the page and its API 403 them regardless.
const STAFF_ITEM = { title: "Staff", href: "/admin/staff", icon: ShieldCheckIcon } as const;

// Services and Vendor Types no longer have standalone management pages —
// both are creatable inline from the fields that use them (vendor type field,
// service offered tab), so there's nothing left to browse/edit separately.
const VENDOR_ITEMS = [
  { title: "List", href: "/admin/vendors" },
  { title: "Map", href: "/admin/vendors/map" },
] as const;

const SETTINGS_ITEMS = [{ title: "FedEx Markup", href: "/admin/settings" }] as const;

// Active nav item is the one orange element per view (docs/design.md).
// rounded-xl overrides the sidebar primitive's default rounded-none — every
// other control in the admin (buttons, cards, badges) is soft-cornered, so a
// sharp-edged nav read as visually inconsistent.
// 2026-10-05: portal-style nav (light-blue pill + blue text when active).
const ACTIVE =
  "h-9 rounded-lg text-[14px] font-medium text-sidebar-foreground [&>svg]:text-muted-foreground hover:bg-muted hover:text-foreground data-active:bg-sidebar-accent data-active:font-semibold data-active:text-sidebar-accent-foreground data-active:[&>svg]:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent data-active:hover:text-sidebar-accent-foreground";

/**
 * The nav item's own icon, swapped for a spinner while its navigation is in
 * flight. useLinkStatus reports the pending state of the enclosing <Link>,
 * so this has to render *inside* one.
 *
 * Pairs with admin/loading.tsx: the fallback says "a page is coming", this
 * says *which* item you actually hit. Swapping the glyph in place (rather
 * than adding a spinner beside it) keeps the icon rail from reflowing, which
 * matters most in the collapsed state where the icon is the whole control.
 */
function NavIcon({ icon: IconComp }: { icon: Icon }) {
  const { pending } = useLinkStatus();
  return pending ? <SpinnerIcon className="animate-spin" /> : <IconComp />;
}

/** Sub-links are text-only, so their pending hint trails the label. */
function NavSubSpinner() {
  const { pending } = useLinkStatus();
  return pending ? <SpinnerIcon className="ml-auto size-3.5 animate-spin" /> : null;
}

/**
 * A nav item with sub-links (Vendors, Settings). The icon always navigates
 * straight to `href` (its default/first sub-item) — collapsed or expanded —
 * same as every other nav item; it never requires an extra picker step.
 * Sub-links show inline when expanded; the sidebar primitive hides
 * SidebarMenuSub by itself once collapsed to icon-rail width.
 */
function SidebarNavGroup({
  title,
  href,
  icon: IconComp,
  items,
  isSectionActive,
  isActive,
}: {
  title: string;
  href: string;
  icon: Icon;
  items: readonly { title: string; href: string }[];
  isSectionActive: boolean;
  isActive: (href: string) => boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isSectionActive} tooltip={title} className={ACTIVE}>
        <Link href={href}>
          <NavIcon icon={IconComp} />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuSub>
        {items.map((item) => (
          <SidebarMenuSubItem key={item.href}>
            <SidebarMenuSubButton asChild isActive={isActive(item.href)} className={ACTIVE}>
              <Link href={item.href}>
                {item.title}
                <NavSubSpinner />
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ))}
      </SidebarMenuSub>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  user,
}: {
  user: { name: string; email: string; role: string | null };
}) {
  const pathname = usePathname();
  // Exact for the dashboard; prefix for sections — longest match wins so
  // /admin/vendors/map lights "Map", not "List".
  const items = user.role === "super-admin" ? [...ITEMS, STAFF_ITEM] : [...ITEMS];
  const allHrefs = [...items, ...VENDOR_ITEMS, ...SETTINGS_ITEMS].map((i) => i.href);
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (pathname !== href && !pathname.startsWith(href + "/")) return false;
    return !allHrefs.some(
      (other) => other.length > href.length && pathname.startsWith(other),
    );
  };
  // Broader match for a group's own row (Vendors/Settings): true anywhere
  // under that section, unlike isActive's single-most-specific-item rule.
  const isSection = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="px-4 py-3 group-data-[collapsible=icon]:px-2">
        {/* min-h keeps this row's own height constant across collapse — the
            label disappearing (`hidden`, not animatable) would otherwise
            shrink the header and visibly jolt the nav list below it. Trigger
            stays first/fixed in place rather than re-centering, so it isn't
            the thing that visibly jumps either. */}
        <div className="flex min-h-9 items-center gap-2">
          <SidebarTrigger className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground" />
          <Link href="/admin" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden" aria-label="TYS admin home">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, same as the site header */}
            <img src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png" alt="TYS Global Logistics" width={480} height={177} className="h-7 w-auto dark:hidden" draggable={false} />
            {/* eslint-disable-next-line @next/next/no-img-element -- dark-mode logo */}
            <img src="/frontend/logo/TYS_GLOBAL_LOGISTICS_White.png" alt="" width={480} height={177} className="hidden h-7 w-auto dark:block" draggable={false} />
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">Admin</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className={ACTIVE}
                  >
                    <Link href={item.href}>
                      <NavIcon icon={item.icon} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarNavGroup
                title="Vendors"
                href="/admin/vendors"
                icon={TruckIcon}
                items={VENDOR_ITEMS}
                isSectionActive={isSection("/admin/vendors")}
                isActive={isActive}
              />
              <SidebarNavGroup
                title="Settings"
                href="/admin/settings"
                icon={SlidersHorizontalIcon}
                items={SETTINGS_ITEMS}
                isSectionActive={isSection("/admin/settings")}
                isActive={isActive}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarProfile user={user} />
      <SidebarRail />
    </Sidebar>
  );
}
