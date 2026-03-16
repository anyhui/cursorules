import { Card } from "@/components/ui/card";
import type { Event } from "@/lib/luma";
import { format } from "date-fns";
import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function EventCard({ data: { event } }: { data: Event }) {
  const eventUrl = `${event.url}?utm_source=cursor.directory`;
  const past = new Date(event.end_at) < new Date();
  const location =
    event.geo_address_json?.city || event.geo_address_json?.address;

  return (
    <Link href={eventUrl} target="_blank" rel="noopener noreferrer">
      <Card className="overflow-hidden border-border bg-transparent transition-colors hover:border-input hover:bg-transparent">
        <div className="relative aspect-[2/1] w-full overflow-hidden bg-muted">
          {event.cover_url ? (
            <Image
              src={event.cover_url}
              alt={event.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl font-medium text-muted-foreground">
              {event.name.charAt(0)}
            </div>
          )}
          {past && <div className="absolute inset-0 bg-black/40" />}
        </div>

        <div className="flex h-[88px] flex-col gap-2 p-3">
          <h3 className="line-clamp-2 text-sm font-medium tracking-[0.005em] text-foreground">
            {event.name}
          </h3>

          <div className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3 flex-shrink-0" />
              {format(new Date(event.start_at), "MMM d, yyyy · h:mm a")}
            </span>
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="size-3 flex-shrink-0" />
              <span className="truncate">{location || "Online"}</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
