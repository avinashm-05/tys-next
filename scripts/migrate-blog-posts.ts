/**
 * One-time migration: seeds the 6 hand-written blog posts (previously
 * src/lib/blog-posts.ts + one page.tsx per post) into the Post table.
 *
 * Idempotent by slug — safe to re-run; an existing slug is left alone
 * rather than duplicated.
 *
 * Run: npx tsx scripts/migrate-blog-posts.ts
 */
import "./env";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type SeedPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string; // matches the old BLOG_POSTS free-text date
  body: string;
};

const POSTS: SeedPost[] = [
  {
    slug: "dimensional-weight-explained",
    title: "How Dimensional Weight Affects Your International Shipping Cost",
    description:
      "Learn what dimensional (volumetric) weight is, how carriers calculate it, and how to pack smarter so a bulky box never costs you more than it should.",
    category: "Shipping Basics",
    date: "May 4, 2026",
    body: `
<h2>What Is Dimensional Weight?</h2>
<p>Every international shipment gets weighed twice. Once on a scale, for its actual weight, and once by a formula, for its dimensional weight. Dimensional weight (also called DIM weight or volumetric weight) estimates how much space a package takes up relative to how heavy it is. Carriers price by whichever number is greater, because a truck, ship, or plane has a limited amount of both weight capacity and physical space, and a large, light box uses up that space just as much as a small, heavy one.</p>
<p>If you’ve ever been surprised that a box full of pillows or packing peanuts cost more to ship than expected, dimensional weight is almost always the reason.</p>
<h2>How Dimensional Weight Is Calculated</h2>
<p>The formula is simple: multiply a package’s length by its width by its height, then divide by a carrier specific divisor.</p>
<ul>
<li><strong>Inches and pounds:</strong> Length × Width × Height ÷ 139</li>
<li><strong>Centimeters and kilograms:</strong> Length × Width × Height ÷ 5000</li>
</ul>
<p>The divisor represents an industry standard density assumption. Anything less dense than that assumption (in other words, anything bulkier for its weight) ends up with a dimensional weight that’s higher than its actual weight, and that’s the number you get billed for.</p>
<h2>Actual Weight vs Dimensional Weight: You Pay the Higher One</h2>
<p>This is the part that trips people up. You don’t pay actual weight, and you don’t pay dimensional weight. You pay whichever one is greater, a figure called chargeable weight. A dense item, like books or tools, will usually be billed at its actual weight, since its dimensional weight comes out lower. A bulky, light item, like a lampshade or a stuffed animal collection, will usually be billed at its dimensional weight instead.</p>
<h2>A Real Example</h2>
<p>Say you’re shipping a box measuring 20 × 16 × 14 inches, and it weighs 18 pounds on the scale. Here’s the math:</p>
<ul>
<li>Actual weight: 18 lb</li>
<li>Dimensional weight: (20 × 16 × 14) ÷ 139 = 4,480 ÷ 139 ≈ <strong>32.23 lb</strong></li>
</ul>
<p>Since 32.23 is greater than 18, this shipment is billed at roughly 32.23 lb, not the 18 lb it actually weighs. Cutting the box down to something closer to the item inside it, say 16 × 12 × 12 inches, brings the dimensional weight down to about 16.55 lb, putting it back under actual weight and lowering the bill.</p>
<h2>How to Pack Smarter and Keep Dimensional Weight Down</h2>
<ul>
<li><strong>Right size the box.</strong> Choose the smallest box your item and its padding can safely fit in, rather than reusing whatever box happens to be around.</li>
<li><strong>Use appropriate padding.</strong> Bubble wrap and packing paper protect an item without adding much volume. Loose fill peanuts, by contrast, often mean you’ve chosen a box that’s bigger than it needs to be.</li>
<li><strong>Consolidate multiple items.</strong> Combining several small items into one well fitted box usually beats shipping them separately in oversized ones.</li>
<li><strong>Flatten what you can.</strong> Furniture, luggage, and collapsible items should be broken down or folded before measuring, not measured in their bulkiest state.</li>
</ul>
<h2>How TYS Calculates It For You</h2>
<p>You don’t need to run this math by hand. When you enter your package dimensions in our <a href="/#get-quote">quote tool</a>, chargeable weight is calculated automatically and instantly, using the same 139 (inches and pounds) and 5,000 (centimeters and kilograms) divisors described above, so the rate you see already reflects whichever weight applies. For a deeper breakdown, see our full guide to <a href="/resources/volumetric-weight">volumetric weight</a>.</p>
<h2>Key Takeaways</h2>
<ul>
<li>Carriers bill by chargeable weight: the greater of actual or dimensional weight.</li>
<li>Dimensional weight = Length × Width × Height ÷ 139 (in/lb) or ÷ 5,000 (cm/kg).</li>
<li>Right sized boxes and minimal padding keep dimensional weight, and your cost, down.</li>
<li>Our quote tool calculates chargeable weight for you automatically.</li>
</ul>
`.trim(),
  },
  {
    slug: "international-shipping-documents-checklist",
    title: "International Shipping Documents Checklist for Smooth Customs Clearance",
    description:
      "The paperwork every international shipment needs, what each document actually does, and how to avoid the customs delays that come from missing one.",
    category: "Customs & Documentation",
    date: "April 27, 2026",
    body: `
<h2>Why Documentation Matters More Than People Expect</h2>
<p>Customs authorities don’t open every box that crosses a border. Instead, they rely on paperwork to tell them what’s inside, who it belongs to, what it’s worth, and why it’s being shipped. When that paperwork is incomplete or doesn’t match the shipment, the package gets held for review rather than cleared automatically, and that’s where most international shipping delays actually come from.</p>
<p>Getting your documents right the first time is almost always faster than trying to fix them after a shipment is already sitting in a customs warehouse.</p>
<h2>The Core Documents Every Shipment Needs</h2>
<ul>
<li><strong>Commercial invoice.</strong> A description of the goods, their declared value, the sender, and the recipient. Customs uses this to assess duties and taxes, so the description should be specific (“men’s cotton t shirts, 12 units”) rather than vague (“clothing”).</li>
<li><strong>Packing list.</strong> An itemized breakdown of what’s in each box, including quantities and weights. It doesn’t need to match the commercial invoice word for word, but the numbers should agree.</li>
<li><strong>Bill of lading or air waybill.</strong> The contract between you and the carrier, and the document that proves ownership and lets your shipment be tracked and released to the correct recipient.</li>
<li><strong>Certificate of origin.</strong> States which country the goods were made in. Some destination countries use this to apply reduced duty rates under trade agreements, so it’s worth including even when it isn’t strictly required.</li>
</ul>
<h2>Documents You May Also Need</h2>
<ul>
<li><strong>Export license.</strong> Required for certain regulated or restricted goods. Most personal and household shipments don’t need one, but check if you’re shipping anything technical, medical, or controlled.</li>
<li><strong>Insurance certificate.</strong> Proof of coverage, useful if you’ve insured a high value shipment and need to file a claim.</li>
<li><strong>Import permit.</strong> Some countries require a permit before certain goods, like food, plants, or electronics, are allowed to enter.</li>
<li><strong>Power of attorney.</strong> Authorizes a customs broker to clear a shipment on your behalf, common for commercial or high value freight.</li>
</ul>
<h2>Common Mistakes That Cause Delays</h2>
<ul>
<li>Declaring a value that seems too low for the described goods, which invites extra scrutiny rather than lower duties.</li>
<li>Using generic item descriptions instead of specific ones on the commercial invoice.</li>
<li>Mismatched information between the invoice, packing list, and shipping label.</li>
<li>Missing a signature or date on a document that requires one.</li>
<li>Not checking the destination country’s specific import requirements before the shipment leaves.</li>
</ul>
<h2>A Simple Pre Shipment Checklist</h2>
<ul>
<li>Commercial invoice prepared, signed, and matching the packing list</li>
<li>Packing list itemized with accurate quantities and weights</li>
<li>Certificate of origin included if applicable</li>
<li>Any required permits or licenses confirmed before booking</li>
<li>Recipient’s full name, address, and phone number double checked</li>
<li>Declared value reflects the goods’ actual, honest worth</li>
</ul>
<h2>How TYS Helps</h2>
<p>Our team reviews documentation as part of every international shipment we handle, so issues get caught before your package leaves, not after it’s already stuck at a border. If you’re shipping documents themselves internationally, our <a href="/services/document-shipping">document shipping service</a> is built specifically for time sensitive paperwork. For freight and commercial cargo, see our <a href="/services/freight-forwarding">freight forwarding</a> page, or <a href="/#get-quote">get a quote</a> and we’ll walk you through exactly what your shipment needs.</p>
`.trim(),
  },
  {
    slug: "auto-transport-preparation-checklist",
    title: "How to Prepare Your Vehicle for Auto Transport: A Complete Checklist",
    description:
      "A complete checklist for the week before your car is picked up for auto transport, covering cleaning, documentation, and what to remove first.",
    category: "Auto Transport",
    date: "April 20, 2026",
    body: `
<h2>Why Preparation Matters</h2>
<p>Auto transport is straightforward once a vehicle is loaded, but the pickup itself goes far more smoothly when the car is ready ahead of time. A clean vehicle is easier to inspect accurately, an empty gas tank keeps the trailer lighter and safer to load, and a vehicle free of loose items won’t have anything shifting or rattling during transit. None of this takes more than an hour, and it’s worth doing properly.</p>
<h2>One Week Before Pickup</h2>
<ul>
<li><strong>Confirm your pickup window and address</strong> with your transport provider, including any access restrictions at the location, like narrow streets or low clearance that a large carrier truck might not be able to reach.</li>
<li><strong>Gather your documents:</strong> registration, insurance, and a photo ID. You’ll need these at both pickup and delivery.</li>
<li><strong>Check your insurance coverage</strong> so you understand what’s covered during transport and what, if anything, the carrier’s policy adds on top of it.</li>
</ul>
<h2>The Day Before Pickup</h2>
<ul>
<li><strong>Wash the vehicle</strong>, inside and out. A clean car makes it much easier for both you and the driver to spot and document any existing scratches, dents, or paint chips during the pre transport inspection.</li>
<li><strong>Photograph the vehicle</strong> from all four sides, plus close ups of any existing damage, with a timestamp visible if your camera supports it. Keep these for your own records alongside the carrier’s inspection report.</li>
<li><strong>Remove all personal items.</strong> Most carriers don’t allow personal belongings inside the vehicle during transport, and anything left behind typically isn’t covered by insurance if it’s lost or damaged.</li>
<li><strong>Leave about a quarter tank of gas.</strong> Enough to load, unload, and drive the car short distances if needed, but not so much that it adds unnecessary weight.</li>
</ul>
<h2>Mechanical and Security Checks</h2>
<ul>
<li>Check tire pressure and top off fluids if anything looks low.</li>
<li>Secure or remove loose exterior parts, like antennas, spoilers, or bike racks, that could be damaged or damage another vehicle during loading.</li>
<li>Disable toll transponders and car alarms so they don’t trigger unexpectedly in transit.</li>
<li>Note any pre existing mechanical issues so the driver can plan for them.</li>
<li>Remove toll tags, parking passes, and garage door remotes if you won’t need them at the destination right away.</li>
</ul>
<h2>At Pickup: What to Expect</h2>
<p>The driver will walk around your vehicle with you and document its condition on a bill of lading, noting any existing damage. Read this carefully before signing, since it becomes the reference point for the delivery inspection. Keep a copy for yourself, and confirm the delivery contact information and rough timeline before the driver leaves.</p>
<h2>At Delivery</h2>
<p>Inspect the vehicle again against the same bill of lading before signing for it. Check it in daylight if at all possible, and don’t rush the walkaround even if the driver has another delivery waiting. Any new damage should be noted on the paperwork at the time of delivery, not reported afterward.</p>
<h2>How TYS Handles Auto Transport</h2>
<p>We coordinate pickup and delivery windows, provide a documented vehicle inspection at both ends, and combine auto transport with household or business relocations when you’re moving more than just a car. Learn more on our <a href="/services/auto-transport">auto transport</a> page, or <a href="/#get-quote">get a quote</a> for your vehicle today.</p>
`.trim(),
  },
  {
    slug: "international-relocation-guide",
    title: "Moving Abroad: A Step by Step Guide to International Relocation",
    description:
      "A practical timeline for planning an international move, from your first inventory list to settling into your new home, with what to do and when.",
    category: "International Moving",
    date: "April 13, 2026",
    body: `
<h2>Start With a Realistic Timeline</h2>
<p>An international move involves more moving parts than a domestic one: customs clearance, longer transit times, and often a visa or residency process running in parallel with the shipping itself. Most households find eight to twelve weeks is a comfortable planning window, though it can be compressed if needed. Working backward from your target move date, rather than forward from today, tends to keep things on track.</p>
<h2>Two to Three Months Before: Plan and Inventory</h2>
<ul>
<li><strong>Inventory your household.</strong> Walk through each room and note what you’re shipping, storing, selling, or donating. This becomes the basis for your moving quote, so the more accurate it is, the more accurate your estimate will be.</li>
<li><strong>Research destination country requirements.</strong> Some countries limit or restrict certain household items, require an inventory list for customs, or apply duty exemptions for goods that have been owned and used for a minimum period. Check these early, since they can affect what you decide to bring.</li>
<li><strong>Get moving quotes.</strong> Compare a few, and ask specifically what’s included, door to door service, insurance, and customs handling can vary significantly between providers.</li>
</ul>
<h2>Four to Six Weeks Before: Sort and Prepare</h2>
<ul>
<li><strong>Decide what’s worth shipping.</strong> International shipping is priced by weight and volume, so it’s often cheaper to sell or donate bulky, low value items and replace them at your destination rather than ship them.</li>
<li><strong>Gather required documents.</strong> Passport, visa or residency permit, proof of address at both ends, and any inventory forms your destination country requires for customs.</li>
<li><strong>Handle vehicles separately if you’re bringing one.</strong> Auto transport and shipping have their own timelines and paperwork, so start that process alongside your household move rather than after it.</li>
<li><strong>Notify relevant parties</strong>: banks, subscriptions, schools, and employers, of your upcoming move and new address.</li>
</ul>
<h2>Two to Three Weeks Before: Pack</h2>
<ul>
<li><strong>Pack by room, and label clearly</strong> with both contents and the room they belong in at the destination, which makes unpacking far faster.</li>
<li><strong>Set aside an essentials bag</strong> with a change of clothes, medications, chargers, and important documents to travel with you rather than in the shipment, in case of delays.</li>
<li><strong>Confirm final pickup details</strong> with your moving company, including access at your current address for loading.</li>
</ul>
<h2>During Transit</h2>
<p>Ocean freight for household goods commonly takes several weeks depending on the route, while air shipments arrive much faster but cost more for the same volume. Your moving company should give you a tracking reference and an estimated delivery window. Use this time to finalize housing, utilities, and any remaining paperwork at your destination so you’re ready to receive your shipment as soon as it clears customs.</p>
<h2>At Delivery</h2>
<ul>
<li>Check your inventory list against what arrives, and note any discrepancies immediately.</li>
<li>Inspect items for damage before signing off, and photograph anything that looks off.</li>
<li>Keep all paperwork until you’re confident everything has arrived and checked out.</li>
</ul>
<h2>How TYS Supports International Moves</h2>
<p>We handle household relocation, vehicle shipping, and the customs paperwork that connects them, so you’re coordinating with one team instead of several. See our <a href="/services/international-relocation">international relocation</a> page for what’s included, or <a href="/#get-quote">get a quote</a> to start planning your move.</p>
`.trim(),
  },
  {
    slug: "freight-forwarding-air-vs-ocean-vs-ground",
    title: "Freight Forwarding 101: Air vs Ocean vs Ground Shipping",
    description:
      "How to choose between air, ocean, and ground freight based on your budget, timeline, and cargo, with the real tradeoffs explained plainly.",
    category: "Freight Forwarding",
    date: "April 6, 2026",
    body: `
<h2>What Freight Forwarding Actually Means</h2>
<p>A freight forwarder doesn’t own the ships, planes, or trucks that carry your cargo. Instead, we arrange and manage the full route on your behalf, choosing carriers, handling documentation, and coordinating the handoffs between them, so a shipment moving from a warehouse to a port to a ship to another port to a final delivery truck is one managed process instead of five separate bookings you have to track yourself.</p>
<h2>Air Freight: Fastest, and Priced Accordingly</h2>
<p>Air freight is the quickest way to move cargo internationally, often measured in days rather than weeks. That speed comes at a cost though, air freight is typically the most expensive option per unit of weight, and it’s priced heavily on dimensional weight, so bulky, low density cargo gets expensive fast.</p>
<p><strong>Best for:</strong> time sensitive shipments, high value or perishable goods, and smaller cargo volumes where the cost difference against ocean freight is smaller in absolute terms.</p>
<h2>Ocean Freight: Best Value for Large Volume</h2>
<p>Ocean freight moves the vast majority of the world’s cargo by volume, and for good reason: it’s by far the most cost effective way to ship large or heavy shipments internationally. The tradeoff is transit time, ocean shipments commonly take several weeks depending on the route, plus time for loading, customs clearance, and final delivery on each end.</p>
<p>Ocean freight is typically booked as either a full container load (FCL), where your cargo fills an entire container, or a less than container load (LCL), where your cargo shares a container with other shipments. FCL usually makes sense once your volume is large enough to fill most of a container; LCL is often cheaper for smaller shipments that don’t need a full one.</p>
<p><strong>Best for:</strong> large volume shipments, non urgent cargo, and situations where cost per unit matters more than speed.</p>
<h2>Ground Freight: Flexible for Regional Moves</h2>
<p>Ground freight, by truck or rail, is the standard for domestic and cross border moves within a continent. It’s generally faster than ocean freight and cheaper than air freight for shorter distances, and it offers real flexibility since a truck can deliver directly to a door rather than requiring a port or airport handoff on each end.</p>
<p><strong>Best for:</strong> domestic and regional shipments, cargo that needs door to door delivery without an ocean or air leg, and moves where flexibility matters more than raw speed.</p>
<h2>How to Choose</h2>
<ul>
<li><strong>Ask what your real deadline is.</strong> If your cargo needs to arrive within a few days, air freight is often the only mode that fits, regardless of cost.</li>
<li><strong>Check your shipment’s size and weight.</strong> Small, urgent shipments favor air. Large, heavy shipments favor ocean. Regional shipments usually favor ground.</li>
<li><strong>Consider a combined approach.</strong> Many international shipments use more than one mode, ocean freight across the water, then ground freight for final delivery, for example. A good freight forwarder plans this as one route, not separate bookings.</li>
<li><strong>Factor in total cost, not just freight cost.</strong> Customs clearance, insurance, and final delivery all add to the real total, and they vary by mode.</li>
</ul>
<h2>How TYS Plans Your Route</h2>
<p>We compare air, ocean, and ground options for your specific cargo, factoring in timeline, budget, and destination, and handle the customs and documentation for every leg of the route. Visit our <a href="/services/freight-forwarding">freight forwarding</a> page to see what’s included, or <a href="/#get-quote">get a quote</a> for your shipment.</p>
`.trim(),
  },
  {
    slug: "ship-from-us-stores-worldwide-guide",
    title: "How to Shop US Stores and Ship Worldwide: The Global Shopper Guide",
    description:
      "How a free US mailing address lets shoppers anywhere in the world buy from American retailers and consolidate orders into one international shipment.",
    category: "Global Shopper",
    date: "March 30, 2026",
    body: `
<h2>The Problem: US Retailers Rarely Ship Overseas</h2>
<p>A huge share of American retailers, from major department stores to small specialty brands, only ship within the United States. If you live outside the US, that limits you to whatever international retailers happen to exist locally, even when the item you want is easy to find and reasonably priced on a US site. A package forwarding service, often called a global shopper program, closes that gap.</p>
<h2>How It Works</h2>
<ul>
<li><strong>Sign up and get a free US address.</strong> This is a real US shipping address tied to your account, and it’s what you use as the delivery address when you shop online.</li>
<li><strong>Shop any US store that ships domestically.</strong> Since your US address is just another domestic delivery address to the retailer, there’s no special checkout process or international shipping fee to navigate on their end.</li>
<li><strong>Your packages arrive at the facility and get logged.</strong> You’ll typically get a notification with photos so you can confirm each package before it ships onward.</li>
<li><strong>Consolidate multiple orders into one shipment.</strong> Rather than paying international shipping on every individual order, you can combine several packages into a single outbound shipment, which usually costs significantly less than shipping each one separately.</li>
<li><strong>Choose your shipping method and ship worldwide.</strong> Pick the speed and price point that fits your needs, and your consolidated package ships to your home address internationally.</li>
</ul>
<h2>Why Consolidation Is the Real Advantage</h2>
<p>International shipping is priced by weight and dimensional weight, and every individual shipment carries its own base handling cost regardless of size. Five small packages shipped separately each pay that base cost on top of their own weight. Combined into one shipment, you pay it once. For anyone ordering regularly from multiple US retailers, this is usually where the real savings come from, not any single order.</p>
<h2>What to Check Before You Ship</h2>
<ul>
<li><strong>Your destination country’s import rules.</strong> Duty free thresholds and restricted item lists vary by country, so it’s worth knowing these before ordering something expensive or unusual.</li>
<li><strong>Package weight and dimensions.</strong> Since chargeable weight is based on whichever is greater, actual or dimensional, checking this before you finalize a shipment helps you estimate cost accurately.</li>
<li><strong>Whether items can be combined safely.</strong> Fragile or oddly shaped items sometimes ship better on their own rather than consolidated with heavier packages.</li>
</ul>
<h2>Who Uses a Global Shopper Service</h2>
<p>Shoppers buying clothing, electronics, specialty foods, collectibles, or anything else that’s easy to find in the US but hard to find locally. It’s also common among people who’ve previously lived in the US and want continued access to specific brands, and small resellers sourcing US inventory for markets where those products aren’t otherwise available.</p>
<h2>How TYS Global Shopper Works</h2>
<p>Sign up for a free US address, shop as many US retailers as you like, and let us consolidate and ship your orders anywhere in the world. See our <a href="/services/global-shopper">Global Shopper</a> page for full details, or <a href="/services/global-shopper">sign up and get your free US address</a> today.</p>
`.trim(),
  },
];

async function main() {
  for (const post of POSTS) {
    const existing = await db.post.findUnique({ where: { slug: post.slug } });
    if (existing) {
      console.log(`SKIP  ${post.slug} (already exists, id ${Number(existing.id)})`);
      continue;
    }
    const publishedAt = new Date(post.date);
    const created = await db.post.create({
      data: {
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        body: post.body,
        authorName: "Avinash",
        status: "published",
        publishedAt,
        createdAt: publishedAt,
        updatedAt: publishedAt,
      },
    });
    console.log(`SEEDED ${post.slug} -> id ${Number(created.id)}`);
  }
  await db.$disconnect();
}

main();
