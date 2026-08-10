import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { PostsList } from "./posts-list";

export const metadata: Metadata = { title: "Blog — TYS Global Logistics" };

export default async function BlogPage() {
  await requireAdminPage();
  return <PostsList />;
}
