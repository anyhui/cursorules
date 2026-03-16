"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const starPluginAction = authActionClient
  .metadata({
    actionName: "star-plugin",
  })
  .schema(
    z.object({
      pluginId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput: { pluginId }, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("plugin_stars")
      .select("plugin_id")
      .eq("plugin_id", pluginId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("plugin_stars")
        .delete()
        .eq("plugin_id", pluginId)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("plugin_stars")
        .insert({ plugin_id: pluginId, user_id: userId });
    }

    revalidatePath("/plugins");
  });
