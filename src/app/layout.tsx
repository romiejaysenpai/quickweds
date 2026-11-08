import type { Metadata, Viewport } from "next";
import {
  Inter, Playfair_Display, Montserrat
} from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { homeDescription, homeTitle, siteName, siteOrigin, sitePreviewImage } from "@/lib/seo";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: homeTitle,
    template: "%s | QuickWeds",
  },
  description: homeDescription,
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  robots: {
    googleBot: {
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
    title: homeTitle,
    description: homeDescription,
    images: [
      {
        url: sitePreviewImage,
        width: 1080,
        height: 1080,
        alt: "QuickWeds wedding website builder and digital planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
    images: [
      {
        url: sitePreviewImage,
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
    <html lang="en">
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
