import { getJobs } from "@/data/queries";
import { JobsBuy } from "./jobs-buy";
import { JobsCard } from "./jobs-card";

export async function JobsList() {
  const { data: jobs } = await getJobs();

  return (
    <div className="mt-10 flex justify-between gap-8 border-t border-border pt-10">
      <div className="flex max-w-screen-sm flex-col gap-8 xl:max-w-screen-md">
        {jobs?.map((job) => (
          <JobsCard key={job.id} data={job} />
        ))}
      </div>

      <div className="hidden lg:block">
        <JobsBuy />
      </div>
    </div>
  );
}
