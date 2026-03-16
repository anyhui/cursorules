import localFont from "next/font/local";

export const cursorGothic = localFont({
  src: [
    {
      path: "../../public/assets/fonts/CursorGothic-Regular.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../../public/assets/fonts/CursorGothic-Bold.woff2",
      style: "normal",
      weight: "700",
    },
    {
      path: "../../public/assets/fonts/CursorGothic-Italic.woff2",
      style: "italic",
      weight: "400",
    },
    {
      path: "../../public/assets/fonts/CursorGothic-BoldItalic.woff2",
      style: "italic",
      weight: "700",
    },
  ],
  preload: true,
  adjustFontFallback: false,
  fallback: ["sans-serif"],
  variable: "--font-cursor-gothic",
});
