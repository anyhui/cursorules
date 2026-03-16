import Link from "next/link";
import { BoardPost, type BoardPostProps } from "../board/board-post";
import { Button } from "../ui/button";

export function ProfilePosts({
  data,
  isOwner,
}: {
  data: BoardPostProps[];
  isOwner: boolean;
}) {
  if (!data?.length) {
    return (
      <div className="surface-card mt-6 flex h-full flex-col items-center justify-center rounded-lg py-12 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          No posts added yet
        </p>

        {isOwner && (
          <Link href="/board">
            <Button variant="outline" size="lg">
              Add post
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 pt-2">
      {data?.map((post) => (
        // @ts-ignore
        <div key={post.id}>
          <BoardPost {...post} />
        </div>
      ))}
    </div>
  );
}
