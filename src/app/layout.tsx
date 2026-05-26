import type { Metadata, Viewport } from "next";
import {
  Inter, Playfair_Display, Montserrat
} from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
const appUrl =
  configuredAppUrl &&
  !configuredAppUrl.includes("localhost") &&
  !configuredAppUrl.includes("127.0.0.1")
    ? configuredAppUrl
    : "https://quickweds.site";
const siteName = "QuickWeds";
const defaultTitle = "QuickWeds | Free Wedding Website Builder & Planner";
const defaultDescription =
  "Create a free wedding website with RSVP tracking, guest lists, seating charts, budgets, vendor planning, and a private planning dashboard for couples.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: defaultTitle,
  description: defaultDescription,
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  keywords: [
    "free wedding website builder",
    "wedding website",
    "wedding website builder",
    "online wedding planner",
    "digital wedding invitation",
    "wedding planner",
    "wedding planning app",
    "RSVP tracker",
    "guest list manager",
    "seating chart planner",
    "wedding budget tracker",
    "wedding vendor planner",
    "QuickWeds",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Wedding planning software",
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 960,
        alt: "QuickWeds wedding website builder and digital planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/logo.png"],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#FFF8F4",
};

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PWAInstaller from "@/components/PWAInstaller";

import { SectionProvider } from '@/context/SectionContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`
        ${inter.variable} ${montserrat.variable} ${playfair.variable}
        antialiased
      `}>
        <ThemeProvider>
          <AuthProvider>
            <SectionProvider>
              {children}
            </SectionProvider>
            <PWAInstaller />
            <Analytics />
            <SpeedInsights />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
