import { JobsFeatured } from "@/components/jobs/jobs-featured";
import { JobsList } from "@/components/jobs/jobs-list";
import { getFeaturedJobs } from "@/data/queries";
import Link from "next/link";

export const metadata = {
  title: "Jobs | Cursor Directory",
  description: "Find jobs at companies building with Cursor.",
};

export const revalidate = 3600;

export default async function Page() {
  const { data: featuredJobs } = await getFeaturedJobs();

  return (
    <div className="page-shell pb-32 pt-24 md:pt-32">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="marketing-page-title">Jobs</h1>
          <p className="marketing-copy max-w-2xl">
            Find jobs at companies building with Cursor.
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="flex h-10 flex-shrink-0 items-center rounded-full border border-border bg-card px-4 text-sm text-foreground shadow-cursor transition-colors hover:bg-accent"
        >
          Post a job
        </Link>
      </div>

      <JobsFeatured data={featuredJobs} />
      <JobsList />
    </div>
  );
}
