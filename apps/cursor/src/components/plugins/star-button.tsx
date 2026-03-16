"use client";

import { starPluginAction } from "@/actions/star-plugin";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { Star } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";

function formatCount(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

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
  const [starred, setStarred] = useState(false);
  const [count, setCount] = useState(starCount);
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
          setStarred(!!data);
          setLoaded(true);
        });
    });
  }, [pluginId]);

  const { execute } = useAction(starPluginAction, {
    onSuccess: () => {
      setStarred((prev) => !prev);
      setCount((prev) => (starred ? prev - 1 : prev + 1));
    },
  });
  const [isPending, startTransition] = useTransition();

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
        <span className="text-xs">{formatCount(count)}</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "gap-1.5 rounded-full border-border bg-card",
        starred && "text-yellow-500",
      )}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          execute({ pluginId, slug });
        });
      }}
    >
      <Star className={cn("size-3.5", starred && "fill-yellow-500")} />
      <span className="text-xs">{formatCount(count)}</span>
    </Button>
  );
}
