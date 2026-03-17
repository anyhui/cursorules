import { OG } from "@/lib/og";
import { createListingOG } from "@/lib/og";

export const alt = "Events";
export const size = { width: OG.width, height: OG.height };
export const contentType = "image/png";

export default async function Image() {
  return createListingOG(
    "Events",
    "Meetups and events from the Cursor community around the world",
  );
}
