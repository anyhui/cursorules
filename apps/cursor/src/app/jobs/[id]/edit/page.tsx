import { EditJobForm } from "@/components/forms/edit-job";
import { Login } from "@/components/login";
import { JobListingSwitch } from "@/components/jobs/jobs-listing-switch";
import { getJobById } from "@/data/queries";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "Edit job listing | Cursor Directory",
  description: "Edit your job listing on Cursor Directory.",
};

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getSession();
  const { data: job } = await getJobById(id);

  if (!session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Suspense fallback={null}>
            <Login redirectTo={`/jobs/${id}/edit`} />
          </Suspense>
        </div>
      </div>
    );
  }

  if (job?.owner_id !== session.user.id) {
    redirect("/jobs");
  }

  return (
    <div className="page-shell pb-16 pt-24 md:pt-32">
      <div className="mx-auto max-w-screen-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="marketing-page-title">Edit job listing</h1>
          <JobListingSwitch id={job.id} active={job.active} />
        </div>

        <EditJobForm data={job} />
      </div>
    </div>
  );
}
