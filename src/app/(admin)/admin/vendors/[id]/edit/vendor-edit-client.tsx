"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  VendorDetailTabs,
  VendorDetailTabsContent,
  VendorDetailTabsList,
  VendorDetailTabsTrigger,
} from "../../vendor-detail-tabs";
import {
  VendorForm,
  VendorFormFooter,
  type VendorFormValues,
  type VendorTypeOption,
} from "../../vendor-form";
import { ContactsSection } from "../../contacts-section";
import { CommentsSection } from "../../comments-section";
import { ServicesSection } from "../../services-section";
import { DocumentsSection } from "../../documents-section";

/**
 * Client wrapper so the Save/Cancel footer can live after the tabs (sticky
 * through Contact details/Service offered/Comments/Documents scrolling)
 * while still submitting VendorForm's <form> by id, and so isSubmitting can
 * be shared between the form and the footer button.
 */
export function VendorEditClient({
  vendorId,
  vendor,
  typeOptions,
}: {
  vendorId: number;
  vendor: VendorFormValues;
  typeOptions: VendorTypeOption[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState("contacts");
  // Switching tabs shouldn't jump the page back to the top — restore the
  // exact scroll position synchronously before the browser paints, whatever
  // the actual cause of the jump (content height change, focus handling).
  const pendingScrollY = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pendingScrollY.current !== null) {
      window.scrollTo(0, pendingScrollY.current);
      pendingScrollY.current = null;
    }
  }, [tab]);

  return (
    <div className="flex flex-col gap-8">
      <VendorForm typeOptions={typeOptions} vendor={vendor} onSubmittingChange={setIsSubmitting} />
      <VendorDetailTabs
        value={tab}
        onValueChange={(value) => {
          pendingScrollY.current = window.scrollY;
          setTab(value);
        }}
      >
        <VendorDetailTabsList>
          <VendorDetailTabsTrigger value="contacts">Contact details</VendorDetailTabsTrigger>
          <VendorDetailTabsTrigger value="services">Service offered</VendorDetailTabsTrigger>
          <VendorDetailTabsTrigger value="comments">Comments</VendorDetailTabsTrigger>
          <VendorDetailTabsTrigger value="documents">Documents</VendorDetailTabsTrigger>
        </VendorDetailTabsList>
        <VendorDetailTabsContent value="contacts" className="pt-8">
          <ContactsSection vendorId={vendorId} />
        </VendorDetailTabsContent>
        <VendorDetailTabsContent value="services" className="pt-8">
          <ServicesSection vendorId={vendorId} />
        </VendorDetailTabsContent>
        <VendorDetailTabsContent value="comments" className="pt-8">
          <CommentsSection vendorId={vendorId} />
        </VendorDetailTabsContent>
        <VendorDetailTabsContent value="documents" className="pt-8">
          <DocumentsSection vendorId={vendorId} />
        </VendorDetailTabsContent>
      </VendorDetailTabs>
      <VendorFormFooter editing isSubmitting={isSubmitting} />
    </div>
  );
}
