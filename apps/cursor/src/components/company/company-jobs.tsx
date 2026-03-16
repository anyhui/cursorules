import { JobsCard } from "@/components/jobs/jobs-card";
import { getJobsByCompany } from "@/data/queries";

export async function CompanyJobs({ slug }: { slug: string }) {
  const { data } = await getJobsByCompany(slug);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-border pt-6">
      <h3 className="section-eyebrow">Jobs</h3>
      <div className="mt-4 flex flex-col gap-3">
        {data.map((job) => (
          <JobsCard
            key={job.id}
            data={{
              id: job.id,
              owner_id: job.owner_id,
              title: job.title,
              company: job.companies,
              location: job.location,
              description: job.description,
              created_at: job.created_at,
              link: job.link,
              workplace: job.workplace,
              experience: job.experience,
            }}
          />
        ))}
      </div>
    </div>
  );
}
