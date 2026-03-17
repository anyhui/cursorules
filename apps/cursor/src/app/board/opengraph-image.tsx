import { OG } from "@/lib/og";
import { createListingOG } from "@/lib/og";

export const alt = "Board";
export const size = { width: OG.width, height: OG.height };
export const contentType = "image/png";

export default async function Image() {
  return createListingOG(
    "Board",
    "Trending in Cursor today",
  );
}
