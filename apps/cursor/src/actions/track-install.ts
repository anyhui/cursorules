"use server";

import { createClient as createAdminClient } from "@/utils/supabase/admin-client";
import { revalidatePath } from "next/cache";
import { actionClient } from "./safe-action";
import { z } from "zod";

export const trackInstallAction = actionClient
  .metadata({
    actionName: "track-install",
  })
  .schema(
    z.object({
      pluginId: z.string().uuid(),
      slug: z.string(),
    }),
  )
  .action(async ({ parsedInput: { pluginId, slug } }) => {
    const admin = await createAdminClient();

    await admin.rpc("increment_install_count", {
      plugin_id_input: pluginId,
    });

    revalidatePath("/plugins");
    revalidatePath(`/plugins/${slug}`);
  });
