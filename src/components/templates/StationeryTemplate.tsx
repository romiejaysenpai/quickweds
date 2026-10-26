'use client';

import type { CSSProperties } from 'react';
import type { TemplateProps } from '@/types/wedding';
import { BioSection, CountdownTimer, DetailsSection, GallerySection, GiftSection, TimelineSection, VideoSection, AttireSection, SafeWeddingImage } from '@/components/wedding';
import { SharedNewSections } from './shared';
import styles from './StationeryTemplate.module.css';
import nativeStyles from './NativeTemplate.module.css';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import { MonogramMark } from '@/components/MonogramMark';

const THEMES = {
    'love-letter': { ink: '#563b2e', paper: '#fffaf0', accent: '#87563e', label: 'A little note, a lifetime of love', family: 'vintage' },
    'butter-blue': { ink: '#193a88', paper: '#fff4bd', accent: '#254caa', label: 'Good company. A beautiful day.', family: 'tropical' },
    'ribbon-romance': { ink: '#602b3c', paper: '#fff1f2', accent: '#82334b', label: 'Tied together, forever', family: 'romantic' },
} as const;

function Bow() {
    return <svg viewBox="0 0 240 100" className={styles.bow} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M120 44C88 6 24 8 42 39S103 65 120 44C152 6 216 8 198 39S137 65 120 44ZM116 48C104 67 95 80 73 91L79 72L61 73M124 48C136 67 145 80 167 91L161 72L179 73"/><ellipse cx="120" cy="45" rx="7" ry="9"/></svg>;
}

/** Three original stationery compositions, using the established guest sections. */
export default function StationeryTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const hasBackgroundChoice = ['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen'].includes(wedding.background_style || '');
    const titleStyle = getSectionTitleStyle(wedding);
    const id = wedding.template as keyof typeof THEMES;
    const theme = THEMES[id] || THEMES['love-letter'];
    const photo = wedding.hero_image?.trim() || wedding.couple_photo?.trim();
    const date = wedding.wedding_date ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`) : null;
    const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Our date, coming soon';
    const initials = wedding.logo_initials || `${wedding.bride_name?.[0] || ''}${wedding.groom_name?.[0] || ''}`;
    const monogram = <MonogramMark initials={initials} brideName={wedding.bride_name} groomName={wedding.groom_name} shape={wedding.logo_shape} color={wedding.logo_color} motifColor={wedding.motif_color || theme.accent} animation={wedding.logo_animation} fontFamily={wedding.logo_font ? `var(--font-${wedding.logo_font.toLowerCase()}, var(--font-serif))` : undefined} size="sm" />;
    const themedWedding = { ...wedding, motif_color: wedding.motif_color || theme.accent };
    const names = <h1 data-native-title className={`${styles.names} ${titleStyle.className}`} style={titleStyle.style}><span>{wedding.bride_name}</span><span className={styles.ampersand}>&amp;</span><span>{wedding.groom_name}</span></h1>;
    const details = <div className={styles.when}><p>{dateLabel}</p>{wedding.venue_name && <p>{wedding.venue_name}</p>}</div>;
    const actions = <div className={styles.actions}>{!wedding.is_thank_you_mode && <a data-wedding-control="primary" href="#rsvp">Kindly RSVP</a>}<a data-wedding-control="secondary" href="#details">The details</a></div>;
    const portrait = photo ? <SafeWeddingImage src={photo} alt={`${wedding.bride_name} and ${wedding.groom_name}`} className={styles.photo} loading="eager" /> : <div className={styles.monogram} aria-hidden="true">{monogram}</div>;
    return <div className={`${styles.page} ${styles[id] || ''} ${nativeStyles.native}`} data-stationery={id} data-native-card-custom={wedding.card_style && wedding.card_style !== 'default' ? 'true' : undefined} style={{ '--native-paper': 'var(--stationery-paper)', '--native-ink': 'var(--stationery-ink)', '--stationery-ink': hasBackgroundChoice ? 'var(--builder-ink)' : theme.ink, '--stationery-paper': hasBackgroundChoice ? 'var(--builder-paper)' : theme.paper, '--stationery-accent': wedding.motif_color || theme.accent } as CSSProperties}>
        <section className={styles.hero} aria-label="Wedding invitation">
            {id === 'butter-blue' ? <div data-native-card className={styles.postcard}>
                <div className={styles.postcardPhoto}>{portrait}<span className={styles.photoCaption}>With love, from us</span></div>
                <div className={styles.postcardCopy}><p className={styles.eyebrow}>You are warmly invited</p><span className={styles.stamp} aria-hidden="true">{monogram}</span>{names}{details}{actions}</div>
            </div> : id === 'ribbon-romance' ? <div data-native-card className={styles.ribbonCard}>
                <Bow /><p className={styles.eyebrow}>{theme.label}</p>{names}{details}{actions}
                {photo && <div className={styles.ribbonPortrait}>{portrait}</div>}
            </div> : <div className={styles.letterSpread}>
                <div data-native-card className={styles.letter}><p className={styles.handwritten}>To our favorite people,</p>{names}<p className={styles.note}>{wedding.quote || 'We would love nothing more than to celebrate this next chapter with you.'}</p>{details}{actions}<span className={styles.seal} aria-hidden="true">{monogram}</span></div>
                <div data-native-card className={styles.keepsake}>{portrait}<p className={styles.handwritten}>The beginning of our forever</p></div>
            </div>}
        </section>
        {!wedding.is_thank_you_mode && <CountdownTimer id="countdown" weddingDate={wedding.wedding_date} weddingTime={wedding.wedding_time} brideName={wedding.bride_name} groomName={wedding.groom_name} venueName={wedding.venue_name} venueAddress={wedding.venue_address} template={wedding.template} motifColor={themedWedding.motif_color} />}
        <DetailsSection id="details" wedding={themedWedding} />
        <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={themedWedding} />
        <BioSection id="bio" wedding={themedWedding} />
        <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={themedWedding.motif_color} galleryLayout={wedding.gallery_layout || 'grid'} />
        <VideoSection id="video" video={wedding.teaser_video} poster={photo} template={wedding.template} motifColor={themedWedding.motif_color} templateStyle={wedding.template_style} />
        <AttireSection wedding={themedWedding} /><GiftSection id="gift" wedding={themedWedding} />
        <SharedNewSections id="additional" wedding={themedWedding} isExpired={isExpired} />
    </div>;
}
