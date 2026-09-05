'use client';

import type { CSSProperties } from 'react';
import type { Wedding, WeddingPartyMember } from '@/types/wedding';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import { motion } from 'framer-motion';

interface WeddingPartySectionProps {
    members: WeddingPartyMember[];
    wedding: Wedding;
}

export default function WeddingPartySection({ members, wedding }: WeddingPartySectionProps) {
    const visibleMembers = (members || []).filter((member) => member?.name?.trim());
    if (!wedding || wedding.include_entourage_section === false || visibleMembers.length === 0) return null;

    const visual = getTemplateVisualProfile(wedding.template || 'classic', wedding.motif_color || '#D16C78', false, wedding.card_style);
    const titleStyle = getSectionTitleStyle(wedding, visual.headingClass);
    const motifColor = wedding.motif_color || '#D16C78';
    const invitationStyle = getEntourageInvitationStyle(visual, motifColor, wedding.template || 'classic');
    const leftColumn = visibleMembers.filter((_, index) => index % 2 === 0);
    const rightColumn = visibleMembers.filter((_, index) => index % 2 === 1);

    return (
        <section id="entourage" className={`px-5 py-20 md:py-28 ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className={`pointer-events-none absolute inset-0 overflow-hidden ${invitationStyle.overlayClass}`}>
                <div className={invitationStyle.cornerTopClass} style={{ borderColor: `${motifColor}55` }} />
                <div className={invitationStyle.cornerBottomClass} style={{ borderColor: `${motifColor}55` }} />
                <div className={invitationStyle.ornamentOneClass} style={{ color: motifColor }}>✦</div>
                <div className={invitationStyle.ornamentTwoClass} style={{ color: motifColor }}>{invitationStyle.ornamentGlyph}</div>
            </div>

            <div className="relative mx-auto max-w-5xl">
                <div className={`relative mx-auto overflow-hidden px-5 py-14 text-center sm:px-10 md:px-14 md:py-16 ${invitationStyle.paperClass}`} style={invitationStyle.paperStyle}>
                    <div className="pointer-events-none absolute inset-x-8 top-7 h-px opacity-70" style={{ background: invitationStyle.ruleGradient }} />
                    <div className="pointer-events-none absolute inset-x-8 bottom-7 h-px opacity-70" style={{ background: invitationStyle.ruleGradient }} />

                    <div className="relative mx-auto mb-11 max-w-3xl">
                        <div className="mb-5 flex items-center justify-center gap-4">
                            <span className="h-px w-10 opacity-70" style={{ backgroundColor: motifColor }} />
                            <span className={visual.badgeStyleClass || `text-[10px] font-black uppercase tracking-[0.34em] ${visual.eyebrowClass}`}>
                                {visual.badgePrefix ? `${visual.badgePrefix}ENTOURAGE` : 'The Wedding Party'}
                            </span>
                            <span className="h-px w-10 opacity-70" style={{ backgroundColor: motifColor }} />
                        </div>
                        <h2 className={`text-4xl leading-tight md:text-6xl ${titleStyle.className}`} style={titleStyle.style}>Our Entourage</h2>
                        <p className={`mx-auto mt-5 max-w-xl text-sm leading-7 md:text-base ${invitationStyle.introClass}`}>
                            With grateful hearts, we honor the family and friends standing with us on this day.
                        </p>
                        <div className="mx-auto mt-7 flex max-w-xs items-center justify-center gap-3">
                            <span className="h-px flex-1 opacity-55" style={{ backgroundColor: motifColor }} />
                            <span className={invitationStyle.centerMarkClass} style={{ color: motifColor }}>
                                {invitationStyle.centerGlyph}
                            </span>
                            <span className="h-px flex-1 opacity-55" style={{ backgroundColor: motifColor }} />
                        </div>
                    </div>

                    <div className={`relative mx-auto grid max-w-4xl gap-x-12 gap-y-0 text-left md:grid-cols-2 ${invitationStyle.listFrameClass}`}>
                        {[leftColumn, rightColumn].map((columnMembers, columnIndex) => (
                            <div key={columnIndex} className={columnIndex === 1 ? invitationStyle.secondColumnClass : ''}>
                                {columnMembers.map((member, i) => {
                                    const originalIndex = (i * 2) + columnIndex;
                                    return (
                                        <EntourageLine
                                            key={`${member.name}-${member.role || originalIndex}`}
                                            member={member}
                                            index={originalIndex}
                                            visual={visual}
                                            style={invitationStyle}
                                            motifColor={motifColor}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className={`mx-auto mt-12 max-w-2xl text-center ${invitationStyle.footerClass}`}>
                        <span className="inline-block h-px w-16 align-middle opacity-60" style={{ backgroundColor: motifColor }} />
                        <span className="mx-4 align-middle text-[10px] font-black uppercase tracking-[0.28em]">Thank you for being part of our story</span>
                        <span className="inline-block h-px w-16 align-middle opacity-60" style={{ backgroundColor: motifColor }} />
                    </div>
                </div>
            </div>
        </section>
    );
}

type EntourageInvitationStyle = {
    paperClass: string;
    paperStyle?: CSSProperties;
    overlayClass: string;
    introClass: string;
    roleClass: string;
    nameClass: string;
    bioClass: string;
    listFrameClass: string;
    secondColumnClass: string;
    dividerClass: string;
    lineClass: string;
    footerClass: string;
    centerMarkClass: string;
    centerGlyph: string;
    ornamentGlyph: string;
    ornamentOneClass: string;
    ornamentTwoClass: string;
    cornerTopClass: string;
    cornerBottomClass: string;
    ruleGradient: string;
};

function getEntourageInvitationStyle(visual: ReturnType<typeof getTemplateVisualProfile>, motifColor: string, template: string): EntourageInvitationStyle {
    const normalizedTemplate = template.toLowerCase();
    const baseCorner = 'absolute h-24 w-24 opacity-70';

    if (visual.mood === 'dark') {
        return {
            paperClass: 'border border-primary/35 bg-black/30 text-white shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl',
            paperStyle: { backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)), radial-gradient(circle at 50% 0%, ${motifColor}22, transparent 38%)` },
            overlayClass: 'opacity-80',
            introClass: 'text-white/72',
            roleClass: 'text-primary/85',
            nameClass: 'text-white',
            bioClass: 'text-white/62',
            listFrameClass: 'border-y border-primary/25 py-4',
            secondColumnClass: 'md:border-l md:border-primary/20 md:pl-12',
            dividerClass: 'border-white/14',
            lineClass: 'py-5',
            footerClass: 'text-white/55',
            centerMarkClass: 'font-serif text-xl',
            centerGlyph: normalizedTemplate === 'artdeco' ? '◇' : '✧',
            ornamentGlyph: normalizedTemplate === 'artdeco' ? '◆' : '♛',
            ornamentOneClass: 'absolute left-[8%] top-16 text-5xl opacity-20',
            ornamentTwoClass: 'absolute bottom-14 right-[9%] text-6xl opacity-20',
            cornerTopClass: `${baseCorner} left-6 top-6 border-l border-t`,
            cornerBottomClass: `${baseCorner} bottom-6 right-6 border-b border-r`,
            ruleGradient: `linear-gradient(90deg, transparent, ${motifColor}99, transparent)`,
        };
    }

    if (visual.mood === 'editorial') {
        return {
            paperClass: 'rounded-none border-y border-black/15 bg-white text-neutral-950 shadow-none',
            paperStyle: { backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(180deg, #ffffff 0%, ${motifColor}08 100%)`, backgroundSize: '54px 54px, auto' },
            overlayClass: 'opacity-60',
            introClass: 'text-neutral-600',
            roleClass: 'text-neutral-500',
            nameClass: 'text-neutral-950',
            bioClass: 'text-neutral-500',
            listFrameClass: 'border-y border-black/10 py-3',
            secondColumnClass: 'md:border-l md:border-black/10 md:pl-12',
            dividerClass: 'border-black/10',
            lineClass: 'py-4',
            footerClass: 'text-neutral-500',
            centerMarkClass: 'font-serif text-xl',
            centerGlyph: '—',
            ornamentGlyph: 'No.',
            ornamentOneClass: 'absolute left-[6%] top-20 font-serif text-7xl opacity-10',
            ornamentTwoClass: 'absolute bottom-16 right-[7%] font-serif text-5xl opacity-10',
            cornerTopClass: `${baseCorner} left-7 top-7 border-l border-t`,
            cornerBottomClass: `${baseCorner} bottom-7 right-7 border-b border-r`,
            ruleGradient: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.28), transparent)',
        };
    }

    if (visual.mood === 'cinematic') {
        return {
            paperClass: 'rounded-none border border-white/15 bg-[#101010]/82 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]',
            paperStyle: { backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 42%), repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 18px)` },
            overlayClass: 'opacity-70',
            introClass: 'text-white/70',
            roleClass: 'text-primary/90',
            nameClass: 'text-white',
            bioClass: 'text-white/58',
            listFrameClass: 'border-y border-white/15 py-4',
            secondColumnClass: 'md:border-l md:border-white/10 md:pl-12',
            dividerClass: 'border-white/12',
            lineClass: 'py-5',
            footerClass: 'text-white/55',
            centerMarkClass: 'font-serif text-xl',
            centerGlyph: '◌',
            ornamentGlyph: '●',
            ornamentOneClass: 'absolute left-[10%] top-20 text-5xl opacity-15',
            ornamentTwoClass: 'absolute bottom-16 right-[10%] text-5xl opacity-15',
            cornerTopClass: `${baseCorner} left-6 top-6 border-l border-t`,
            cornerBottomClass: `${baseCorner} bottom-6 right-6 border-b border-r`,
            ruleGradient: `linear-gradient(90deg, transparent, ${motifColor}88, transparent)`,
        };
    }

    if (visual.isOrganic) {
        return {
            paperClass: 'rounded-[2.5rem] border border-primary/18 bg-white/76 text-[#3f3734] shadow-[0_28px_80px_rgba(80,55,45,0.10)] backdrop-blur-sm',
            paperStyle: { backgroundImage: `radial-gradient(circle at 12% 12%, ${motifColor}14, transparent 28%), radial-gradient(circle at 88% 8%, ${motifColor}10, transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,250,246,0.86))` },
            overlayClass: 'opacity-75',
            introClass: 'text-[#6b5d59]',
            roleClass: 'text-primary',
            nameClass: 'text-[#403837]',
            bioClass: 'text-[#7c6d69]',
            listFrameClass: 'py-2',
            secondColumnClass: 'md:border-l md:border-primary/12 md:pl-12',
            dividerClass: 'border-primary/12',
            lineClass: 'py-5',
            footerClass: 'text-[#7c6d69]',
            centerMarkClass: 'font-serif text-2xl',
            centerGlyph: visual.ornament === 'tropical' ? '✺' : '❦',
            ornamentGlyph: visual.ornament === 'tropical' ? '✹' : '❧',
            ornamentOneClass: 'absolute left-[7%] top-14 rotate-[-12deg] text-7xl opacity-15',
            ornamentTwoClass: 'absolute bottom-12 right-[8%] rotate-12 text-7xl opacity-15',
            cornerTopClass: `${baseCorner} left-6 top-6 rounded-tl-[2rem] border-l border-t`,
            cornerBottomClass: `${baseCorner} bottom-6 right-6 rounded-br-[2rem] border-b border-r`,
            ruleGradient: `linear-gradient(90deg, transparent, ${motifColor}66, transparent)`,
        };
    }

    if (visual.isVintage) {
        return {
            paperClass: 'border border-[#8f7766]/25 bg-[#fff8ed] text-[#483a31] shadow-[0_24px_70px_rgba(90,65,45,0.12)]',
            paperStyle: { backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.52), rgba(255,248,237,0.94)), radial-gradient(circle at 18% 12%, ${motifColor}18, transparent 32%)` },
            overlayClass: 'opacity-70',
            introClass: 'text-[#7a695d]',
            roleClass: 'text-[#8f6a45]',
            nameClass: 'text-[#483a31]',
            bioClass: 'text-[#826f63]',
            listFrameClass: 'border-y border-[#8f7766]/20 py-4',
            secondColumnClass: 'md:border-l md:border-[#8f7766]/18 md:pl-12',
            dividerClass: 'border-[#8f7766]/18',
            lineClass: 'py-5',
            footerClass: 'text-[#826f63]',
            centerMarkClass: 'font-serif text-2xl',
            centerGlyph: '✥',
            ornamentGlyph: '✤',
            ornamentOneClass: 'absolute left-[7%] top-16 text-6xl opacity-15',
            ornamentTwoClass: 'absolute bottom-12 right-[8%] text-6xl opacity-15',
            cornerTopClass: `${baseCorner} left-6 top-6 border-l border-t`,
            cornerBottomClass: `${baseCorner} bottom-6 right-6 border-b border-r`,
            ruleGradient: 'linear-gradient(90deg, transparent, rgba(143,119,102,0.45), transparent)',
        };
    }

    return {
        paperClass: 'rounded-[2rem] border border-primary/16 bg-white/82 text-[#4A4444] shadow-[0_28px_80px_rgba(80,55,50,0.10)] backdrop-blur-sm',
        paperStyle: { backgroundImage: `radial-gradient(circle at 50% 0%, ${motifColor}12, transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,250,248,0.9))` },
        overlayClass: 'opacity-70',
        introClass: 'text-[#736866]',
        roleClass: 'text-primary',
        nameClass: 'text-[#4A4444]',
        bioClass: 'text-[#81716e]',
        listFrameClass: 'py-2',
        secondColumnClass: 'md:border-l md:border-primary/12 md:pl-12',
        dividerClass: 'border-primary/12',
        lineClass: 'py-5',
        footerClass: 'text-[#81716e]',
        centerMarkClass: 'font-serif text-2xl',
        centerGlyph: '✧',
        ornamentGlyph: '✦',
        ornamentOneClass: 'absolute left-[8%] top-16 text-6xl opacity-15',
        ornamentTwoClass: 'absolute bottom-14 right-[8%] text-6xl opacity-15',
        cornerTopClass: `${baseCorner} left-6 top-6 rounded-tl-[1.5rem] border-l border-t`,
        cornerBottomClass: `${baseCorner} bottom-6 right-6 rounded-br-[1.5rem] border-b border-r`,
        ruleGradient: `linear-gradient(90deg, transparent, ${motifColor}66, transparent)`,
    };
}

function EntourageLine({
    member,
    index,
    visual,
    style,
    motifColor,
}: {
    member: WeddingPartyMember;
    index: number;
    visual: ReturnType<typeof getTemplateVisualProfile>;
    style: EntourageInvitationStyle;
    motifColor: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: Math.min(index * 0.04, 0.36) }}
            className={`group border-b last:border-b-0 ${style.dividerClass} ${style.lineClass}`}
        >
            <div className="grid grid-cols-[minmax(5.5rem,0.72fr)_auto_minmax(8rem,1fr)] items-baseline gap-3">
                <p className={`min-w-0 break-words text-[10px] font-black uppercase leading-5 tracking-[0.18em] sm:text-[11px] ${style.roleClass}`}>
                    {member.role || 'Entourage'}
                </p>
                <span className="h-px min-w-6 opacity-40 transition-all duration-300 group-hover:min-w-10" style={{ backgroundColor: motifColor }} />
                <h3 className={`min-w-0 break-words text-right font-serif text-xl leading-snug sm:text-2xl ${style.nameClass}`}>
                    {member.name}
                </h3>
            </div>
            {member.bio && (
                <p className={`mt-2 text-right font-serif text-sm italic leading-6 ${style.bioClass}`}>
                    {member.bio}
                </p>
            )}
            {member.photo && (
                <div className="mt-3 flex justify-end">
                    <img
                        src={member.photo}
                        alt={member.name}
                        loading="lazy"
                        decoding="async"
                        className={`h-14 w-14 object-cover ${visual.isSharp ? 'rounded-none' : 'rounded-full'} border border-current/15 opacity-90`}
                    />
                </div>
            )}
        </motion.div>
    );
}
