import { OG } from "@/lib/og";
import { createListingOG } from "@/lib/og";

export const alt = "Jobs";
export const size = { width: OG.width, height: OG.height };
export const contentType = "image/png";

export default async function Image() {
  return createListingOG(
    "Jobs",
    "Find jobs at companies building with Cursor",
  );
}
