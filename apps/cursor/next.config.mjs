import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: resolve(__dirname, "../.."),
  },
  redirects: async () => {
    return [
      {
        source: "/popular",
        destination: "/plugins",
        permanent: true,
      },
      {
        source: "/rules",
        destination: "/plugins",
        permanent: true,
      },
      {
        source: "/rules/:path*",
        destination: "/plugins/:path*",
        permanent: true,
      },
      {
        source: "/mcp",
        destination: "/plugins",
        permanent: true,
      },
      {
        source: "/official/:path*",
        destination: "/plugins",
        permanent: true,
      },
      {
        source: "/generate",
        destination: "/plugins",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "cdn.brandfetch.io",
      },
      {
        hostname: "pbs.twimg.com",
      },
      {
        hostname: "midday.ai",
      },
      {
        hostname: "pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev",
      },
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "knhgkaawjfqqwmsgmxns.supabase.co",
      },
      {
        hostname: "console.settlemint.com",
      },
      {
        hostname: "assets.serverless-extras.com",
      },
      {
        hostname: "images.lumacdn.com",
      },
    ],
  },
};

export default nextConfig;
