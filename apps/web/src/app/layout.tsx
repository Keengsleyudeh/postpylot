import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Syne } from "next/font/google";

import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ThemeProvider } from "@/components/theme-provider";
import { env } from "@/lib/env";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
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
      className={`${jakarta.variable} ${syne.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
