import { getPendingPlugins } from "@/data/queries";
import { isAdmin } from "@/utils/admin";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PluginReviewList } from "./plugin-review-list";

export const metadata: Metadata = {
  title: "Review Plugins | Admin",
};

export default async function AdminPluginsPage() {
  const session = await getSession();

  if (!session || !isAdmin(session.user.id)) {
    redirect("/");
  }

  const { data: plugins } = await getPendingPlugins({
    since: "2026-03-16T00:00:00Z",
  });

  return (
    <div className="min-h-screen px-6 pt-24 md:pt-32 pb-32">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <h1 className="marketing-page-title mb-3">Review Plugins</h1>
          <p className="marketing-copy text-muted-foreground">
            {plugins?.length ?? 0} pending{" "}
            {plugins?.length === 1 ? "submission" : "submissions"}
          </p>
        </div>

        <PluginReviewList plugins={plugins ?? []} />
      </div>
    </div>
  );
}
