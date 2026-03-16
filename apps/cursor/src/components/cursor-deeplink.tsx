"use client";

type Props = {
  mcp_link: string | null;
};

export function CursorDeepLink({ mcp_link }: Props) {
  if (!mcp_link) {
    return null;
  }

  return (
    <a
      href={mcp_link}
      target="_blank"
      rel="noreferrer"
      className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      Add to Cursor
    </a>
  );
}
