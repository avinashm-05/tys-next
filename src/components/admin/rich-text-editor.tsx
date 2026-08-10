"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  TextBolderIcon,
  TextHThreeIcon,
  TextHTwoIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  LinkIcon,
  LinkBreakIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * The plain rich-text toolbar for blog post bodies: bold/italic/strike,
 * H2/H3, bullet/numbered lists, blockquote, links. Every node/mark this
 * StarterKit config enables has a matching entry in
 * POST_BODY_SANITIZE_OPTIONS (src/app/api/admin/blog/posts/helpers.ts),
 * and nothing else — code/codeBlock/horizontalRule/underline are
 * deliberately turned off so the editor can never produce a tag the
 * server-side sanitizer will then silently strip back out. If the toolbar
 * ever grows a new button, the sanitizer's allowlist has to grow with it.
 */
function editorExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false,
      code: false,
      horizontalRule: false,
      underline: false,
      heading: { levels: [2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      },
    }),
  ];
}

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className="size-8"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()} // keep the editor's own selection focused
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
}) {
  const editor = useEditor({
    // Next.js SSR: the editor must not render its initial content on the
    // server, or React's hydration diff mismatches against the client-side
    // ProseMirror-managed DOM.
    immediatelyRender: false,
    extensions: editorExtensions(),
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none min-h-48 rounded-b-xl border border-t-0 border-input bg-transparent px-3.5 py-3 outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
          invalid && "border-destructive",
        ),
      },
    },
  });

  function setLink() {
    if (!editor) return;
    const existing = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", existing ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) {
    return <div className="min-h-56 rounded-xl border border-input bg-muted/30" />;
  }

  return (
    <div>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 rounded-t-xl border border-input bg-muted/30 p-1.5",
          invalid && "border-destructive",
        )}
      >
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <TextBolderIcon weight="bold" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <TextItalicIcon weight="bold" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <TextStrikethroughIcon weight="bold" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <TextHTwoIcon weight="bold" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <TextHThreeIcon weight="bold" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListBulletsIcon weight="bold" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListNumbersIcon weight="bold" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <QuotesIcon weight="bold" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton label="Add link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon weight="bold" />
        </ToolbarButton>
        <ToolbarButton
          label="Remove link"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <LinkBreakIcon weight="bold" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
