'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Church, Wine, Utensils, Music, Sparkles, Camera, Heart, Plane, Globe, MapPin, Expand } from 'lucide-react';
import type { TemplateProps } from '@/types/wedding';
import { SafeWeddingImage, GiftSection, VideoSection, DetailsSection } from '@/components/wedding';
import GallerySection, { Lightbox } from '@/components/wedding/GallerySection';
import { useSectionContext } from '@/context/SectionContext';
import AttireIllustration from '@/components/AttireIllustration';
import { getInvitationTheme } from '@/lib/invitation-theme';
import { REFERENCE_INVITATIONS, getReferenceInvitation } from '@/lib/reference-invitations';
import { getSectionTitleStyle } from '@/lib/theme-engine';
import { timelineIconKind } from '@/lib/wedding-timeline';
import { parseDressCodeValue } from '@/lib/dress-code';
import { WeddingMonogram, SharedNewSections, parseTimelineItems, useCountdown } from './shared';
import styles from './ReferenceInvitationTemplate.module.css';

/** Drawn ornaments remain crisp at every width and never contain wedding content. */
function Ornament({ kind, className = '' }: { kind: string; className?: string }) {
    return <svg className={`${styles.ornament} ${className}`} viewBox="0 0 300 240" fill="none" aria-hidden="true">
        {kind === 'bow' ? <g stroke="currentColor" strokeWidth="1.7"><path d="M150 64C82 4 20 25 48 64S118 92 150 64C218 4 280 25 252 64S182 92 150 64ZM145 73C121 112 112 140 91 172L114 161L123 176L151 79M155 73C179 112 188 140 209 172L186 161L177 176L149 79"/><ellipse cx="150" cy="67" rx="10" ry="12"/><path d="M50 62C85 60 115 65 140 69M250 62C215 60 185 65 160 69"/></g> : <>
            {[0, 1, 2].map(branch => <g key={branch} transform={`translate(${branch * 75 - 12} ${branch % 2 * 32}) rotate(${branch * 22 - 30} 90 190)`} stroke="currentColor" strokeWidth="1">
                <path d="M65 235Q119 149 107 35M93 174Q60 136 34 120M105 119Q145 95 167 61"/>
                {[0, 1, 2, 3, 4].map(i => <g key={i} transform={`translate(${103 - i * 5} ${47 + i * 31}) rotate(${i % 2 ? 48 : -43})`}><path d="M0 0C-34-38-47-14-5 14C5-1 3-7 0 0Z" fill="currentColor" fillOpacity={kind === 'linework' ? 0 : .22 + i * .06}/><path d="M0 5L-27-18" opacity=".6"/></g>)}
            </g>)}
            {kind === 'flowers' && [0, 1, 2].map(i => <g key={i} transform={`translate(${65 + i * 75} ${140 - (i % 2) * 65})`} stroke="currentColor" strokeWidth=".7">{[0, 60, 120, 180, 240, 300].map(angle => <ellipse key={angle} cx="0" cy="-20" rx="16" ry="27" transform={`rotate(${angle})`} fill="var(--ref-paper)"/>)}<circle r="15" fill="currentColor" fillOpacity=".12"/><circle r="7" fill="currentColor" fillOpacity=".4"/></g>)}
        </>}
    </svg>;
}


function Pavilion() {
    return <svg viewBox="0 0 320 230" className={styles.pavilion} fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M38 114L160 38L282 114ZM56 114V210H264V114M68 116V208M90 116V208M230 116V208M252 116V208M108 116V207M212 116V207M52 211H268M42 219H278M150 42V27H170V42M145 27L160 15L175 27ZM160 3V15M48 114H274M65 101H254M88 87H232M110 73H211M134 59H187M100 209V148Q160 94 220 148V209M104 150Q160 117 216 150M107 164H213M107 178H213M107 192H213M56 178H90M56 192H90M230 178H264M230 192H264"/><path d="M8 214Q19 190 18 154Q33 178 26 210M292 214Q306 171 293 141M3 194Q23 180 34 191M280 186Q299 162 314 174M11 167Q27 153 34 168M277 153Q292 128 309 142M23 222H308"/>{Array.from({length: 12}, (_,i) => <path key={i} d={`M${61+i*17} 110L160 39`} opacity=".45"/>)}</svg>;
}

function Calendar({ date }: { date: Date }) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return <div className={styles.calendar} aria-label={date.toLocaleDateString('en-US', { dateStyle: 'full' })}>
        <p>{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className={styles.calendarGrid}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <span key={`day-${i}`} className={styles.weekday}>{day}</span>)}{Array.from({ length: start }, (_, i) => <span key={`blank-${i}`} />)}{Array.from({ length: days }, (_, i) => <span key={i} className={i + 1 === date.getDate() ? styles.selectedDay : ''} aria-current={i + 1 === date.getDate() ? 'date' : undefined}>{i + 1}</span>)}</div>
    </div>;
}

function validAudio(value?: string) {
    if (!value) return undefined;
    try { const url = new URL(value); return ['https:', 'http:', 'blob:'].includes(url.protocol) ? value : undefined; } catch { return value.startsWith('/') && !value.startsWith('//') ? value : undefined; }
}

export default function ReferenceInvitationTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const reference = getReferenceInvitation(wedding.template_style) || REFERENCE_INVITATIONS[0];
    const theme = getInvitationTheme(wedding);
    const monogramColor = reference.layout === 'envelope' ? theme?.vars['--invitation-on-action'] : reference.layout === 'baroque' ? theme?.vars['--invitation-dark-accent'] : theme?.vars['--invitation-link'];
    const { registerSection, unregisterSection } = useSectionContext();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const { timeLeft, isPast } = useCountdown(wedding.wedding_date, wedding.wedding_time);
    const timeline = parseTimelineItems(wedding.program_timeline);
    const date = wedding.wedding_date ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`) : null;
    const validDate = date && Number.isFinite(date.getTime()) ? date : null;
    const photo = wedding.hero_image?.trim() || wedding.couple_photo?.trim();
    const customMonogram = Boolean(wedding.logo_shape && wedding.logo_shape !== 'minimal' || wedding.logo_color || wedding.logo_font || wedding.logo_animation && wedding.logo_animation !== 'none');
    const initials = wedding.logo_initials || [wedding.bride_name, wedding.groom_name].map(name => name?.trim().charAt(0) || '').join('');
    const themedWedding = { ...wedding, motif_color: wedding.motif_color || reference.accent };
    const titleStyle = getSectionTitleStyle(wedding);
    const nativeHeadingStyle = wedding.section_title_color_style && !['default', 'motif'].includes(wedding.section_title_color_style) ? titleStyle.style : undefined;
    const dress = parseDressCodeValue(wedding.dress_code, themedWedding.motif_color);
    const audio = wedding.background_music_enabled ? validAudio(wedding.background_music_url) : undefined;
    const ticket = reference.layout === 'ticket';
    const photoFirst = ['torn', 'coastal', 'western', 'gold', 'forest', 'classic'].includes(reference.layout) || [17, 24].includes(reference.reference);
    const oval = ['magnolia', 'estate', 'editorial', 'classic'].includes(reference.layout);
    const icons = { ceremony: Church, drinks: Wine, meal: Utensils, photo: Camera, music: Music, celebration: Sparkles };
    const sectionIds = [wedding.dress_code && !wedding.is_thank_you_mode && 'attire', !wedding.is_thank_you_mode && validDate && 'countdown', wedding.story && 'bio', timeline.length > 0 && !wedding.is_thank_you_mode && 'timeline', gallery.length > 0 && (!wedding.gallery_layout || wedding.gallery_layout === 'auto') && (!wedding.is_thank_you_mode || wedding.show_photos_in_thank_you_mode !== false) && 'gallery'].filter((id): id is string => Boolean(id));
    const sectionKey = sectionIds.join(',');
    useEffect(() => {
        const labels: Record<string, string> = { attire: 'Dress code', countdown: 'Save the date', bio: 'Our story', timeline: 'The day', gallery: 'Gallery' };
        const ids = sectionKey ? sectionKey.split(',') : [];
        ids.forEach(id => registerSection(id, labels[id]));
        return () => ids.forEach(unregisterSection);
    }, [sectionKey, registerSection, unregisterSection]);
    const portrait = photo ? <div className={`${styles.portrait} ${oval ? styles.oval : ''}`}><SafeWeddingImage src={photo} alt={`${wedding.bride_name} and ${wedding.groom_name}`} loading="eager" className={styles.photo} fallbackText={initials} /></div> : null;
    const names = <h1 className={styles.names}><span>{wedding.bride_name}</span><em>&amp;</em><span>{wedding.groom_name}</span></h1>;
    const dateLine = <div className={styles.dateLine}>{validDate ? <><span>{validDate.toLocaleDateString('en-US', { month: 'short' })}</span><strong>{validDate.getDate()}</strong><span>{validDate.getFullYear()}</span></> : <span>Date to be announced</span>}</div>;
    return <div className={styles.page} data-reference={reference.id} data-reference-invitation={reference.id} data-layout={reference.layout} data-dark={reference.dark} data-card-style={wedding.card_style} data-decoration={reference.decoration} style={{ '--ref-paper': reference.paper, '--ref-ink': reference.ink, '--ref-accent': themedWedding.motif_color, '--ref-motif': themedWedding.motif_color, ...theme?.vars } as CSSProperties}>
        <article className={styles.invitation}>
            <header className={styles.hero}>
                {reference.decoration !== 'none' && <Ornament kind={reference.decoration} className={styles.topOrnament} />}
                {ticket && <div className={styles.ticketLabel}>Wedding ticket <Plane size={18} strokeWidth={1} /><Globe size={82} strokeWidth={.6} /></div>}
                {photoFirst && portrait}{reference.reference === 25 && photo && <div className={styles.photoMonogram} aria-hidden="true">{initials}</div>}
                <div className={styles.heroCopy}>
                    {reference.layout === 'toile' && <Pavilion />}
                    {!photoFirst && <div className={styles.monogram} aria-hidden="true">{customMonogram ? <WeddingMonogram wedding={{ ...wedding, logo_color: wedding.logo_color || monogramColor || reference.ink }} /> : initials}</div>}
                    <p className={styles.eyebrow}>{wedding.is_thank_you_mode ? 'With heartfelt thanks' : wedding.is_save_the_date ? 'Save the date' : 'We are getting married'}</p>
                    {names}
                    <div className={styles.divider}><span /> <Heart size={12} fill="currentColor" /> <span /></div>
                    {dateLine}
                    {validDate && <p className={styles.weekdayLabel}>{validDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>}
                    {ticket && <div className={styles.flightDetails}><span>Destination<strong>{wedding.venue_name || 'Our wedding'}</strong></span><span>Departure<strong>{wedding.wedding_time || 'Time to be announced'}</strong></span></div>}
                </div>
                {!photoFirst && (reference.layout !== 'silk' || !wedding.story) && portrait}
                {reference.layout === 'envelope' && <div className={styles.envelopeSeal} aria-hidden="true">{initials}</div>}
                {reference.decoration !== 'none' && <Ornament kind={reference.decoration} className={styles.bottomOrnament} />}
            </header>
            {audio && <div className={styles.music}><p>{wedding.background_music_title || 'Our wedding song'}</p><audio controls preload="none" src={audio} aria-label="Wedding music" /></div>}
            <section data-reference-panel="true" className={styles.welcome}>
                <p className={styles.script}>{wedding.is_thank_you_mode ? 'Thank you' : 'Dear family & friends'}</p>
                <p>{wedding.is_thank_you_mode ? wedding.thank_you_message || 'Thank you for being part of our celebration.' : 'We would love to share this special day with you.'}</p>
                {wedding.quote && <blockquote>{wedding.quote}</blockquote>}
                <Heart size={21} strokeWidth={1} className={styles.centerIcon} />
            </section>
            {!wedding.is_thank_you_mode && validDate && <section id="countdown" data-reference-panel="true" className={styles.dateSection}>
                <p className={styles.eyebrow}>The big day</p>
                <p className={styles.script}>{isPast ? 'Our wedding day has arrived' : 'Until we say I do'}</p>
                <div role="timer" aria-label="Time until the wedding" className={styles.countdown}>{Object.entries(timeLeft).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}</div>
                <Calendar date={validDate} />
            </section>}
            {wedding.story && <section id="bio" data-reference-panel="true" className={styles.story}><Ornament kind="linework" /><h2 className={titleStyle.className} style={nativeHeadingStyle}>Our love story</h2><p>{wedding.story}</p>{reference.layout === 'silk' && portrait}{wedding.couple_photo && wedding.couple_photo !== photo && <SafeWeddingImage src={wedding.couple_photo} alt="Our story" className={styles.storyPhoto} />}</section>}
            {!wedding.is_thank_you_mode && timeline.length > 0 && <section id="timeline" data-reference-panel="true" className={styles.program}>
                <Ornament kind={reference.decoration === 'none' ? 'linework' : reference.decoration} className={styles.programOrnament} />
                <p className={styles.eyebrow}>Celebrate with us</p><h2 className={titleStyle.className} style={nativeHeadingStyle}>{ticket ? 'Our itinerary' : 'The wedding day'}</h2><div className={styles.divider}><span /><Heart size={12} /><span /></div>
                <ol className={styles.timeline}>{timeline.map((item, index) => { const Icon = icons[timelineIconKind(item.event, index)]; return <li key={`${index}-${item.event}`}><span className={styles.timelineIcon}><Icon size={24} strokeWidth={1} /></span><div>{item.time && <time>{item.time}</time>}<p>{item.event}</p></div></li>; })}</ol>
            </section>}
            <div className={styles.shared}><DetailsSection id="details" wedding={themedWedding} /></div>
            {!wedding.is_thank_you_mode && wedding.dress_code && <section id="attire" data-reference-panel="true" className={styles.attire}><h2 className={titleStyle.className} style={nativeHeadingStyle}>Dress code</h2>{([{ label: 'For our guests', preference: dress.guests, variant: 'guests' }, { label: 'For our sponsors', preference: dress.sponsors, variant: 'sponsors' }, ...(dress.bridesmaids ? [{ label: 'For our bridesmaids', preference: dress.bridesmaids, variant: 'bridesmaids' }] : [])] as const).map(({ label, preference, variant }) => <div key={label} className={styles.attireGroup}><h3>{label}</h3><AttireIllustration color={preference.dressColor || preference.color} suitColor={preference.suitColor} variant={variant as 'guests' | 'sponsors' | 'bridesmaids'} className={styles.attireIllustration}/><p className={styles.script}>{preference.attire}</p><div className={styles.swatches}>{preference.colors?.map((color, index) => <span key={`${color}-${index}`} style={{ backgroundColor: color }} title={color} />)}</div>{preference.notes && <p>{preference.notes}</p>}</div>)}</section>}
            {gallery.length > 0 && (!wedding.is_thank_you_mode || wedding.show_photos_in_thank_you_mode !== false) && wedding.gallery_layout && wedding.gallery_layout !== 'auto' ? <GallerySection id="gallery" gallery={gallery} template={wedding.template} motifColor={wedding.motif_color} cardStyle={wedding.card_style} galleryLayout={wedding.gallery_layout} /> : <>{gallery.length > 0 && (!wedding.is_thank_you_mode || wedding.show_photos_in_thank_you_mode !== false) && <section id="gallery" className={styles.gallery}><Camera size={25} strokeWidth={1} className={styles.centerIcon}/><h2 className={titleStyle.className} style={nativeHeadingStyle}>Our moments</h2><div className={styles.galleryGrid}>{gallery.map((src, index) => <div key={`${src}-${index}`}><button type="button" onClick={() => setLightboxIndex(index)} aria-label={`View wedding photo ${index + 1}`}><SafeWeddingImage src={src} alt={`Wedding memory ${index + 1}`} className={styles.galleryPhoto} loading="lazy" /><span className={styles.galleryZoom} aria-hidden="true"><Expand size={17} strokeWidth={1.4} /></span></button></div>)}</div></section>}</>}
            {wedding.teaser_video && <div className={styles.shared}><VideoSection id="video" video={wedding.teaser_video} poster={photo} template={wedding.template} motifColor={themedWedding.motif_color} templateStyle={wedding.template_style} /></div>}
            <div className={`${styles.shared} ${styles.gift}`}><GiftSection id="gift" wedding={themedWedding} /></div>
            {wedding.contact_person && <section data-reference-panel="true" className={styles.contact}><MapPin size={23} strokeWidth={1} className={styles.centerIcon} /><h2 className={titleStyle.className} style={nativeHeadingStyle}>Get in touch</h2><p>{wedding.contact_person}</p></section>}
            <div className={styles.shared}><SharedNewSections id="additional" wedding={themedWedding} isExpired={isExpired} /></div>
            {lightboxIndex !== null && <Lightbox images={gallery} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />}

        </article>
    </div>;
}
