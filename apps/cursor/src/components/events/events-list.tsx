import { getEvents } from "@/lib/luma";
import { Suspense } from "react";
import { EventsListClient } from "./events-list-client";

export async function EventsList() {
  const { entries: events } = await getEvents();

  const publicEvents = (events ?? []).filter(
    (e) => e.event.visibility === "public",
  );

  return (
    <Suspense>
      <EventsListClient events={publicEvents} />
    </Suspense>
  );
}
