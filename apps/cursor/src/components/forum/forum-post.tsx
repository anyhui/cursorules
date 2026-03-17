import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { ForumPost as ForumPostType } from "@/data/queries";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ThumbsUp } from "lucide-react";

function cleanExcerpt(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&hellip;/g, "…")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&[^;]+;/g, "");
}

export function ForumPost({ post }: { post: ForumPostType }) {
  return (
    <a
      href={`${post.url}?utm_source=cursor.directory&utm_medium=startpage`}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="h-[156px] overflow-hidden border-border bg-transparent transition-colors hover:border-input hover:bg-transparent">
        <CardContent className="flex flex-col gap-3 p-4 h-full">
          <div className="flex items-center gap-2">
            {post.author && (
              <Avatar className="size-5 rounded-full flex-shrink-0">
                {post.author.avatarUrl ? (
                  <AvatarImage
                    src={post.author.avatarUrl}
                    alt={post.author.name ?? post.author.username}
                  />
                ) : (
                  <AvatarFallback className="bg-accent text-[10px]">
                    {(post.author.name ?? post.author.username).charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            <span className="text-xs text-[#878787] font-mono truncate">
              {post.author?.name ?? post.author?.username}
            </span>
            <span className="text-xs text-[#878787] font-mono ml-auto flex-shrink-0">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <h4 className="text-sm font-medium tracking-[0.005em] text-foreground line-clamp-1">
            {post.title}
          </h4>

          {post.excerpt && (
            <p className="flex-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
              {cleanExcerpt(post.excerpt)}
            </p>
          )}

          <div className="mt-auto flex items-center gap-3">
            <span className="flex items-center gap-1 rounded-[4px] border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <MessageSquare className="size-2.5" />
              {post.postsCount}
            </span>
            <span className="flex items-center gap-1 rounded-[4px] border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <ThumbsUp className="size-2.5" />
              {post.likeCount}
            </span>
            {post.views > 0 && (
              <span className="ml-auto rounded-[4px] border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {post.views.toLocaleString()} views
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
