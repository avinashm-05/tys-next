import {
  ScalesIcon,
  FileTextIcon,
  CarIcon,
  HouseIcon,
  AnchorIcon,
  ShoppingBagIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  icon: Icon;
};

// Card metadata for the /blog listing grid. Each post's own page.tsx is the
// source of truth for its actual content and <head> metadata — this array
// only drives the listing cards, same pattern as the /resources GUIDES
// array. Keep title/description here in sync with each post page.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "dimensional-weight-explained",
    title: "How Dimensional Weight Affects Your International Shipping Cost",
    description:
      "What dimensional (volumetric) weight is, how it's calculated, and how to pack smarter so you never overpay for empty space.",
    category: "Shipping Basics",
    date: "May 4, 2026",
    readTime: "6 min read",
    icon: ScalesIcon,
  },
  {
    slug: "international-shipping-documents-checklist",
    title: "International Shipping Documents Checklist for Smooth Customs Clearance",
    description:
      "The paperwork every international shipment needs, what each document does, and how to avoid the delays that come from missing one.",
    category: "Customs & Documentation",
    date: "April 27, 2026",
    readTime: "7 min read",
    icon: FileTextIcon,
  },
  {
    slug: "auto-transport-preparation-checklist",
    title: "How to Prepare Your Vehicle for Auto Transport: A Complete Checklist",
    description:
      "Everything to do the week before pickup, from cleaning and photographing your car to what belongs in the glove box and what doesn't.",
    category: "Auto Transport",
    date: "April 20, 2026",
    readTime: "6 min read",
    icon: CarIcon,
  },
  {
    slug: "international-relocation-guide",
    title: "Moving Abroad: A Step by Step Guide to International Relocation",
    description:
      "A practical timeline for planning an overseas move, from your first inventory list to settling into your new home.",
    category: "International Moving",
    date: "April 13, 2026",
    readTime: "8 min read",
    icon: HouseIcon,
  },
  {
    slug: "freight-forwarding-air-vs-ocean-vs-ground",
    title: "Freight Forwarding 101: Air vs Ocean vs Ground Shipping",
    description:
      "How to choose the right mode for your cargo based on budget, timeline, and shipment size, with real tradeoffs explained plainly.",
    category: "Freight Forwarding",
    date: "April 6, 2026",
    readTime: "7 min read",
    icon: AnchorIcon,
  },
  {
    slug: "ship-from-us-stores-worldwide-guide",
    title: "How to Shop US Stores and Ship Worldwide: The Global Shopper Guide",
    description:
      "How a free US mailing address lets shoppers anywhere in the world buy from American retailers and consolidate orders into one shipment.",
    category: "Global Shopper",
    date: "March 30, 2026",
    readTime: "6 min read",
    icon: ShoppingBagIcon,
  },
];
