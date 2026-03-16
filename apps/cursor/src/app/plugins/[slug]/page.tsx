import { PluginDetailView } from "@/components/plugins/plugin-detail";
import {
  getPluginBySlug,
  getPlugins,
  hasUserStarredPlugin,
} from "@/data/queries";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: plugin } = await getPluginBySlug(slug);
  if (plugin) {
    return {
      title: `${plugin.name} | Cursor Directory`,
      description: plugin.description ?? undefined,
    };
  }

  return { title: "Plugin Not Found" };
}

export async function generateStaticParams() {
  const { data: plugins } = await getPlugins({ fetchAll: true });
  return (plugins ?? []).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;

  const { data: plugin } = await getPluginBySlug(slug);
  if (plugin) {
    const session = await getSession();
    const starred = session
      ? await hasUserStarredPlugin(plugin.id, session.user.id)
      : false;

    return (
      <PluginDetailView
        plugin={plugin}
        starred={starred}
        isAuthenticated={!!session}
      />
    );
  }

  notFound();
}

export const revalidate = 3600;
