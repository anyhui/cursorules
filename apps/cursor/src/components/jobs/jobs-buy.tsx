import { Button } from "@/components/ui/button";
import Link from "next/link";

export function JobsBuy() {
  return (
    <div className="relative min-h-[250px] md:min-h-[340px] md:max-w-[350px] flex rounded-xl border border-border bg-card p-6">
      <div className="relative z-10">
        <h2 className="text-2xl font-medium tracking-tight text-foreground">
          Reach 300k+ developers per month.
        </h2>

        <p className="mt-4 text-sm text-muted-foreground">
          Connect with top talent and grow your team faster by reaching a
          dedicated community of developers.
        </p>

        <Link href="/jobs/new">
          <Button
            variant="outline"
            className="mt-10 rounded-full border-border"
          >
            Post a job
          </Button>
        </Link>
      </div>
    </div>
  );
}
