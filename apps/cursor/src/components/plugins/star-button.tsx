"use client";

import { starPluginAction } from "@/actions/star-plugin";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useOptimistic } from "react";
import { Button } from "../ui/button";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function StarButton({
  pluginId,
  starred,
  starCount,
}: {
  pluginId: string;
  starred: boolean;
  starCount: number;
}) {
  const [optimistic, setOptimistic] = useOptimistic(
    { starred, starCount },
    (state) => ({
      starred: !state.starred,
      starCount: state.starred ? state.starCount - 1 : state.starCount + 1,
    }),
  );

  const { execute } = useAction(starPluginAction);

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "gap-1.5 rounded-full border-border bg-card",
        optimistic.starred && "text-yellow-500",
      )}
      onClick={() => {
        setOptimistic(optimistic);
        execute({ pluginId });
      }}
    >
      <Star
        className={cn("size-3.5", optimistic.starred && "fill-yellow-500")}
      />
      <span className="text-xs">{formatCount(optimistic.starCount)}</span>
    </Button>
  );
}
