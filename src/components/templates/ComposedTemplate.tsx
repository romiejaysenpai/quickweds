'use client';

import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import type { TemplateProps } from '@/types/wedding';
import { BioSection, CountdownTimer, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection, SafeWeddingImage } from '@/components/wedding';
import {
    formatWeddingDate,
    resolveTemplateCopy,
    SharedNewSections,
    TemplateHeroActions,
    WeddingMonogram,
} from './shared';

type Composition = 'v2' | 'v3' | 'v4' | 'v5';

/** Shared compositions retain each family's palette, type, frames and ornaments. */
export default function ComposedTemplate({ wedding, gallery, isExpired, composition }: TemplateProps & { composition: Composition }) {
    const visual = getTemplateVisualProfile(wedding.template, wedding.motif_color, false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding);
    const hasTitleChoice = Boolean(
        wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style)
    );
    const heroImage = wedding.hero_image || wedding.couple_photo;
    const photos = [...new Set([heroImage, ...gallery].filter((src): src is string => Boolean(src)))];
    const date = formatWeddingDate(wedding.wedding_date);
    const copy = resolveTemplateCopy(wedding);
    const eyebrow = wedding.is_thank_you_mode
        ? 'With heartfelt thanks'
        : wedding.is_save_the_date
          ? 'Save the date'
          : 'Together with our favorite people';

    const names = (
        <h1
            className={`wedding-composed-names ${visual.headingClass} ${titleStyle.className}`}
            style={hasTitleChoice ? titleStyle.style : undefined}
        >
            <span>{wedding.bride_name}</span>
            <span className="wedding-ampersand">&amp;</span>
            <span>{wedding.groom_name}</span>
        </h1>
    );
    const details = <div className="mt-7 space-y-2 text-base leading-relaxed"><p>{date}</p><p className={visual.bodyClass}>{wedding.venue_name}</p></div>;
    const invitation = (
        <div className="wedding-composed-copy">
            <p className="mb-6 text-xs uppercase tracking-[0.22em] opacity-80">{eyebrow}</p>
            {names}
            {details}
            <div className={`mt-8 flex flex-col gap-3 ${composition === 'v2' ? 'items-center md:items-start' : 'items-center'}`}>
                <a
                    href={copy.ctaHref}
                    data-wedding-control="primary"
                    className={`inline-flex min-h-12 items-center justify-center border border-current px-8 py-3 text-sm font-medium tracking-wide transition-colors hover:bg-current/10 ${visual.isSharp ? '' : 'rounded-full'}`}
                >
                    {wedding.is_thank_you_mode ? 'View Memories' : wedding.is_save_the_date ? 'Weekend Preview' : 'Join our celebration'}
                </a>
                <TemplateHeroActions
                    wedding={wedding}
                    variant={visual.isDark ? 'noir' : 'editorial'}
                    motifColor={wedding.motif_color}
                    className={composition === 'v2' ? 'justify-center md:justify-start' : 'justify-center'}
                />
            </div>
        </div>
    );
    const portrait = heroImage ? (
        <SafeWeddingImage src={heroImage} alt={`${wedding.bride_name} and ${wedding.groom_name}`} className="wedding-composed-photo" loading="eager" fetchPriority="high" />
    ) : (
        <div className="wedding-composed-monogram rounded-2xl border border-current/15 p-8" aria-hidden="true">
            <WeddingMonogram wedding={wedding} className="mx-auto" />
        </div>
    );
    const story = <BioSection key="story" id="bio" wedding={wedding} />;
    const album = <GallerySection key="gallery" id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} wedding={wedding} galleryLayout={wedding.gallery_layout && wedding.gallery_layout !== 'auto' ? wedding.gallery_layout : composition === 'v2' ? 'horizontal' : composition === 'v3' ? 'vertical' : composition === 'v4' ? 'bento' : 'grid'} />;
    const essentials = <DetailsSection key="details" id="details" wedding={wedding} />;
    const schedule = <TimelineSection key="timeline" id="timeline" timeline={wedding.program_timeline || ''} wedding={wedding} />;
    const sections = composition === 'v2' ? [story, album, essentials, schedule]
        : composition === 'v3' ? [essentials, schedule, story, album]
        : composition === 'v4' ? [album, story, essentials, schedule]
        : [essentials, schedule, story, album];
    return (
        <div className={`wedding-composition ${visual.sectionClass}`} data-composition={composition} data-mood={visual.mood} style={visual.sectionStyle}>
            <section className={`wedding-composed-hero wedding-composed-${composition}`} aria-label="Wedding invitation">
                {composition === 'v2' && <><div className={`wedding-composed-image ${visual.imageFrameClass}`}>{portrait}</div>{invitation}</>}
                {composition === 'v3' && <><div className={`wedding-composed-image ${visual.imageFrameClass}`}>{portrait}</div>{invitation}</>}
                {composition === 'v4' && <>{invitation}{photos.length > 0 && <div className="wedding-composed-spread">{photos.slice(0, 3).map((src, index) => <SafeWeddingImage key={src} src={src} alt={`${wedding.bride_name} and ${wedding.groom_name}, photograph ${index + 1}`} className="wedding-composed-photo" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : undefined} />)}</div>}</>}
                {composition === 'v5' && <><div className="mb-6"><WeddingMonogram wedding={wedding} className="mx-auto" /></div>{invitation}</>}
            </section>
            {!wedding.is_thank_you_mode && <CountdownTimer id="countdown" weddingDate={wedding.wedding_date} weddingTime={wedding.wedding_time} brideName={wedding.bride_name} groomName={wedding.groom_name} venueName={wedding.venue_name} venueAddress={wedding.venue_address} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} wedding={wedding} />}
            {sections}
            <VideoSection id="video" video={wedding.teaser_video} poster={heroImage} template={wedding.template} motifColor={wedding.motif_color} templateStyle={wedding.template_style} wedding={wedding} />
            <AttireSection wedding={wedding} />
            <GiftSection id="gift" wedding={wedding} />
            <SharedNewSections id="additional" wedding={wedding} isExpired={isExpired} />
        </div>
    );
}
