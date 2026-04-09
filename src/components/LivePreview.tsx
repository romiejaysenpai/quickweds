import { Heart, MapPin, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import DecorativeLayer from './DecorativeLayer';

// Maps font selections to their Tailwind classes
const getFontClass = (fontId: string) => {
    const fontMap: Record<string, string> = {
        'Elegant': 'font-serif', 'Classic': 'font-classic', 'Modern': 'font-modern',
        'Romantic': 'font-cursive', 'Traditional': 'font-elegant', 'Renaissance': 'font-eb',
        'Luxe': 'font-bodoni', 'Poetic': 'font-prata', 'Storyteller': 'font-lora',
        'Academic': 'font-cardo', 'Editorial': 'font-libre', 'Deco': 'font-marcellus',
        'Ancient': 'font-forum', 'Fairytale': 'font-alice', 'Artistic': 'font-spectral',
        'Nature': 'font-fauna', 'Chic': 'font-tenor', 'Clean': 'font-questrial',
        'Bold': 'font-syne', 'Calligraphy': 'font-alex', 'SoftScript': 'font-allura',
        'Whimsy': 'font-arizonia', 'Handwritten': 'font-dancing', 'Italian': 'font-italianno',
        'PremiumScript': 'font-pinyon', 'MinimalScript': 'font-sacramento', 'Ornate': 'font-tangerine',
        'Paris': 'font-parisienne', 'Abril': 'font-abril', 'Upright': 'font-cormorant-upright',
        'Vintage': 'font-old-standard', 'Josefin': 'font-josefin', 'Caslon': 'font-caslon',
        'Quattro': 'font-quattrocento', 'Saint': 'font-mrs-saint', 'Monsieur': 'font-monsieur',
        'Handmade': 'font-homemade', 'Mueller': 'font-herr', 'Lavish': 'font-lavishly',
        'RoyalSC': 'font-cormorant-sc', 'ModernGrotesk': 'font-space', 'VogueEdit': 'font-bodoni',
        'Estate': 'font-fraunces'
    };
    return fontMap[fontId] || 'font-serif';
};

const getBackgroundColor = (id: string) => {
    const bgMap: Record<string, string> = {
        'white': '#FFFFFF',
        'cream': '#FFF8F4',
        'satin': '#FDF5E6',
        'paper': '#F4F1EA',
        'minimal': '#F9F9F9',
        'rose': '#FFF5F5',
        'linen': '#FAF9F6'
    };
    return bgMap[id] || '#FFFFFF';
};

export default function LivePreview({ formData, previews }: { formData: any; previews: any }) {
    const headingFont = getFontClass(formData.fontStyle);
    const logoFont = getFontClass(formData.logoFont);
    const primaryColor = formData.motifColor || '#C08081';

    const bride = formData.brideName || 'Sarah';
    const groom = formData.groomName || 'John';
    const date = formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'October 24, 2024';
    const bgColor = getBackgroundColor(formData.backgroundStyle);

    return (
        <div className="w-full rounded-3xl overflow-hidden border-4 border-white shadow-xl flex flex-col items-center justify-start text-center relative h-[600px] select-none" style={{ backgroundColor: bgColor }}>
            <div className={`texture-overlay texture-${formData.backgroundStyle}`} />
            {formData.accentStyle && formData.accentStyle !== 'none' && (
                <>
                    <DecorativeLayer type={formData.accentStyle} color={primaryColor} position="top-right" className="absolute top-24 -right-10 scale-75 pointer-events-none opacity-40 mix-blend-multiply z-30" />
                    <DecorativeLayer type={formData.accentStyle} color={primaryColor} position="bottom-left" className="absolute bottom-10 -left-10 scale-75 pointer-events-none opacity-40 mix-blend-multiply z-30" />
                    
                    {/* Extra floating bits for the preview frame */}
                    <DecorativeLayer type={formData.accentStyle} color={primaryColor} position="center" className="absolute top-1/3 left-0 w-24 opacity-20 blur-[1px] -z-10" />
                    <DecorativeLayer type={formData.accentStyle} color={primaryColor} position="center" className="absolute top-2/3 right-0 w-20 opacity-15 -z-10" />
                </>
            )}
            {/* Template Header / Hero */}
            <div className="w-full relative h-[45%] bg-neutralish flex items-center justify-center overflow-hidden">
                {previews.heroImage ? (
                    <img src={previews.heroImage} className="w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="w-full h-full bg-border/30 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-primary/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral" />

                {/* Monogram Overlay */}
                {formData.logoShape !== 'none' && (
                    <div className={`absolute top-6 w-16 h-16 flex items-center justify-center bg-white/10 backdrop-blur-md text-xl leading-none shadow-sm ${formData.logoShape === 'circle' ? 'rounded-full' :
                            formData.logoShape === 'square' ? 'rounded-2xl' : 'rounded-none bg-transparent backdrop-blur-none border-none shadow-none'
                        } ${formData.logoShape !== 'minimal' ? 'border border-white/30' : ''}`}
                        style={{ color: formData.logoColor || primaryColor }}>
                        <span className={`${logoFont} tracking-tight`}>
                            {formData.logoInitials || `${bride[0]}&${groom[0]}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="px-6 py-8 relative w-full flex-1 flex flex-col items-center bg-transparent z-10 -mt-10 rounded-t-3xl">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full">

                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold mb-2 text-text-secondary/70">You are invited to the wedding of</p>
                        <h1 className={`text-4xl ${headingFont} leading-tight`} style={{ color: primaryColor }}>
                            {bride} <br /> <span className="text-xl italic text-text-secondary opacity-60">&</span> <br /> {groom}
                        </h1>
                    </div>

                    {formData.quote && (
                        <p className="italic text-sm text-text-secondary/80 max-w-[80%] mx-auto">"{formData.quote}"</p>
                    )}

                    <div className="w-12 h-[1px] bg-border mx-auto my-4" />

                    <div className="space-y-3 text-xs text-text-secondary">
                        <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                            <span>{formData.venueName || 'The Grand Plaza'}</span>
                        </div>
                    </div>

                    <button className="mt-6 px-6 py-2 rounded-full text-white text-xs font-bold tracking-wider uppercase transition-transform hover:scale-105"
                        style={{ backgroundColor: primaryColor }}>
                        RSVP Now
                    </button>

                    {formData.template && (
                        <div className="absolute bottom-4 left-0 w-full text-center">
                            <span className="text-[9px] font-mono text-text-secondary/40 uppercase tracking-widest bg-white/50 px-2 py-1 rounded">Template: {formData.template}</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
