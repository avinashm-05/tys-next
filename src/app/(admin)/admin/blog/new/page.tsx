import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "New Post — TYS Global Logistics" };

export default async function NewPostPage() {
  await requireAdminPage();
  return (
    <div className="mx-auto max-w-4xl">
      <PostForm />
    </div>
  );
}
