import { Profile } from "@/components/profile";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { getUserProfile } from "@/data/queries";
import { Suspense } from "react";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;

  const { data } = await getUserProfile(slug);

  return {
    title: `${data?.name}'s Profile | Cursor Directory`,
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <div className="page-shell max-w-4xl min-h-screen pb-32 pt-24 md:pt-32">
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile slug={slug} />
      </Suspense>
    </div>
  );
}
