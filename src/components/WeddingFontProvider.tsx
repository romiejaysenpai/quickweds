/**
 * WeddingFontProvider
 * 
 * Lazily loads the full set of 35+ wedding template fonts.
 * These fonts are ONLY needed on pages that render or preview wedding templates:
 * - /builder (BuilderForm)
 * - /w/[slug] (public wedding pages)
 * - /preview
 * 
 * The root layout only loads 3 core UI fonts (Inter, Playfair, Montserrat).
 * This component injects the remaining font CSS variables into a wrapper div
 * so child components can reference them via CSS custom properties.
 * 
 * Usage: Wrap any page/layout that needs the full font catalog:
 *   <WeddingFontProvider>{children}</WeddingFontProvider>
 */

import {
    Cormorant_Garamond, Great_Vibes, Cinzel,
    EB_Garamond, Bodoni_Moda, Prata, Lora, Cardo, Libre_Baskerville, Marcellus, Forum, Alice,
    Alex_Brush, Allura, Arizonia, Dancing_Script, Italianno, Pinyon_Script, Sacramento, Tangerine, Parisienne,
    Tenor_Sans, Questrial, Syne, Spectral, Fauna_One,
    Abril_Fatface, Cormorant_Upright, Old_Standard_TT, Josefin_Sans, Libre_Caslon_Text, Quattrocento,
    Mrs_Saint_Delafield, Monsieur_La_Doulaise, Homemade_Apple, Herr_Von_Muellerhoff,
    Outfit, Space_Grotesk, Fraunces, Cormorant_SC, Lavishly_Yours
} from 'next/font/google';

// --- SERIF & CLASSIC ---
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], display: 'swap' });
const ebGaramond = EB_Garamond({ variable: "--font-eb-garamond", subsets: ["latin"], display: 'swap' });
const bodoniModa = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"], display: 'swap' });
const prata = Prata({ variable: "--font-prata", weight: "400", subsets: ["latin"], display: 'swap' });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], display: 'swap' });
const cardo = Cardo({ variable: "--font-cardo", weight: "400", subsets: ["latin"], display: 'swap' });
const libreBaskerville = Libre_Baskerville({ variable: "--font-libre", weight: ["400", "700"], subsets: ["latin"], display: 'swap' });
const marcellus = Marcellus({ variable: "--font-marcellus", weight: "400", subsets: ["latin"], display: 'swap' });
const forum = Forum({ variable: "--font-forum", weight: "400", subsets: ["latin"], display: 'swap' });
const alice = Alice({ variable: "--font-alice", weight: "400", subsets: ["latin"], display: 'swap' });
const spectral = Spectral({ variable: "--font-spectral", subsets: ["latin"], weight: ["200", "300", "400", "700"], display: 'swap' });
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], display: 'swap' });
const abril = Abril_Fatface({ variable: "--font-abril", weight: "400", subsets: ["latin"], display: 'swap' });
const cormorantUpright = Cormorant_Upright({ variable: "--font-cormorant-upright", weight: ["300", "400", "500", "600", "700"], subsets: ["latin"], display: 'swap' });
const oldStandard = Old_Standard_TT({ variable: "--font-old-standard", weight: ["400", "700"], subsets: ["latin"], display: 'swap' });
const caslon = Libre_Caslon_Text({ variable: "--font-caslon", weight: ["400", "700"], subsets: ["latin"], display: 'swap' });
const quattrocento = Quattrocento({ variable: "--font-quattrocento", weight: ["400", "700"], subsets: ["latin"], display: 'swap' });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: 'swap' });
const cormorantSC = Cormorant_SC({ variable: "--font-cormorant-sc", weight: ["300", "400", "700"], subsets: ["latin"], display: 'swap' });

// --- SANS ---
const tenorSans = Tenor_Sans({ variable: "--font-tenor", weight: "400", subsets: ["latin"], display: 'swap' });
const questrial = Questrial({ variable: "--font-questrial", weight: "400", subsets: ["latin"], display: 'swap' });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"], display: 'swap' });
const faunaOne = Fauna_One({ variable: "--font-fauna", weight: "400", subsets: ["latin"], display: 'swap' });
const josefin = Josefin_Sans({ variable: "--font-josefin", subsets: ["latin"], display: 'swap' });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], display: 'swap' });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space", subsets: ["latin"], display: 'swap' });

// --- SCRIPT & CALLIGRAPHY ---
const greatVibes = Great_Vibes({ variable: "--font-script", weight: "400", subsets: ["latin"], display: 'swap' });
const alexBrush = Alex_Brush({ variable: "--font-alex", weight: "400", subsets: ["latin"], display: 'swap' });
const allura = Allura({ variable: "--font-allura", weight: "400", subsets: ["latin"], display: 'swap' });
const arizonia = Arizonia({ variable: "--font-arizonia", weight: "400", subsets: ["latin"], display: 'swap' });
const dancingScript = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"], display: 'swap' });
const italianno = Italianno({ variable: "--font-italianno", weight: "400", subsets: ["latin"], display: 'swap' });
const pinyonScript = Pinyon_Script({ variable: "--font-pinyon", weight: "400", subsets: ["latin"], display: 'swap' });
const sacramento = Sacramento({ variable: "--font-sacramento", weight: "400", subsets: ["latin"], display: 'swap' });
const tangerine = Tangerine({ variable: "--font-tangerine", weight: ["400", "700"], subsets: ["latin"], display: 'swap' });
const parisienne = Parisienne({ variable: "--font-parisienne", weight: "400", subsets: ["latin"], display: 'swap' });
const mrsSaint = Mrs_Saint_Delafield({ variable: "--font-mrs-saint", weight: "400", subsets: ["latin"], display: 'swap' });
const monsieur = Monsieur_La_Doulaise({ variable: "--font-monsieur", weight: "400", subsets: ["latin"], display: 'swap' });
const homemade = Homemade_Apple({ variable: "--font-homemade", weight: "400", subsets: ["latin"], display: 'swap' });
const herr = Herr_Von_Muellerhoff({ variable: "--font-herr", weight: "400", subsets: ["latin"], display: 'swap' });
const lavishly = Lavishly_Yours({ variable: "--font-lavishly", weight: "400", subsets: ["latin"], display: 'swap' });

const WEDDING_FONT_CLASSES = [
    cormorant, ebGaramond, bodoniModa, prata, lora, cardo, libreBaskerville,
    marcellus, forum, alice, spectral, cinzel, abril, cormorantUpright,
    oldStandard, caslon, quattrocento, fraunces, cormorantSC,
    tenorSans, questrial, syne, faunaOne, josefin, outfit, spaceGrotesk,
    greatVibes, alexBrush, allura, arizonia, dancingScript, italianno,
    pinyonScript, sacramento, tangerine, parisienne, mrsSaint, monsieur,
    homemade, herr, lavishly,
].map(f => f.variable).join(' ');

export default function WeddingFontProvider({ children }: { children: React.ReactNode }) {
    return (
        <div className={WEDDING_FONT_CLASSES}>
            {children}
        </div>
    );
}
