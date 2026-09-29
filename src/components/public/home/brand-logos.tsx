import {
  siAdidas,
  siApple,
  siDhl,
  siEbay,
  siFedex,
  siNike,
  siSamsung,
  siSony,
  siThenorthface,
  siTarget,
  siUps,
  siUsps,
  type SimpleIcon,
} from "simple-icons";

// Official brand marks from Simple Icons (CC0 package; the marks themselves
// remain their owners' trademarks, used here only to name stores and
// carriers). Rendered as inline SVG so they're crisp, tiny and recolourable:
// monochrome ink at rest, the brand's own colour on hover.
//
// Amazon and Walmart were removed from Simple Icons at the brands' request,
// so they come from Wikimedia Commons instead (see STORES below).

export const CARRIERS: SimpleIcon[] = [siFedex, siDhl, siUps, siUsps];

type Store = { name: string; icon?: SimpleIcon; src?: string; brandHex?: string };

export const STORES: Store[] = [
  {
    name: "Amazon",
    // From Wikimedia Commons (Amazon_logo.svg), self-hosted 2026-09-29.
    src: "/frontend/images/brand-logos-svg/amazon.svg",
    brandHex: "FF9900",
  },
  {
    name: "Walmart",
    // From Wikimedia Commons (Walmart_logo_(2008).svg), self-hosted 2026-09-29.
    src: "/frontend/images/brand-logos-svg/walmart.svg",
    brandHex: "0071CE",
  },
  { name: "Apple", icon: siApple },
  { name: "Target", icon: siTarget },
  { name: "eBay", icon: siEbay },
  { name: "Nike", icon: siNike },
  { name: "Samsung", icon: siSamsung },
  { name: "Sony", icon: siSony },
  { name: "Adidas", icon: siAdidas },
  { name: "The North Face", icon: siThenorthface },
];

export { BrandMark } from "./brand-mark";
