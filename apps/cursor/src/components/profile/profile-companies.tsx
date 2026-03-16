import { getUserCompanies } from "@/data/queries";
import { AddCompanyButton } from "../company/add-company-button";
import { CompanyCard } from "../company/company-card";

export async function ProfileCompanies({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner: boolean;
}) {
  const { data } = await getUserCompanies(userId);

  if (!data?.length) {
    return (
      <div className="surface-card mt-6 flex h-full flex-col items-center justify-center rounded-lg py-12 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          No companies added yet
        </p>
        {isOwner && <AddCompanyButton redirect={true} />}
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {data?.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
