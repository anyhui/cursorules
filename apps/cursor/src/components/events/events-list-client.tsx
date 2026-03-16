"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { Event } from "@/lib/luma";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { SearchInput } from "../search-input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { EventCard } from "./event-card";

const ITEMS_PER_PAGE = 24;

const tabs = [
  { key: null, label: "Upcoming" },
  { key: "past", label: "Past" },
] as const;

function getCity(event: Event): string {
  return event.event.geo_address_json?.city || "";
}

function matchesSearch(event: Event, term: string): boolean {
  const lower = term.toLowerCase();
  const name = event.event.name.toLowerCase();
  const city = getCity(event).toLowerCase();
  const region = (event.event.geo_address_json?.region || "").toLowerCase();
  const country = (event.event.geo_address_json?.country || "").toLowerCase();
  return (
    name.includes(lower) ||
    city.includes(lower) ||
    region.includes(lower) ||
    country.includes(lower)
  );
}

export function EventsListClient({ events }: { events: Event[] }) {
  const [selectedTab, setSelectedTab] = useQueryState("tab");
  const [search] = useQueryState("q", { defaultValue: "" });
  const [selectedCity, setSelectedCity] = useQueryState("city", { defaultValue: "all" });
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const now = useMemo(() => new Date(), []);

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => new Date(e.event.end_at) >= now)
        .sort(
          (a, b) =>
            new Date(a.event.start_at).getTime() -
            new Date(b.event.start_at).getTime(),
        ),
    [events, now],
  );

  const past = useMemo(
    () =>
      events
        .filter((e) => new Date(e.event.end_at) < now)
        .sort(
          (a, b) =>
            new Date(b.event.start_at).getTime() -
            new Date(a.event.start_at).getTime(),
        ),
    [events, now],
  );

  const pool = selectedTab === "past" ? past : upcoming;

  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of pool) {
      const c = getCity(e) || "Online";
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [pool]);

  const filtered = useMemo(() => {
    let result = pool;

    if (selectedCity !== "all") {
      result = result.filter((e) => (getCity(e) || "Online") === selectedCity);
    }

    if (search && search.length > 0) {
      result = result.filter((e) => matchesSearch(e, search));
    }

    return result;
  }, [pool, search, selectedCity]);

  const loadMore = useCallback(
    () => setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filtered.length)),
    [filtered.length],
  );

  const hasMore = visibleCount < filtered.length;
  const sentinelRef = useInfiniteScroll(loadMore, hasMore);

  return (
    <div>
      <div className="flex items-center gap-3">
        <SearchInput
          placeholder={`Search ${pool.length} events by name or city...`}
          className="max-w-[520px]"
        />

        <Select
          value={selectedCity}
          onValueChange={(v) => {
            setSelectedCity(v);
            setVisibleCount(ITEMS_PER_PAGE);
          }}
        >
          <SelectTrigger className="h-11 w-[180px] flex-shrink-0 rounded-full">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent className="max-h-[280px] overflow-y-auto">
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {c.name} ({c.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.label}
            variant={
              tab.key === null
                ? !selectedTab
                  ? "secondary"
                  : "ghost"
                : selectedTab === tab.key
                  ? "secondary"
                  : "ghost"
            }
            className={cn(
              "h-8 rounded-full px-4",
              (tab.key === null ? !selectedTab : selectedTab === tab.key)
                ? "text-foreground"
                : "text-muted-foreground",
            )}
            onClick={() => {
              setSelectedTab(tab.key);
              setSelectedCity("all");
              setVisibleCount(ITEMS_PER_PAGE);
            }}
          >
            {tab.label}
            <span className="ml-1.5 text-muted-foreground">
              {tab.key === null ? upcoming.length : past.length}
            </span>
          </Button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(0, visibleCount).map((event) => (
              <EventCard key={event.api_id} data={event} />
            ))}
          </div>

          {hasMore && <div ref={sentinelRef} className="h-px" />}
        </>
      ) : (
        <div className="mt-24 flex flex-col items-center">
          <p className="text-center text-sm text-muted-foreground">
            {search
              ? `No events matching "${search}"`
              : selectedTab === "past"
                ? "No past events"
                : "No upcoming events right now"}
          </p>
          {search && (
            <Button
              variant="outline"
              className="mt-4 rounded-full border-border"
              onClick={() => setSelectedTab(null)}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

    </div>
  );
}
