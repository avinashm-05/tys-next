"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { ImageIcon, NewspaperIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { handleFormError } from "@/lib/form";
import { emptyStringsToNull } from "@/lib/validation/common";
import { slugify } from "@/lib/slug";
import { postInput, type PostInput } from "@/lib/validation/post";
import { BLOG_CATEGORY_SUGGESTIONS } from "@/lib/blog-categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionIconBadge } from "@/components/admin/section-icon-badge";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export type PostFormValues = {
  id: number;
  slug: string;
  title: string;
  metaTitle: string | null;
  description: string;
  category: string;
  body: string;
  authorName: string;
  status: "draft" | "published";
  publishedAt: string | null;
  heroImageKey: string | null;
};

type FormInput = z.input<typeof postInput>;

const FIELDS = [
  "title",
  "meta_title",
  "slug",
  "description",
  "category",
  "body",
  "author_name",
  "status",
  "published_at",
] as const;

/** `<input type=datetime-local>` has no timezone — treated as the browser's
 * local time on both directions, matching the field label's implicit
 * "your local time" framing. */
function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Shared by /admin/blog/new and /admin/blog/[id]/edit. */
export function PostForm({ post }: { post?: PostFormValues }) {
  const router = useRouter();
  const editing = post !== undefined;
  const baseResolver = zodResolver(postInput);
  const form = useForm<FormInput, unknown, PostInput>({
    resolver: (values, ctx, opts) => baseResolver(emptyStringsToNull(values) as FormInput, ctx, opts),
    defaultValues: {
      title: post?.title ?? "",
      meta_title: post?.metaTitle ?? "",
      slug: post?.slug ?? "",
      description: post?.description ?? "",
      category: post?.category ?? "",
      body: post?.body ?? "",
      author_name: post?.authorName ?? "",
      status: post?.status ?? "draft",
      published_at: "",
    },
  });
  const errors = form.formState.errors as FieldErrors<PostInput>;
  const { isSubmitting } = form.formState;
  const status = form.watch("status");
  const slugTouched = useRef(editing); // an existing slug is already "set" — don't overwrite it as the title is edited

  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(
    post?.heroImageKey ? `/api/blog/media/${post.heroImageKey}` : null,
  );
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [removingHero, setRemovingHero] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);

  function onHeroPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroFile(file);
    setHeroPreviewUrl(URL.createObjectURL(file));
  }

  // A freshly-picked file that hasn't been uploaded yet has nothing
  // persisted to undo — clearing it is purely local. An already-saved
  // hero image is removed immediately via its own request (the post
  // already has a real id, so this doesn't need to wait for Save).
  async function clearHero() {
    if (heroInputRef.current) heroInputRef.current.value = "";
    if (heroFile) {
      setHeroFile(null);
      setHeroPreviewUrl(post?.heroImageKey ? `/api/blog/media/${post.heroImageKey}` : null);
      return;
    }
    if (!editing || !post.heroImageKey) {
      setHeroPreviewUrl(null);
      return;
    }
    setRemovingHero(true);
    try {
      await adminApi(`/api/admin/blog/posts/${post.id}/hero`, { method: "DELETE" });
      setHeroPreviewUrl(null);
      toast.success("Hero image removed.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't remove the hero image.");
    } finally {
      setRemovingHero(false);
    }
  }

  async function uploadHero(postId: number) {
    const body = new FormData();
    body.append("file", heroFile!);
    await adminApi(`/api/admin/blog/posts/${postId}/hero`, { method: "POST", body });
  }

  async function onSubmit(values: PostInput) {
    try {
      const postId = editing
        ? (
            await adminApi<{ id: number }>(`/api/admin/blog/posts/${post.id}`, {
              method: "PATCH",
              body: JSON.stringify(values),
            })
          ).id
        : (
            await adminApi<{ id: number }>("/api/admin/blog/posts", {
              method: "POST",
              body: JSON.stringify(values),
            })
          ).id;

      // A new hero file rides along as a second request once the post id is
      // known (a brand-new post has none until the create above returns).
      // Clearing without picking a replacement isn't supported yet — the
      // remove button just clears the preview; wiring an actual DELETE for
      // "no hero image" is a small follow-up, not blocking.
      if (heroFile) {
        try {
          await uploadHero(postId);
        } catch (e) {
          toast.error(e instanceof ApiError ? e.message : "Post saved, but the hero image upload failed.");
        }
      }

      toast.success(editing ? "Post updated." : "Post created.");
      router.push("/admin/blog");
    } catch (e) {
      handleFormError(e, form.setError, FIELDS);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-h2">{editing ? "Edit post" : "New post"}</h1>
      <Card className="overflow-visible">
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <SectionIconBadge icon={NewspaperIcon} />
            <h2 className="font-heading text-lg font-semibold">Post details</h2>
          </div>
          <form id="post-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <FieldSet>
                <FieldGroup className="grid gap-5 sm:grid-cols-2">
                  <Field data-invalid={!!errors.title} className="sm:col-span-2">
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      id="title"
                      autoFocus={!editing}
                      aria-invalid={!!errors.title}
                      {...form.register("title", {
                        onChange: (e) => {
                          if (!slugTouched.current) {
                            form.setValue("slug", slugify(e.target.value), { shouldValidate: true });
                          }
                        },
                      })}
                    />
                    <FieldError errors={[errors.title]} />
                  </Field>

                  <Field data-invalid={!!errors.meta_title} className="sm:col-span-2">
                    <FieldLabel htmlFor="meta_title">SEO title (optional)</FieldLabel>
                    <Input
                      id="meta_title"
                      placeholder={form.watch("title") || "Same as title"}
                      aria-invalid={!!errors.meta_title}
                      {...form.register("meta_title")}
                    />
                    <FieldDescription>
                      A shorter, keyword-first version for search results and the browser tab.
                      Leave blank to just use the title above.
                    </FieldDescription>
                    <FieldError errors={[errors.meta_title]} />
                  </Field>

                  <Field data-invalid={!!errors.slug}>
                    <FieldLabel htmlFor="slug">URL slug</FieldLabel>
                    <Input
                      id="slug"
                      aria-invalid={!!errors.slug}
                      {...form.register("slug", {
                        onChange: () => {
                          slugTouched.current = true;
                        },
                      })}
                    />
                    <FieldDescription>tysgloballogistics.com/blog/{form.watch("slug") || "…"}</FieldDescription>
                    <FieldError errors={[errors.slug]} />
                  </Field>

                  <Field data-invalid={!!errors.category}>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Input
                      id="category"
                      list="post-category-suggestions"
                      aria-invalid={!!errors.category}
                      {...form.register("category")}
                    />
                    <datalist id="post-category-suggestions">
                      {BLOG_CATEGORY_SUGGESTIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    <FieldError errors={[errors.category]} />
                  </Field>

                  <Field data-invalid={!!errors.description} className="sm:col-span-2">
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      rows={3}
                      aria-invalid={!!errors.description}
                      {...form.register("description")}
                    />
                    <FieldDescription>
                      Shown on the blog listing card and used as the page&rsquo;s meta description.
                    </FieldDescription>
                    <FieldError errors={[errors.description]} />
                  </Field>

                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="body">Body</FieldLabel>
                    <Controller
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          invalid={!!errors.body}
                        />
                      )}
                    />
                    <FieldError errors={[errors.body]} />
                  </Field>

                  <Field className="sm:col-span-2">
                    <FieldLabel>Hero image</FieldLabel>
                    <div className="flex items-center gap-4">
                      {heroPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- an admin-only preview of an arbitrary uploaded/local blob URL, not a page asset next/image should optimize
                        <img
                          src={heroPreviewUrl}
                          alt=""
                          className="size-20 rounded-xl border border-tys-mist object-cover"
                        />
                      ) : (
                        <div className="flex size-20 items-center justify-center rounded-xl border border-dashed border-tys-mist text-muted-foreground">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <input
                          ref={heroInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          id="hero-file"
                          onChange={onHeroPicked}
                        />
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <label htmlFor="hero-file" className="cursor-pointer">
                              <UploadSimpleIcon size={14} />
                              {heroPreviewUrl ? "Replace" : "Choose image"}
                            </label>
                          </Button>
                          {heroPreviewUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={removingHero}
                              onClick={clearHero}
                            >
                              <TrashIcon size={14} />
                              {removingHero ? "Removing…" : "Remove"}
                            </Button>
                          )}
                        </div>
                        <FieldDescription>JPEG, PNG, or WebP, up to 5 MB.</FieldDescription>
                      </div>
                    </div>
                  </Field>

                  <Field data-invalid={!!errors.status}>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Controller
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="status" aria-invalid={!!errors.status}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[errors.status]} />
                  </Field>

                  {status === "published" && (
                    <Field data-invalid={!!errors.published_at}>
                      <FieldLabel htmlFor="published_at">Published date</FieldLabel>
                      <Controller
                        control={form.control}
                        name="published_at"
                        render={({ field }) => (
                          <Input
                            id="published_at"
                            type="datetime-local"
                            value={isoToDatetimeLocal((field.value as string | null) ?? post?.publishedAt ?? null)}
                            onChange={(e) => field.onChange(datetimeLocalToIso(e.target.value))}
                          />
                        )}
                      />
                      <FieldDescription>
                        Leave as-is to publish now; backdate to change where it sorts on the blog.
                      </FieldDescription>
                      <FieldError errors={[errors.published_at]} />
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="author_name">Author</FieldLabel>
                    <Input id="author_name" placeholder="Avinash" {...form.register("author_name")} />
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-2 border-t border-tys-mist bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:shadow-[0_2px_8px_rgba(16,24,40,0.06)]">
        <Button asChild variant="outline">
          <Link href="/admin/blog">Cancel</Link>
        </Button>
        <Button
          type="submit"
          form="post-form"
          disabled={isSubmitting}
          className="bg-tys-blue text-white hover:bg-tys-blue/90"
        >
          {isSubmitting ? "Saving…" : editing ? "Save changes" : "Create post"}
        </Button>
      </div>
    </div>
  );
}
