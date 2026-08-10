import {
  AnchorIcon,
  ArticleIcon,
  CarIcon,
  FileTextIcon,
  HouseIcon,
  ScalesIcon,
  ShoppingBagIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

/**
 * Category -> decorative icon, used by BlogBanner on both the listing card
 * and the post page. `category` on Post is a plain string, not an enum
 * (see the migration commit) — this lookup is what keeps the existing 1:1
 * category/icon pairing without needing a per-post icon column or a
 * migration every time a new category shows up. Anything not in this map
 * (a category an admin typed fresh) falls back to a generic article icon
 * rather than erroring.
 */
export const BLOG_CATEGORY_ICONS: Record<string, Icon> = {
  "Shipping Basics": ScalesIcon,
  "Customs & Documentation": FileTextIcon,
  "Auto Transport": CarIcon,
  "International Moving": HouseIcon,
  "Freight Forwarding": AnchorIcon,
  "Global Shopper": ShoppingBagIcon,
};

export const BLOG_CATEGORY_FALLBACK_ICON: Icon = ArticleIcon;

export function blogCategoryIcon(category: string): Icon {
  return BLOG_CATEGORY_ICONS[category] ?? BLOG_CATEGORY_FALLBACK_ICON;
}

/** Known categories, offered as suggestions in the admin editor's category
 * field — a plain <datalist>, not a hard constraint, so a new category can
 * still be typed freely. */
export const BLOG_CATEGORY_SUGGESTIONS = Object.keys(BLOG_CATEGORY_ICONS);
