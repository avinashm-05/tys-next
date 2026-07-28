// Re-exports the shared pill-tab styling — kept here so the existing import
// path doesn't need touching. The implementation moved to
// src/components/admin/detail-tabs.tsx once Shipment needed the same tabs.
export {
  DetailTabs as VendorDetailTabs,
  DetailTabsContent as VendorDetailTabsContent,
  DetailTabsList as VendorDetailTabsList,
  DetailTabsTrigger as VendorDetailTabsTrigger,
} from "@/components/admin/detail-tabs";
