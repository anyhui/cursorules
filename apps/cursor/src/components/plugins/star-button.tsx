"use client";

import { starPluginAction } from "@/actions/star-plugin";
import { cn, formatCount } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { Star } from "lucide-react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function StarButton({
  pluginId,
  slug,
  starCount,
}: {
  pluginId: string;
  slug: string;
  starCount: number;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialStarred, setInitialStarred] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoaded(true);
        return;
      }
      setIsAuthenticated(true);
      supabase
        .from("plugin_stars")
        .select("plugin_id")
        .eq("plugin_id", pluginId)
        .eq("user_id", session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          setInitialStarred(!!data);
          setLoaded(true);
        });
    });
  }, [pluginId]);

  const { execute, optimisticState } = useOptimisticAction(starPluginAction, {
    currentState: { starred: initialStarred, count: starCount },
    updateFn: (state) => ({
      starred: !state.starred,
      count: state.starred ? state.count - 1 : state.count + 1,
    }),
  });

  if (!loaded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 rounded-full border-border bg-card"
        disabled
      >
        <Star className="size-3.5" />
        <span className="text-xs">{formatCount(starCount)}</span>
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Star className="size-3.5" />
        <span className="text-xs">{formatCount(starCount)}</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "gap-1.5 rounded-full border-border bg-card",
        optimisticState.starred && "text-yellow-500",
      )}
      onClick={() => execute({ pluginId, slug })}
    >
      <Star
        className={cn(
          "size-3.5",
          optimisticState.starred && "fill-yellow-500",
        )}
      />
      <span className="text-xs">{formatCount(optimisticState.count)}</span>
    </Button>
  );
}
