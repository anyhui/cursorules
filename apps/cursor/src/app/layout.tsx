import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JoinCTA } from "@/components/join-cta";
import { GlobalModals } from "@/components/modals/global-modals";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { getPlugins } from "@/data/queries";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { cursorGothic } from "@/styles/fonts";

export const metadata: Metadata = {
  title: "Cursor Directory",
  description: "Find the best cursor rules for your framework and language",
  icons: [
    {
      rel: "icon",
      url: "/favicon.svg",
    },
  ],
  openGraph: {
    title: "Cursor Directory",
    description: "Find the best cursor rules for your framework and language",
    url: "https://cursor.directory",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/opengraph-image-v2.png",
        width: 800,
        height: 600,
      },
      {
        url: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/opengraph-image-v2.png",
        width: 1800,
        height: 1600,
      },
    ],
  },
  twitter: {
    title: "Cursor Directory",
    description: "Find the best cursor rules for your framework and language",
    images: [
      {
        url: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/opengraph-image-v2.png",
        width: 800,
        height: 600,
      },
      {
        url: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/opengraph-image-v2.png",
        width: 1800,
        height: 1600,
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#14120b" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: plugins } = await getPlugins({ fetchAll: true });
  const pluginItems = (plugins ?? []).map((p) => ({
    name: p.name,
    slug: p.slug,
  }));

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        `${cursorGothic.variable} ${GeistMono.variable}`,
        "whitespace-pre-line antialiased",
      )}
    >
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <ScrollToTop />
            <Header pluginItems={pluginItems} />
            {children}
            <JoinCTA />
            <Footer />

            <Toaster />
            <GlobalModals />
          </NuqsAdapter>
        </ThemeProvider>
      </body>

      <OpenPanelComponent
        clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!}
        trackScreenViews
        disabled={process.env.NODE_ENV === "development"}
      />
    </html>
  );
}
