import { Button } from "@/components/ui/button";

export function Host() {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border p-6 md:p-8"
      style={{
        backgroundImage: `repeating-linear-gradient(
          -60deg,
          transparent,
          transparent 1px,
          color-mix(in oklab, var(--base) 16%, transparent) 1px,
          color-mix(in oklab, var(--base) 16%, transparent) 2px,
          transparent 2px,
          transparent 6px
        )`,
      }}
    >
      <h2 className="text-xl font-medium tracking-tight md:text-2xl">
        Host a Cursor Community event
      </h2>

      <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        Interested in getting support from the team to host Cursor community
        meetups, hackathons, or workshops?
      </p>

      <Button
        variant="outline"
        className="mt-6 border-border"
        asChild
      >
        <a
          href="https://anysphere.typeform.com/to/aqRbfe1R"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apply to host
        </a>
      </Button>
    </div>
  );
}
