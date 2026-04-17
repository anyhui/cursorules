const API_ENDPOINT = "https://public-api.luma.com/v1";

export interface Event {
  api_id: string;
  calendar_api_id: string;
  user_api_id: string;
  created_at: string;
  cover_url: string;
  name: string;
  description: string;
  description_md: string;
  start_at: string;
  duration_interval: string;
  end_at: string;
  geo_address_json: any;
  geo_latitude: string;
  geo_longitude: string;
  url: string;
  timezone: string;
  visibility: string;
  meeting_url: string | null;
  zoom_meeting_url: string | null;
  tags?: string[];
}

interface LumaResponse {
  entries: Event[];
  has_more: boolean;
  next_cursor: string | null;
}

export async function getEvents(): Promise<{ entries: Event[] }> {
  const allEntries: Event[] = [];

  // Fetch events from 90 days ago onward so we get recent past + upcoming
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const afterParam = `&after=${since.toISOString()}`;

  let cursor: string | null = null;
  let pages = 0;
  const MAX_PAGES = 10;

  do {
    const cursorParam = cursor
      ? `&pagination_cursor=${encodeURIComponent(cursor)}`
      : "";

    const response = await fetch(
      `${API_ENDPOINT}/organizations/events/list?pagination_limit=100${afterParam}${cursorParam}`,
      {
        method: "GET",
        headers: {
          "X-Luma-API-Key": process.env.LUMA_API_KEY || "",
        },
      },
    );

    const data: LumaResponse = await response.json();
    allEntries.push(...(data.entries ?? []));

    cursor = data.has_more ? data.next_cursor : null;
    pages++;
  } while (cursor && pages < MAX_PAGES);

  return { entries: allEntries };
}
