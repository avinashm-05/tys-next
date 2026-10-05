import type { Metadata } from "next";
import Link from "next/link";
import { ListChecksIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { requireAdminPage } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MapClient } from "./map-client";

export const metadata: Metadata = { title: "Vendor map — TYS Global Logistics" };

export default async function VendorMapPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#ebf2ff] text-tys-blue">
            <StorefrontIcon size={22} weight="bold" />
          </div>
          <h1 className="text-h2">Vendor map</h1>
        </div>
        <Button asChild className="border border-input bg-background text-foreground shadow-none hover:bg-muted">
          <Link href="/admin/vendors">
            <ListChecksIcon size={16} weight="bold" />
            List view
          </Link>
        </Button>
      </div>
      <MapClient />
    </div>
  );
}
