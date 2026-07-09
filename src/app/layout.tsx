import type { Metadata, Viewport } from "next";
import {
  Inter, Playfair_Display, Montserrat
} from "next/font/google";
import Script from "next/script";
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
const defaultTitle = "Free Wedding Website Builder & RSVP Planner | QuickWeds";
const defaultDescription =
  "Create a free wedding website, send digital invitations, manage RSVPs, organize guests, seating, budgets, suppliers, photos, and wedding-day plans in QuickWeds.";
const landingPreviewImageUrl =
  "https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Minimalist%20Neutral%20Multi%20Device%20Computer%20Mockup%20Website%20Launch%20Instagram%20Post.png";
const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: defaultTitle,
    template: "%s | QuickWeds",
  },
  description: defaultDescription,
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  keywords: [
    "free wedding website builder",
    "wedding website",
    "wedding website builder",
    "online wedding planner",
    "digital wedding invitation",
    "digital wedding invitations",
    "online wedding invitation",
    "wedding planner",
    "wedding planning app",
    "wedding planning website",
    "wedding RSVP website",
    "RSVP tracker",
    "online RSVP",
    "guest list manager",
    "seating chart planner",
    "wedding budget tracker",
    "wedding vendor planner",
    "wedding supplier directory",
    "Philippines wedding suppliers",
    "wedding day coordinator tools",
    "QR seat finder",
    "guest photo sharing",
    "thank you note builder",
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
        url: landingPreviewImageUrl,
        width: 1080,
        height: 1080,
        alt: "QuickWeds wedding website builder and digital planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: landingPreviewImageUrl,
        alt: "QuickWeds wedding website builder and digital planner",
      },
    ],
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
import NativeAppChrome from "@/components/NativeAppChrome";

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
            <NativeAppChrome />
            <PWAInstaller />
            <Analytics />
            <SpeedInsights />
            {googleAnalyticsId && (
              <>
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
                  strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                  {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${googleAnalyticsId}');
                  `}
                </Script>
              </>
            )}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
