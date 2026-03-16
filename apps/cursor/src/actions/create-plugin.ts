"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const componentSchema = z.object({
  type: z.enum([
    "rule",
    "mcp_server",
    "skill",
    "agent",
    "hook",
    "lsp_server",
    "command",
  ]),
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createPluginAction = authActionClient
  .metadata({
    actionName: "create-plugin",
  })
  .schema(
    z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      description: z.string().min(10, "Description must be at least 10 characters"),
      logo: z.string().nullable().optional(),
      repository: z.string().url().nullable().optional(),
      homepage: z.string().url().nullable().optional(),
      keywords: z.array(z.string()).optional(),
      components: z.array(componentSchema).min(1, "At least one component is required"),
    }),
  )
  .action(
    async ({
      parsedInput: { name, description, logo, repository, homepage, keywords, components },
      ctx: { userId },
    }) => {
      const supabase = await createClient();

      const { data: plugin, error: pluginError } = await supabase
        .from("plugins")
        .insert({
          name,
          description,
          logo: logo || null,
          repository: repository || null,
          homepage: homepage || null,
          keywords: keywords || [],
          owner_id: userId,
          active: true,
          plan: "standard",
        })
        .select("id, slug")
        .single();

      if (pluginError) {
        throw new Error(pluginError.message);
      }

      const componentRows = components.map((comp, i) => ({
        plugin_id: plugin.id,
        type: comp.type,
        name: comp.name,
        slug:
          comp.slug ||
          comp.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        description: comp.description || null,
        content: comp.content || null,
        metadata: comp.metadata || {},
        sort_order: i,
      }));

      const { error: compError } = await supabase
        .from("plugin_components")
        .insert(componentRows);

      if (compError) {
        await supabase.from("plugins").delete().eq("id", plugin.id);
        throw new Error(compError.message);
      }

      revalidatePath("/plugins");
      redirect(`/plugins/${plugin.slug}`);
    },
  );
