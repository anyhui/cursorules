import { PluginDetailView } from "@/components/plugins/plugin-detail";
import { getPluginBySlug, getPlugins } from "@/data/queries";
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
    const title = `${plugin.name} | Cursor Directory`;
    const description = plugin.description ?? undefined;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
      twitter: {
        title,
        description,
      },
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
  if (!plugin) notFound();

  if (!plugin.active) {
    const session = await getSession();
    if (!session || plugin.owner_id !== session.user.id) {
      notFound();
    }
  }

  return <PluginDetailView plugin={plugin} />;
}

export const revalidate = 3600;
