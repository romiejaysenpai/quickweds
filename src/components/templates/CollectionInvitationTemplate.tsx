'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Camera, ChevronLeft, ChevronRight, Church, Heart, Music, Sparkles, Utensils, Wine, ZoomIn } from 'lucide-react';
import type { TemplateProps } from '@/types/wedding';
import { DetailsSection, GiftSection, SafeWeddingImage, VideoSection } from '@/components/wedding';
import GallerySection, { Lightbox } from '@/components/wedding/GallerySection';
import AttireIllustration from '@/components/AttireIllustration';
import { useSectionContext } from '@/context/SectionContext';
import { getReferenceInvitation } from '@/lib/reference-invitations';
import { getInvitationTheme } from '@/lib/invitation-theme';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import { parseDressCodeValue } from '@/lib/dress-code';
import { timelineIconKind } from '@/lib/wedding-timeline';
import { WeddingMonogram, SharedNewSections, parseTimelineItems, useCountdown } from './shared';
import styles from './CollectionInvitationTemplate.module.css';

/** Decoration is separate from the editable content. All paths are original vector ornaments. */
function Branch({ className = '', flowers = false }: { className?: string; flowers?: boolean }) {
    return <svg className={`${styles.branch} ${className}`} viewBox="0 0 280 200" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.1"><path d="M12 185Q121 152 250 18M60 166Q81 117 93 70M131 120Q178 127 230 104" />
            {[0, 1, 2, 3, 4, 5].map(i => <g key={i} transform={`translate(${48 + i * 34} ${172 - i * 25}) rotate(${i % 2 ? 32 : -36})`}><path d="M0 0Q-49-44-48-11Q-35 8 0 0Z" fill="currentColor" fillOpacity=".2"/><path d="M0 0Q3-50 29-45Q39-24 0 0Z" fill="currentColor" fillOpacity=".13" /></g>)}
        </g>
        {flowers && [0, 1, 2].map(i => <g key={i} transform={`translate(${85 + i * 52} ${132 - i * 33})`} stroke="currentColor" strokeWidth=".65">{[0, 72, 144, 216, 288].map(angle => <ellipse key={angle} cy="-17" rx="14" ry="23" transform={`rotate(${angle})`} fill="var(--ref-paper)"/>)}<circle r="6" fill="currentColor" fillOpacity=".55"/></g>)}
    </svg>;
}

function Seashell({ className = '' }: { className?: string }) {
    return <svg className={`${styles.shell} ${className}`} viewBox="0 0 180 150" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M56 130C39 112-7 69 19 38C30 20 47 30 48 25C50 5 79 3 90 17C101 3 130 5 132 25C133 30 150 20 161 38C187 69 141 112 124 130L111 143H69Z" fill="currentColor" fillOpacity=".055"/>{[20, 44, 67, 90, 113, 136, 160].map(x => <path key={x} d={`M${x} 36Q${x} 80 90 132`} />)}<path d="M57 132H123M67 139H113"/></svg>;
}

function Calla() {
    return <svg className={styles.calla} viewBox="0 0 130 280" fill="none" aria-hidden="true"><path d="M28 270Q94 182 79 73M45 247Q20 205 12 173Q49 183 59 223" stroke="currentColor" strokeWidth="1.4"/><path d="M79 116C79 58 19 60 18 24C66 36 82 12 116 8C97 46 124 84 79 116Z" fill="var(--ref-paper)" stroke="currentColor" strokeWidth=".9"/><path d="M79 111Q72 45 40 34M79 111Q104 62 102 27" stroke="currentColor" strokeOpacity=".5"/><path d="M78 81L68 42" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity=".65"/></svg>;
}

function Snow() {
    return <svg className={styles.snow} viewBox="0 0 360 210" fill="none" stroke="currentColor" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6].map(i => <g key={i} transform={`translate(${25 + i * 49} ${30 + i % 3 * 57})`} opacity={.15 + i % 3 * .15}>{[0, 60, 120].map(angle => <g key={angle} transform={`rotate(${angle})`}><path d="M-14 0H14M-9-5L-4 0L-9 5M9-5L4 0L9 5"/></g>)}</g>)}</svg>;
}

function Lights() {
    return <svg className={styles.lights} viewBox="0 0 500 180" fill="none" aria-hidden="true">{[0, 1, 2].map(row => <g key={row} transform={`translate(0 ${row * 51})`}><path d="M-20 5Q230 115 520 20" stroke="currentColor" strokeWidth=".8"/>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <g key={i} transform={`translate(${i * 46} ${14 + Math.sin(i / 11 * Math.PI) * 47})`}><circle r="7" fill="currentColor" opacity=".08"/><circle r="2.2" fill="currentColor"/></g>)}</g>)}</svg>;
}

function Pearls() {
    return <svg className={styles.pearls} viewBox="0 0 500 160" fill="none" aria-hidden="true">{[0, 1].map(side => <g key={side} transform={`translate(${side * 245} 0)`}>{Array.from({ length: 25 }, (_, i) => <circle key={i} cx={i * 10} cy={20 + Math.sin(i / 24 * Math.PI) * 94} r="4.5" fill="var(--ref-paper)" stroke="currentColor" strokeOpacity=".28"/>)}</g>)}<path d="M249 20C161-34 174 81 246 32C334-34 321 81 252 32M246 32L226 95L244 81L251 96L253 33L274 95" stroke="currentColor" strokeWidth="3"/></svg>;
}

function Calendar({ date }: { date: Date }) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return <div className={styles.calendar} aria-label={date.toLocaleDateString('en-US', { dateStyle: 'full' })}><p>{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p><div className={styles.calendarGrid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`week-${index}`} className={styles.weekday}>{day}</span>)}
        {Array.from({ length: start }, (_, index) => <span key={`empty-${index}`} />)}
        {Array.from({ length: days }, (_, index) => <span key={index} className={date.getDate() === index + 1 ? styles.selectedDay : undefined}>{index + 1}</span>)}
    </div></div>;
}

function audioSource(value?: string) {
    if (!value) return undefined;
    try { return ['https:', 'http:', 'blob:'].includes(new URL(value).protocol) ? value : undefined; }
    catch { return value.startsWith('/') && !value.startsWith('//') ? value : undefined; }
}

export default function CollectionInvitationTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const reference = getReferenceInvitation(wedding.template_style);
    const theme = getInvitationTheme(wedding);
    const { registerSection, unregisterSection } = useSectionContext();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const timelineRef = useRef<HTMLOListElement>(null);
    const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);
    const timeline = parseTimelineItems(wedding.program_timeline);
    const date = wedding.wedding_date ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`) : null;
    const validDate = date && Number.isFinite(date.getTime()) ? date : null;
    const photo = wedding.hero_image?.trim() || wedding.couple_photo?.trim();
    const customMonogram = Boolean(wedding.logo_shape && wedding.logo_shape !== 'minimal' || wedding.logo_color || wedding.logo_font || wedding.logo_animation && wedding.logo_animation !== 'none');
    const initials = wedding.logo_initials || [wedding.bride_name, wedding.groom_name].map(name => name?.trim().charAt(0) || '').join('');
    const titled = getSectionTitleStyle(wedding);
    const hasTitleChoice = wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style);
    const titleProps = { className: `${styles.title} ${titled.className}`, style: hasTitleChoice ? titled.style : undefined };
    const motif = theme?.vars['--invitation-motif'] || reference?.accent || wedding.motif_color;
    const themedWedding = { ...wedding, motif_color: motif };
    const dress = parseDressCodeValue(wedding.dress_code, motif);
    const audio = wedding.background_music_enabled ? audioSource(wedding.background_music_url) : undefined;
    const showGallery = gallery.length > 0 && (!wedding.is_thank_you_mode || wedding.show_photos_in_thank_you_mode !== false);
    const sectionKey = [!wedding.is_thank_you_mode && validDate && 'countdown', wedding.story && 'bio', !wedding.is_thank_you_mode && timeline.length > 0 && 'timeline', !wedding.is_thank_you_mode && wedding.dress_code && 'attire', showGallery && (!wedding.gallery_layout || wedding.gallery_layout === 'auto') && 'gallery'].filter(Boolean).join(',');
    useEffect(() => {
        const ids = sectionKey ? sectionKey.split(',') : [];
        const labels: Record<string, string> = { countdown: 'Save the date', bio: 'Our story', timeline: 'The day', attire: 'Dress code', gallery: 'Gallery' };
        ids.forEach(id => registerSection(id, labels[id]));
        return () => ids.forEach(unregisterSection);
    }, [sectionKey, registerSection, unregisterSection]);
    if (!reference) return null;
    const layout = reference.layout as string;
    const split = ['split-monogram', 'rose-monogram'].includes(layout);
    const horizontalProgram = ['winter-castle', 'winter-blue'].includes(layout);
    const scrollProgram = (direction: number) => {
        const list = timelineRef.current;
        if (list) list.scrollBy({ left: direction * list.clientWidth * .8, behavior: 'auto' });
    };
    const coastal = ['hydrangea-coast', 'sea-glass', 'ocean-coral', 'coastal-silver'].includes(layout);
    const wintry = ['winter-castle', 'winter-blue', 'pearl-ballroom'].includes(layout);
    const ornaments = !['monochrome-collage', 'cocoa-capsule', 'navy-celebration'].includes(layout);
    const photoFirst = ['hydrangea-coast', 'monochrome-collage', 'sea-glass', 'navy-celebration', 'pearl-ballroom', 'coastal-silver'].includes(layout);
    const icons = { ceremony: Church, drinks: Wine, meal: Utensils, photo: Camera, music: Music, celebration: Sparkles };
    // Configured artwork supplies only ornamentation; it never replaces a section or editable text.
    const artwork = (reference as typeof reference & { artwork?: string }).artwork;
    const decoration = <>{artwork ? <div className={styles.artwork} aria-hidden="true" /> : layout === 'calla-envelope' ? <Calla /> : ornaments && <Branch flowers={reference.decoration === 'flowers'} className={styles.corner} />}{wintry && <Snow />}{coastal && <Seashell />}{layout === 'olive-lights' && <Lights />}{['pearl-ballroom', 'coastal-silver'].includes(layout) && <Pearls />}</>;
    const panel = (children: ReactNode, className = '', id?: string) => <section id={id} className={`${styles.panel} ${className}`}>{children}</section>;
    const portrait = photo && <div className={styles.portrait}><SafeWeddingImage src={photo} alt={`${wedding.bride_name} and ${wedding.groom_name}`} className={styles.photo} loading="eager" fallbackText={initials} /></div>;
    const heading = <div className={styles.heroCopy}><p className={styles.eyebrow}>{wedding.is_thank_you_mode ? 'With heartfelt thanks' : wedding.is_save_the_date ? 'Save the date' : 'Wedding invitation'}</p>
        {customMonogram && <WeddingMonogram wedding={wedding} className="mx-auto" />}{split && !customMonogram && <div className={styles.splitMonogram} aria-hidden="true"><span>{initials.slice(0, 1)}</span><Branch /><span>{initials.slice(1)}</span></div>}
        <h1 className={styles.names}><span>{wedding.bride_name}</span><em>&amp;</em><span>{wedding.groom_name}</span></h1>
        {validDate ? <time className={styles.date} dateTime={wedding.wedding_date}>{validDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', ' · ')}</time> : <p className={styles.date}>Date to be announced</p>}
    </div>;
    return <div className={styles.page} data-reference={reference.id} data-reference-invitation={reference.id} data-layout={layout} data-dark={reference.dark} data-has-photo={Boolean(photo)} data-card-style={wedding.card_style} style={{ '--ref-paper': reference.paper, '--ref-ink': reference.ink, '--ref-accent': motif, '--collection-art': artwork ? `url("${artwork}")` : 'none', ...theme?.vars } as CSSProperties}>
        <article className={styles.invitation}>
            <header className={styles.hero}>{decoration}{photoFirst && portrait}{heading}{!photoFirst && portrait}
                {['calla-envelope', 'coastal-silver'].includes(layout) && photo && <div className={styles.envelope} aria-hidden="true"><span className={styles.seal}>{initials}</span></div>}
            </header>
            {audio && <div className={styles.music}><p>{wedding.background_music_title || 'Our wedding song'}</p><audio controls preload="none" src={audio} aria-label="Wedding music" /></div>}
            {panel(<>{decoration}<h2 {...titleProps}>{wedding.is_thank_you_mode ? 'Thank you' : 'Dear family & friends'}</h2><p>{wedding.is_thank_you_mode ? wedding.thank_you_message || 'Thank you for being part of our celebration.' : 'We would love to celebrate our wedding with you.'}</p>{wedding.quote && <blockquote>{wedding.quote}</blockquote>}<Heart className={styles.heart} size={20} strokeWidth={1} /></>, styles.welcome)}
            {!wedding.is_thank_you_mode && validDate && panel(<>{decoration}<h2 {...titleProps}>{isPast ? 'Our wedding day has arrived' : 'Until we say I do'}</h2><div role="timer" aria-label="Time until the wedding" className={styles.countdown}>{Object.entries(timeLeft).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}</div><Calendar date={validDate}/></>, styles.datePanel, 'countdown')}
            {wedding.story && panel(<><h2 {...titleProps}>Our love story</h2><p>{wedding.story}</p>{wedding.couple_photo && <div className={styles.storyPortrait}><SafeWeddingImage src={wedding.couple_photo} alt="Our love story" className={styles.photo} loading="lazy" /></div>}{decoration}</>, styles.story, 'bio')}
            <div className={`${styles.shared} ${styles.details}`}><DetailsSection id="details" wedding={themedWedding}/></div>
            {!wedding.is_thank_you_mode && timeline.length > 0 && panel(<>{decoration}<h2 {...titleProps}>The wedding day</h2>{horizontalProgram && timeline.length > 1 && <div className={styles.programNavigation}><span>Explore the day</span><div><button type="button" aria-label="Scroll wedding schedule backward" onClick={() => scrollProgram(-1)}><ChevronLeft size={18} aria-hidden="true"/></button><button type="button" aria-label="Scroll wedding schedule forward" onClick={() => scrollProgram(1)}><ChevronRight size={18} aria-hidden="true"/></button></div></div>}<ol ref={timelineRef} className={styles.timeline} aria-label="Wedding schedule">{timeline.map((item, index) => { const Icon = icons[timelineIconKind(item.event, index)]; return <li key={`${index}-${item.event}`} data-step={String(index + 1).padStart(2, '0')}><span className={styles.timelineIcon}><Icon size={25} strokeWidth={1}/></span><div>{item.time && <time>{item.time}</time>}<p>{item.event}</p></div></li>; })}</ol></>, styles.program, 'timeline')}
            {!wedding.is_thank_you_mode && wedding.dress_code && panel(<>{decoration}<h2 {...titleProps}>Dress code</h2>{([{ label: 'For our guests', preference: dress.guests, variant: 'guests' }, { label: 'For our sponsors', preference: dress.sponsors, variant: 'sponsors' }, ...(dress.bridesmaids ? [{ label: 'For our bridesmaids', preference: dress.bridesmaids, variant: 'bridesmaids' }] : [])] as const).map(({ label, preference, variant }) => <div key={label} className={styles.attireGroup}><h3>{label}</h3><AttireIllustration color={preference.dressColor || preference.color} suitColor={preference.suitColor} variant={variant as 'guests' | 'sponsors' | 'bridesmaids'} className={styles.attireIllustration}/><p>{preference.attire}</p><div className={styles.swatches}>{preference.colors?.map((color, index) => <span key={`${color}-${index}`} style={{ backgroundColor: color }} title={color}/>)}</div>{preference.notes && <p>{preference.notes}</p>}</div>)}</>, styles.attire, 'attire')}
            {showGallery && wedding.gallery_layout && wedding.gallery_layout !== 'auto' ? <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} galleryLayout={wedding.gallery_layout} /> : <>{showGallery && panel(<><h2 {...titleProps}>Our moments</h2><div className={styles.gallery}>{gallery.map((src, index) => <button type="button" key={`${index}-${src}`} onClick={() => setLightboxIndex(index)} aria-label={`View wedding photo ${index + 1}`} className={styles.galleryButton}><SafeWeddingImage src={src} alt={`Wedding memory ${index + 1}`} className={styles.photo} loading="lazy"/><span className={styles.galleryZoom} aria-hidden="true"><ZoomIn size={17}/></span></button>)}</div></>, styles.galleryPanel, 'gallery')}</>}
            {wedding.teaser_video && <div className={styles.shared}><VideoSection id="video" video={wedding.teaser_video} poster={photo} template={wedding.template} motifColor={motif} templateStyle={wedding.template_style}/></div>}
            <div className={`${styles.shared} ${styles.gifts}`}><GiftSection id="gift" wedding={themedWedding}/></div>
            {wedding.contact_person && panel(<><h2 {...titleProps}>Get in touch</h2><p>{wedding.contact_person}</p></>, styles.contact)}
            <div className={`${styles.shared} ${styles.additional}`}><SharedNewSections id="additional" wedding={themedWedding} isExpired={isExpired}/></div>
            {lightboxIndex !== null && <Lightbox images={gallery} index={lightboxIndex} onClose={() => setLightboxIndex(null)}/>}
        </article>
    </div>;
}
