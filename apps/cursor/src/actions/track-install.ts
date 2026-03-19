"use server";

import { createClient as createAdminClient } from "@/utils/supabase/admin-client";
import { actionClient } from "./safe-action";
import { z } from "zod";

export const trackInstallAction = actionClient
  .metadata({
    actionName: "track-install",
  })
  .schema(
    z.object({
      pluginId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput: { pluginId } }) => {
    const admin = await createAdminClient();

    await admin.rpc("increment_install_count", {
      plugin_id_input: pluginId,
    });
  });
