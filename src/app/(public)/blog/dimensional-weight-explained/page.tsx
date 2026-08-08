import type { Metadata } from "next";
import Link from "next/link";
import { BlogPostHero } from "@/components/public/blog-post-hero";
import { BlogBanner } from "@/components/public/blog-banner";
import { LegalSection } from "@/components/public/legal-section";
import { ArticleJsonLd } from "@/components/public/article-json-ld";
import { ScalesIcon } from "@phosphor-icons/react/dist/ssr";

const DESCRIPTION =
  "Learn what dimensional (volumetric) weight is, how carriers calculate it, and how to pack smarter so a bulky box never costs you more than it should.";

export const metadata: Metadata = {
  title: "Dimensional Weight Explained: How It Affects Shipping Cost — TYS Blog",
  description: DESCRIPTION,
};

export default function DimensionalWeightPostPage() {
  return (
    <>
      <ArticleJsonLd
        headline="How Dimensional Weight Affects Your International Shipping Cost"
        description={DESCRIPTION}
        datePublished="May 4, 2026"
        slug="dimensional-weight-explained"
      />
      <BlogPostHero
        category="Shipping Basics"
        title="How Dimensional Weight Affects Your International Shipping Cost"
        subtitle="Why a light, bulky box can sometimes cost more to ship than a small, heavy one, and how to avoid paying for space you don't need."
        date="May 4, 2026"
        readTime="6 min read"
      />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <BlogBanner icon={ScalesIcon} className="mb-8 h-48 w-full md:h-56" />

          <LegalSection title="What Is Dimensional Weight?">
            <p>
              Every international shipment gets weighed twice. Once on a scale, for its
              actual weight, and once by a formula, for its dimensional weight.
              Dimensional weight (also called DIM weight or volumetric weight) estimates
              how much space a package takes up relative to how heavy it is. Carriers
              price by whichever number is greater, because a truck, ship, or plane has a
              limited amount of both weight capacity and physical space, and a large,
              light box uses up that space just as much as a small, heavy one.
            </p>
            <p>
              If you&rsquo;ve ever been surprised that a box full of pillows or packing
              peanuts cost more to ship than expected, dimensional weight is almost always
              the reason.
            </p>
          </LegalSection>

          <LegalSection title="How Dimensional Weight Is Calculated">
            <p>
              The formula is simple: multiply a package&rsquo;s length by its width by its
              height, then divide by a carrier specific divisor.
            </p>
            <ul>
              <li>
                <strong>Inches and pounds:</strong> Length × Width × Height ÷ 139
              </li>
              <li>
                <strong>Centimeters and kilograms:</strong> Length × Width × Height ÷ 5000
              </li>
            </ul>
            <p>
              The divisor represents an industry standard density assumption. Anything
              less dense than that assumption (in other words, anything bulkier for its
              weight) ends up with a dimensional weight that&rsquo;s higher than its
              actual weight, and that&rsquo;s the number you get billed for.
            </p>
          </LegalSection>

          <LegalSection title="Actual Weight vs Dimensional Weight: You Pay the Higher One">
            <p>
              This is the part that trips people up. You don&rsquo;t pay actual weight,
              and you don&rsquo;t pay dimensional weight. You pay whichever one is
              greater, a figure called chargeable weight. A dense item, like books or
              tools, will usually be billed at its actual weight, since its dimensional
              weight comes out lower. A bulky, light item, like a lampshade or a stuffed
              animal collection, will usually be billed at its dimensional weight instead.
            </p>
          </LegalSection>

          <LegalSection title="A Real Example">
            <p>
              Say you&rsquo;re shipping a box measuring 20 × 16 × 14 inches, and it weighs
              18 pounds on the scale. Here&rsquo;s the math:
            </p>
            <ul>
              <li>Actual weight: 18 lb</li>
              <li>
                Dimensional weight: (20 × 16 × 14) ÷ 139 = 4,480 ÷ 139 ≈{" "}
                <strong>32.23 lb</strong>
              </li>
            </ul>
            <p>
              Since 32.23 is greater than 18, this shipment is billed at roughly 32.23 lb,
              not the 18 lb it actually weighs. Cutting the box down to something closer
              to the item inside it, say 16 × 12 × 12 inches, brings the dimensional
              weight down to about 16.55 lb, putting it back under actual weight and
              lowering the bill.
            </p>
          </LegalSection>

          <LegalSection title="How to Pack Smarter and Keep Dimensional Weight Down">
            <ul>
              <li>
                <strong>Right size the box.</strong> Choose the smallest box your item and
                its padding can safely fit in, rather than reusing whatever box happens to
                be around.
              </li>
              <li>
                <strong>Use appropriate padding.</strong> Bubble wrap and packing paper
                protect an item without adding much volume. Loose fill peanuts, by
                contrast, often mean you&rsquo;ve chosen a box that&rsquo;s bigger than it
                needs to be.
              </li>
              <li>
                <strong>Consolidate multiple items.</strong> Combining several small items
                into one well fitted box usually beats shipping them separately in
                oversized ones.
              </li>
              <li>
                <strong>Flatten what you can.</strong> Furniture, luggage, and collapsible
                items should be broken down or folded before measuring, not measured in
                their bulkiest state.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="How TYS Calculates It For You">
            <p>
              You don&rsquo;t need to run this math by hand. When you enter your package
              dimensions in our <Link href="/#get-quote">quote tool</Link>, chargeable
              weight is calculated automatically and instantly, using the same 139 (inches
              and pounds) and 5,000 (centimeters and kilograms) divisors described above,
              so the rate you see already reflects whichever weight applies. For a deeper
              breakdown, see our full guide to{" "}
              <Link href="/resources/volumetric-weight">volumetric weight</Link>.
            </p>
          </LegalSection>

          <LegalSection title="Key Takeaways">
            <ul>
              <li>
                Carriers bill by chargeable weight: the greater of actual or dimensional
                weight.
              </li>
              <li>
                Dimensional weight = Length × Width × Height ÷ 139 (in/lb) or ÷ 5,000
                (cm/kg).
              </li>
              <li>
                Right sized boxes and minimal padding keep dimensional weight, and your
                cost, down.
              </li>
              <li>Our quote tool calculates chargeable weight for you automatically.</li>
            </ul>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
