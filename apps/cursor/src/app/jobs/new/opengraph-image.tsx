import { OG } from "@/lib/og";
import { createListingOG } from "@/lib/og";

export const alt = "Post a Job";
export const size = { width: OG.width, height: OG.height };
export const contentType = "image/png";

export default async function Image() {
  return createListingOG(
    "Post a Job",
    "Reach thousands of developers building with Cursor",
  );
}
