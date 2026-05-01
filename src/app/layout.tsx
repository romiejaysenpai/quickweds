import type { Metadata, Viewport } from "next";
import {
  Inter, Playfair_Display, Cormorant_Garamond, Great_Vibes, Montserrat, Cinzel,
  EB_Garamond, Bodoni_Moda, Prata, Lora, Cardo, Libre_Baskerville, Marcellus, Forum, Alice,
  Alex_Brush, Allura, Arizonia, Dancing_Script, Italianno, Pinyon_Script, Sacramento, Tangerine, Parisienne,
  Tenor_Sans, Questrial, Syne, Spectral, Fauna_One,
  Abril_Fatface, Cormorant_Upright, Old_Standard_TT, Josefin_Sans, Libre_Caslon_Text, Quattrocento,
  Mrs_Saint_Delafield, Monsieur_La_Doulaise, Homemade_Apple, Herr_Von_Muellerhoff,
  Outfit, Space_Grotesk, Fraunces, Cormorant_SC, Lavishly_Yours
} from "next/font/google";
import "./globals.css";

// --- SANS & MODERN ---
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const tenorSans = Tenor_Sans({ variable: "--font-tenor", weight: "400", subsets: ["latin"] });
const questrial = Questrial({ variable: "--font-questrial", weight: "400", subsets: ["latin"] });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });
const faunaOne = Fauna_One({ variable: "--font-fauna", weight: "400", subsets: ["latin"] });
const josefin = Josefin_Sans({ variable: "--font-josefin", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });

// --- SERIF & CLASSIC ---
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const ebGaramond = EB_Garamond({ variable: "--font-eb-garamond", subsets: ["latin"] });
const bodoniModa = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"] });
const prata = Prata({ variable: "--font-prata", weight: "400", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });
const cardo = Cardo({ variable: "--font-cardo", weight: "400", subsets: ["latin"] });
const libreBaskerville = Libre_Baskerville({ variable: "--font-libre", weight: ["400", "700"], subsets: ["latin"] });
const marcellus = Marcellus({ variable: "--font-marcellus", weight: "400", subsets: ["latin"] });
const forum = Forum({ variable: "--font-forum", weight: "400", subsets: ["latin"] });
const alice = Alice({ variable: "--font-alice", weight: "400", subsets: ["latin"] });
const spectral = Spectral({ variable: "--font-spectral", subsets: ["latin"], weight: ["200", "300", "400", "700"] });
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"] });
const abril = Abril_Fatface({ variable: "--font-abril", weight: "400", subsets: ["latin"] });
const cormorantUpright = Cormorant_Upright({ variable: "--font-cormorant-upright", weight: ["300", "400", "500", "600", "700"], subsets: ["latin"] });
const oldStandard = Old_Standard_TT({ variable: "--font-old-standard", weight: ["400", "700"], subsets: ["latin"] });
const caslon = Libre_Caslon_Text({ variable: "--font-caslon", weight: ["400", "700"], subsets: ["latin"] });
const quattrocento = Quattrocento({ variable: "--font-quattrocento", weight: ["400", "700"], subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const cormorantSC = Cormorant_SC({ variable: "--font-cormorant-sc", weight: ["300", "400", "700"], subsets: ["latin"] });

// --- SCRIPT & CALLIGRAPHY ---
const greatVibes = Great_Vibes({ variable: "--font-script", weight: "400", subsets: ["latin"] });
const alexBrush = Alex_Brush({ variable: "--font-alex", weight: "400", subsets: ["latin"] });
const allura = Allura({ variable: "--font-allura", weight: "400", subsets: ["latin"] });
const arizonia = Arizonia({ variable: "--font-arizonia", weight: "400", subsets: ["latin"] });
const dancingScript = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"] });
const italianno = Italianno({ variable: "--font-italianno", weight: "400", subsets: ["latin"] });
const pinyonScript = Pinyon_Script({ variable: "--font-pinyon", weight: "400", subsets: ["latin"] });
const sacramento = Sacramento({ variable: "--font-sacramento", weight: "400", subsets: ["latin"] });
const tangerine = Tangerine({ variable: "--font-tangerine", weight: ["400", "700"], subsets: ["latin"] });
const parisienne = Parisienne({ variable: "--font-parisienne", weight: "400", subsets: ["latin"] });
const mrsSaint = Mrs_Saint_Delafield({ variable: "--font-mrs-saint", weight: "400", subsets: ["latin"] });
const monsieur = Monsieur_La_Doulaise({ variable: "--font-monsieur", weight: "400", subsets: ["latin"] });
const homemade = Homemade_Apple({ variable: "--font-homemade", weight: "400", subsets: ["latin"] });
const herr = Herr_Von_Muellerhoff({ variable: "--font-herr", weight: "400", subsets: ["latin"] });
const lavishly = Lavishly_Yours({ variable: "--font-lavishly", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickWeds | Instant Elegant Wedding Landing Pages",
  description: "Create a beautiful, mobile-first wedding invitation landing page with an integrated RSVP system in minutes.",
  applicationName: "QuickWeds",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QuickWeds",
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

import { SectionProvider } from '@/context/SectionContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`
        ${inter.variable} ${montserrat.variable} ${tenorSans.variable} ${questrial.variable} ${syne.variable} ${faunaOne.variable} ${josefin.variable} ${outfit.variable} ${spaceGrotesk.variable}
        ${playfair.variable} ${cormorant.variable} ${ebGaramond.variable} ${bodoniModa.variable} ${prata.variable} ${lora.variable} ${cardo.variable} ${libreBaskerville.variable} ${marcellus.variable} ${forum.variable} ${alice.variable} ${spectral.variable} ${cinzel.variable} ${abril.variable} ${cormorantUpright.variable} ${oldStandard.variable} ${caslon.variable} ${quattrocento.variable} ${fraunces.variable} ${cormorantSC.variable}
        ${greatVibes.variable} ${alexBrush.variable} ${allura.variable} ${arizonia.variable} ${dancingScript.variable} ${italianno.variable} ${pinyonScript.variable} ${sacramento.variable} ${tangerine.variable} ${parisienne.variable} ${mrsSaint.variable} ${monsieur.variable} ${homemade.variable} ${herr.variable} ${lavishly.variable}
        antialiased
      `}>
        <ThemeProvider>
          <AuthProvider>
            <SectionProvider>
              {children}
            </SectionProvider>
            <Analytics />
            <SpeedInsights />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
