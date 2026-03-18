import { JobForm } from "@/components/forms/job";
import { Login } from "@/components/login";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Post a job | Cursor Directory",
  description:
    "Post a job listing on Cursor Directory and reach 300k+ developers.",
  openGraph: {
    title: "Post a job | Cursor Directory",
    description:
      "Post a job listing on Cursor Directory and reach 300k+ developers.",
  },
  twitter: {
    title: "Post a job | Cursor Directory",
    description:
      "Post a job listing on Cursor Directory and reach 300k+ developers.",
  },
};

export default async function Page() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Suspense fallback={null}>
            <Login redirectTo="/jobs/new" />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell pb-16 pt-24 md:pt-32">
      <div className="mx-auto max-w-screen-sm">
        <h1 className="marketing-page-title mb-4">Post a job</h1>
        <p className="marketing-copy mb-8">
          Reach 300k+ developers building with Cursor.
        </p>
        <JobForm />
      </div>
    </div>
  );
}
