'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useSectionActions } from '@/context/SectionContext';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import type { Wedding } from '@/types/wedding';
import SafeWeddingImage from './SafeWeddingImage';

interface VideoSectionProps {
    video?: string;
    poster?: string;
    id: string;
    template?: string;
    motifColor?: string;
    templateStyle?: string;
    wedding?: Wedding;
}

function getEmbedUrl(url: string, autoplay: boolean): string | null {
    const autoplayParam = autoplay ? '1' : '0';
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, '');
        if (host === 'youtube.com' || host === 'm.youtube.com') {
            const v = parsed.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${encodeURIComponent(v)}?autoplay=${autoplayParam}&rel=0`;
            const shorts = parsed.pathname.match(/^\/shorts\/([^/]+)/);
            if (shorts?.[1]) return `https://www.youtube.com/embed/${encodeURIComponent(shorts[1])}?autoplay=${autoplayParam}&rel=0`;
            if (parsed.pathname.startsWith('/embed/')) return `${url}${url.includes('?') ? '&' : '?'}autoplay=${autoplayParam}`;
        }
        if (host === 'youtu.be') {
            const id = parsed.pathname.replace(/^\//, '').split('/')[0];
            if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=${autoplayParam}&rel=0`;
        }
        if (host === 'vimeo.com') {
            const id = parsed.pathname.replace(/^\//, '').split('/')[0];
            if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}?autoplay=${autoplayParam}`;
        }
    } catch {
        return null;
    }
    return null;
}

export default function VideoSection({
    video,
    poster,
    id,
    template,
    motifColor,
    wedding,
}: VideoSectionProps) {
    const { registerSection, unregisterSection } = useSectionActions();
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        if (video) registerSection(id, 'Video');
        return () => unregisterSection(id);
    }, [id, video, registerSection, unregisterSection]);

    if (!video) return null;

    const visual = getTemplateVisualProfile(template || wedding?.template || 'classic', motifColor || wedding?.motif_color || '#D16C78', false, wedding?.card_style);
    const titleStyle = wedding ? getSectionTitleStyle(wedding, visual.headingClass) : { className: visual.headingClass, style: undefined };
    const embedUrl = getEmbedUrl(video, playing);
    const isSharp = visual.isSharp;
    const isDark = visual.isDark;
    const frameRadius = isSharp ? 'rounded-none' : 'rounded-3xl';
    const mediaRadius = isSharp ? 'rounded-none' : 'rounded-2xl';

    const titleText =
        visual.mood === 'cinematic'
            ? 'The Wedding Film'
            : visual.mood === 'editorial'
              ? 'Motion Edit'
              : 'A Glimpse of the Day';

    return (
        <section
            data-wedding-section="video"
            id={id}
            className={`relative overflow-hidden py-16 sm:py-24 ${visual.sectionClass}`}
            style={visual.sectionStyle}
        >
            <div className={`relative mx-auto max-w-5xl px-4 sm:px-6 md:px-8`}>
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
                        <div className="mb-4 flex items-center justify-center">
                            <span
                                data-wedding-badge="true"
                                className={visual.badgeStyleClass || `text-[11px] font-medium uppercase ${visual.eyebrowClass}`}
                            >
                                Wedding Film
                            </span>
                        </div>
                        <h2 className={`qw-section-title text-4xl leading-tight sm:text-5xl md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>
                            {titleText}
                        </h2>
                        <div data-wedding-divider="true" className={`mx-auto mt-6 ${visual.dividerClass}`} />
                    </div>

                    <div data-wedding-card="true" className={`relative mx-auto max-w-4xl overflow-hidden p-2 sm:p-3 ${frameRadius} ${visual.cardClass}`}>
                        <div className={`relative aspect-video w-full overflow-hidden bg-black ${mediaRadius}`}>
                            {!playing && poster ? (
                                <button
                                    type="button"
                                    onClick={() => setPlaying(true)}
                                    aria-label="Play wedding teaser video"
                                    className="group relative block h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                                >
                                    <SafeWeddingImage
                                        src={poster}
                                        alt="Wedding film preview"
                                        className="h-full w-full object-cover object-[50%_30%] brightness-[0.82] transition-transform duration-1000 group-hover:scale-[1.03]"
                                        loading="lazy"
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                                        <span
                                            className={`flex h-16 w-16 items-center justify-center border border-white/60 bg-black/35 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20 ${
                                                isSharp ? 'rounded-none' : 'rounded-full'
                                            }`}
                                        >
                                            <Play className="ml-1 h-6 w-6 fill-white text-white sm:h-7 sm:w-7" aria-hidden="true" />
                                        </span>
                                        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/90">
                                            Play Our Film
                                        </span>
                                    </div>
                                </button>
                            ) : embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    title="Wedding teaser video"
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    src={video}
                                    className={`h-full w-full object-contain ${isDark ? '' : 'bg-black'}`}
                                    controls
                                    autoPlay={playing}
                                    poster={poster}
                                    preload="metadata"
                                    playsInline
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
