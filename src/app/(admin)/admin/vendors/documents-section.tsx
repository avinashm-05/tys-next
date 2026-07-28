"use client";

import { toast } from "sonner";
import { ClipboardTextIcon, PlusIcon, UploadIcon } from "@phosphor-icons/react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionIconBadge } from "@/components/admin/section-icon-badge";

// UI-first stub (matches the plan): vendor document storage needs cloud
// object storage credentials before it can go live — this renders the same
// layout the feature will use once that's wired, with upload disabled.
export function DocumentsSection({ vendorId: _vendorId }: { vendorId: number }) {
  const { data: session } = useSession();
  const today = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());
  const notConfigured = () =>
    toast.info("Document upload isn't wired up yet — cloud storage isn't configured.");

  return (
    <Card className="overflow-visible">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <SectionIconBadge icon={ClipboardTextIcon} />
          <h2 className="font-heading text-lg font-semibold">Documentation</h2>
        </div>
      </CardContent>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document name</TableHead>
              <TableHead>Created on</TableHead>
              <TableHead>Added by</TableHead>
              <TableHead>Attachment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Input placeholder="Enter document name…" disabled />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{today}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {session?.user?.name ?? "You"}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" disabled onClick={notConfigured}>
                  <UploadIcon size={14} />
                  Upload
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled
                  onClick={notConfigured}
                  aria-label="Add document"
                >
                  <PlusIcon size={16} />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                No documents yet.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-tys-mist px-4 py-2 text-xs text-muted-foreground">
          <span>Total rows: 0</span>
          <p>File upload needs cloud storage set up before it can go live.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
