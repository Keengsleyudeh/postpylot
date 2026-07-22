import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { env } from "@/lib/env";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PostPylot — Your AI content engine on autopilot",
  description:
    "Generate, schedule, publish, and track content across YouTube, TikTok, LinkedIn, and Facebook without doing the repetitive work yourself.",
  applicationName: "PostPylot",
  appleWebApp: {
    capable: true,
    title: "PostPylot",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "PostPylot — Your AI content engine on autopilot",
    description:
      "Generate, schedule, publish, and track content across YouTube, TikTok, LinkedIn, and Facebook.",
    siteName: "PostPylot",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050B18",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Validate environment on server startup
  void env;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
