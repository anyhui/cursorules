import { EventsList } from "@/components/events/events-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | Cursor Directory",
  description:
    "Meetups and events from the Cursor community around the world.",
  openGraph: {
    title: "Events | Cursor Directory",
    description:
      "Meetups and events from the Cursor community around the world.",
  },
  twitter: {
    title: "Events | Cursor Directory",
    description:
      "Meetups and events from the Cursor community around the world.",
  },
};

export const revalidate = 3600;

export default async function Page() {
  return (
    <div className="page-shell pb-32 pt-24 md:pt-32">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="marketing-page-title">Events</h1>
          <p className="marketing-copy max-w-2xl">
            Meetups and events from the Cursor community around the world.
          </p>
        </div>

        <a
          href="https://anysphere.typeform.com/to/aqRbfe1R"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 flex-shrink-0 items-center rounded-full border border-border bg-card px-4 text-sm text-foreground shadow-cursor transition-colors hover:bg-accent"
        >
          Host an event
        </a>
      </div>

      <EventsList />
    </div>
  );
}
