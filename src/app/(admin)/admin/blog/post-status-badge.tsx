import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type PostStatus = "draft" | "published";

const LABELS: Record<PostStatus, string> = { draft: "Draft", published: "Published" };
const DOT: Record<PostStatus, string> = { draft: "bg-muted-foreground/50", published: "bg-emerald-500" };

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-normal whitespace-nowrap">
      <span aria-hidden className={cn("size-1.5 rounded-full", DOT[status])} />
      {LABELS[status]}
    </Badge>
  );
}
