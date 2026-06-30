'use client';

import { motion } from 'framer-motion';
import { Clock, Gem, Mic2, Music2, PartyPopper } from 'lucide-react';
import { useSectionContext } from '@/context/SectionContext';
import { useEffect } from 'react';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';

interface TimelineSectionProps {
    timeline: string;
    wedding?: any;
    id: string;
}

interface TimelineItem {
    time: string;
    event: string;
}

const timelineIcons = [Clock, Gem, Mic2, Music2, PartyPopper];

interface TimelineDesign {
    eyebrow: string;
    title: string;
    maxWidth: string;
    headerBadgeClass: string;
    frameClass: string;
    spineClass: string;
    cardClass: string;
    timeClass: string;
    eventClass: string;
    iconFrameClass: string;
    connectorClass: string;
    reminderCardClass: string;
    reminderTextClass: string;
    ornament?: 'rails' | 'dots' | 'corner' | 'film' | 'signal' | 'botanical';
}

const TIMELINE_DESIGNS: Record<string, TimelineDesign> = {
    classic: {
        eyebrow: 'Event flow',
        title: 'The Wedding Program',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-primary/10 rotate-3',
        frameClass: 'rounded-[2rem] md:rounded-[3.5rem] border border-white/70 bg-white/65 shadow-[0_30px_100px_rgba(58,42,45,0.10)] backdrop-blur-xl p-5 sm:p-8 md:p-12',
        spineClass: 'bg-gradient-to-b from-primary/0 via-primary/45 to-primary/0',
        cardClass: 'rounded-[1.75rem] border border-primary/10 bg-white/78 shadow-sm backdrop-blur',
        timeClass: 'text-primary/70',
        eventClass: 'text-[#4A4444]',
        iconFrameClass: 'rounded-full border bg-white shadow-lg',
        connectorClass: 'bg-primary/20',
        reminderCardClass: 'rounded-[1.75rem] border border-primary/10 bg-white/68',
        reminderTextClass: 'text-[#4A4444]/70',
        ornament: 'corner',
    },
    minimal: {
        eyebrow: 'Schedule',
        title: 'Order of Events',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-none border border-black bg-white',
        frameClass: 'rounded-none border border-black bg-white p-5 sm:p-8 md:p-12 shadow-[16px_16px_0_rgba(0,0,0,0.06)]',
        spineClass: 'bg-black/80',
        cardClass: 'rounded-none border border-black bg-white shadow-none',
        timeClass: 'text-black/68',
        eventClass: 'text-black',
        iconFrameClass: 'rounded-none border border-black bg-white shadow-none',
        connectorClass: 'bg-black',
        reminderCardClass: 'rounded-none border border-black bg-white',
        reminderTextClass: 'text-black/62',
        ornament: 'rails',
    },
    romantic: {
        eyebrow: 'A soft sequence',
        title: 'Our Celebration Timeline',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-full border border-pink-100 bg-white/80 shadow-xl shadow-pink-200/20',
        frameClass: 'rounded-[2.5rem] border border-pink-100 bg-white/70 shadow-[0_30px_100px_rgba(184,92,122,0.12)] backdrop-blur-xl p-5 sm:p-8 md:p-12',
        spineClass: 'bg-gradient-to-b from-primary/0 via-pink-300/70 to-primary/0',
        cardClass: 'rounded-[2rem] border border-pink-100 bg-white/80 shadow-sm',
        timeClass: 'text-primary/70',
        eventClass: 'text-[#5A3F49]',
        iconFrameClass: 'rounded-full border border-pink-100 bg-pink-50 shadow-lg shadow-pink-200/20',
        connectorClass: 'bg-pink-200',
        reminderCardClass: 'rounded-[2rem] border border-pink-100 bg-pink-50/45',
        reminderTextClass: 'text-[#5A3F49]/70',
        ornament: 'dots',
    },
    luxury: {
        eyebrow: 'Black tie timing',
        title: 'The Evening Program',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-none border border-primary/50 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.45)]',
        frameClass: 'rounded-none border border-primary/35 bg-black/70 p-5 sm:p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.55)]',
        spineClass: 'bg-gradient-to-b from-primary/0 via-primary/70 to-primary/0',
        cardClass: 'rounded-none border border-primary/30 bg-white/[0.06] shadow-none',
        timeClass: 'text-primary/75',
        eventClass: 'text-white/90',
        iconFrameClass: 'rounded-none border border-primary/50 bg-black shadow-lg',
        connectorClass: 'bg-primary/45',
        reminderCardClass: 'rounded-none border border-primary/30 bg-white/[0.05]',
        reminderTextClass: 'text-white/68',
        ornament: 'rails',
    },
    elopement: {
        eyebrow: 'The quiet path',
        title: 'A Day in the Mountains',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-full border border-primary/15 bg-white/75 shadow-lg',
        frameClass: 'rounded-[2.25rem] border border-primary/15 bg-white/72 p-5 sm:p-8 md:p-12 shadow-[0_28px_90px_rgba(74,91,62,0.12)]',
        spineClass: 'bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0',
        cardClass: 'rounded-[1.5rem] border border-primary/15 bg-white/78',
        timeClass: 'text-primary/70',
        eventClass: 'text-[#3F4A38]',
        iconFrameClass: 'rounded-full border border-primary/20 bg-[#f7f4ee] shadow-md',
        connectorClass: 'bg-primary/20',
        reminderCardClass: 'rounded-[1.5rem] border border-primary/15 bg-[#f7f4ee]/70',
        reminderTextClass: 'text-[#3F4A38]/70',
        ornament: 'botanical',
    },
    traditional: {
        eyebrow: 'Ceremonial order',
        title: 'The Formal Program',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-full border-4 border-double border-primary/25 bg-white shadow-lg',
        frameClass: 'rounded-sm border-4 border-double border-primary/25 bg-[#fff8ed]/85 p-5 sm:p-8 md:p-12 shadow-[0_26px_80px_rgba(143,106,69,0.15)]',
        spineClass: 'bg-gradient-to-b from-primary/0 via-primary/55 to-primary/0',
        cardClass: 'rounded-sm border border-primary/25 bg-white/75 ring-4 ring-primary/5',
        timeClass: 'text-primary/75',
        eventClass: 'text-[#4A3A31]',
        iconFrameClass: 'rounded-full border-4 border-double border-primary/25 bg-white shadow-md',
        connectorClass: 'bg-primary/25',
        reminderCardClass: 'rounded-sm border border-primary/25 bg-white/70 ring-4 ring-primary/5',
        reminderTextClass: 'text-[#4A3A31]/70',
        ornament: 'corner',
    },
    timeline: {
        eyebrow: 'Structured flow',
        title: 'The Day at a Glance',
        maxWidth: 'max-w-6xl',
        headerBadgeClass: 'rounded-xl border border-slate-200 bg-white shadow-lg',
        frameClass: 'rounded-2xl border border-slate-200 bg-white/86 p-5 sm:p-8 md:p-12 shadow-[0_28px_90px_rgba(77,91,124,0.16)]',
        spineClass: 'bg-gradient-to-b from-slate-200 via-primary/70 to-slate-200',
        cardClass: 'rounded-xl border border-slate-200 bg-slate-50/85 shadow-sm',
        timeClass: 'text-primary/75',
        eventClass: 'text-slate-800',
        iconFrameClass: 'rounded-xl border border-slate-200 bg-white shadow-md',
        connectorClass: 'bg-slate-300',
        reminderCardClass: 'rounded-xl border border-slate-200 bg-slate-50/80',
        reminderTextClass: 'text-slate-600',
        ornament: 'rails',
    },
    rsvpfocus: {
        eyebrow: 'Guest guide',
        title: 'Your RSVP Day Guide',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-2xl border border-primary/15 bg-white shadow-lg',
        frameClass: 'rounded-[2rem] border border-primary/15 bg-white/82 p-5 sm:p-8 md:p-12 shadow-[0_26px_80px_rgba(160,97,106,0.12)]',
        spineClass: 'bg-gradient-to-b from-primary/0 via-primary/45 to-primary/0',
        cardClass: 'rounded-2xl border border-primary/12 bg-white shadow-sm',
        timeClass: 'text-primary/70',
        eventClass: 'text-[#4A4444]',
        iconFrameClass: 'rounded-2xl border border-primary/20 bg-white shadow-md',
        connectorClass: 'bg-primary/22',
        reminderCardClass: 'rounded-2xl border border-primary/12 bg-white/75',
        reminderTextClass: 'text-[#4A4444]/68',
    },
    cinematic: {
        eyebrow: 'Scene list',
        title: 'The Wedding Reel',
        maxWidth: 'max-w-6xl',
        headerBadgeClass: 'rounded-xl border border-white/15 bg-black/45 backdrop-blur',
        frameClass: 'rounded-[1.5rem] border border-white/10 bg-black/35 p-5 sm:p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur',
        spineClass: 'bg-gradient-to-b from-orange-200/0 via-primary/75 to-orange-200/0',
        cardClass: 'rounded-xl border border-white/10 bg-white/[0.06]',
        timeClass: 'text-primary/75',
        eventClass: 'text-white/88',
        iconFrameClass: 'rounded-xl border border-white/15 bg-black/60 shadow-lg',
        connectorClass: 'bg-primary/40',
        reminderCardClass: 'rounded-xl border border-white/10 bg-white/[0.06]',
        reminderTextClass: 'text-white/68',
        ornament: 'film',
    },
    elegance: {
        eyebrow: 'Refined order',
        title: 'A Refined Celebration',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-full border border-[#dcc9b6] bg-white shadow-lg',
        frameClass: 'rounded-[2rem] border border-[#dcc9b6]/70 bg-white/80 p-5 sm:p-8 md:p-12 shadow-[0_28px_90px_rgba(155,122,94,0.12)]',
        spineClass: 'bg-gradient-to-b from-transparent via-[#9B7A5E]/45 to-transparent',
        cardClass: 'rounded-[1.25rem] border border-[#dcc9b6]/70 bg-[#fffcf8]/85',
        timeClass: 'text-[#9B7A5E]/80',
        eventClass: 'text-[#4A3A31]',
        iconFrameClass: 'rounded-full border border-[#dcc9b6] bg-white shadow-md',
        connectorClass: 'bg-[#dcc9b6]',
        reminderCardClass: 'rounded-[1.25rem] border border-[#dcc9b6]/70 bg-[#fffcf8]/80',
        reminderTextClass: 'text-[#4A3A31]/68',
    },
    artdeco: {
        eyebrow: 'Gilded sequence',
        title: 'The Grand Program',
        maxWidth: 'max-w-6xl',
        headerBadgeClass: 'rounded-none border-2 border-primary/55 bg-black',
        frameClass: 'rounded-none border-2 border-primary/45 bg-black/60 p-5 sm:p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.55)]',
        spineClass: 'bg-gradient-to-b from-transparent via-primary/80 to-transparent',
        cardClass: 'rounded-none border border-primary/35 bg-white/[0.055]',
        timeClass: 'text-primary/80',
        eventClass: 'text-white/90',
        iconFrameClass: 'rounded-none border-2 border-primary/55 bg-black shadow-lg rotate-45',
        connectorClass: 'bg-primary/45',
        reminderCardClass: 'rounded-none border border-primary/35 bg-white/[0.05]',
        reminderTextClass: 'text-white/68',
        ornament: 'rails',
    },
    boho: {
        eyebrow: 'Earthy rhythm',
        title: 'The Celebration Flow',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-[2rem] border border-orange-100 bg-white/78 shadow-lg rotate-2',
        frameClass: 'rounded-[2.5rem] border border-orange-100 bg-white/70 p-5 sm:p-8 md:p-12 shadow-[0_28px_90px_rgba(165,109,82,0.14)]',
        spineClass: 'bg-gradient-to-b from-transparent via-primary/40 to-transparent',
        cardClass: 'rounded-[2rem] border border-orange-100 bg-[#fff7ef]/80',
        timeClass: 'text-primary/75',
        eventClass: 'text-[#5A4134]',
        iconFrameClass: 'rounded-[1.5rem] border border-orange-100 bg-[#fff7ef] shadow-md rotate-3',
        connectorClass: 'bg-orange-200',
        reminderCardClass: 'rounded-[2rem] border border-orange-100 bg-[#fff7ef]/75',
        reminderTextClass: 'text-[#5A4134]/70',
        ornament: 'botanical',
    },
    whimsical: {
        eyebrow: 'Storybook schedule',
        title: 'A Little Wedding Adventure',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-[2rem] border border-purple-100 bg-white/80 shadow-lg -rotate-2',
        frameClass: 'rounded-[2.5rem] border border-purple-100 bg-white/70 p-5 sm:p-8 md:p-12 shadow-[0_28px_90px_rgba(141,123,196,0.14)]',
        spineClass: 'bg-gradient-to-b from-purple-100 via-primary/45 to-purple-100',
        cardClass: 'rounded-[2rem] border border-purple-100 bg-white/80 shadow-sm',
        timeClass: 'text-primary/70',
        eventClass: 'text-[#4D4165]',
        iconFrameClass: 'rounded-[1.5rem] border border-purple-100 bg-purple-50 shadow-md',
        connectorClass: 'bg-purple-200',
        reminderCardClass: 'rounded-[2rem] border border-purple-100 bg-purple-50/55',
        reminderTextClass: 'text-[#4D4165]/70',
        ornament: 'dots',
    },
    urban: {
        eyebrow: 'City sequence',
        title: 'The Night Moves',
        maxWidth: 'max-w-6xl',
        headerBadgeClass: 'rounded-none border border-primary/60 bg-black shadow-[0_0_30px_rgba(255,77,90,0.2)]',
        frameClass: 'rounded-none border border-white/10 bg-black/75 p-5 sm:p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.55)]',
        spineClass: 'bg-gradient-to-b from-transparent via-primary to-transparent',
        cardClass: 'rounded-none border border-white/10 bg-white/[0.05]',
        timeClass: 'text-primary',
        eventClass: 'text-white/90',
        iconFrameClass: 'rounded-none border border-primary/60 bg-black shadow-[0_0_24px_rgba(255,77,90,0.22)]',
        connectorClass: 'bg-primary/70',
        reminderCardClass: 'rounded-none border border-white/10 bg-white/[0.05]',
        reminderTextClass: 'text-white/76',
        ornament: 'rails',
    },
    tropical: {
        eyebrow: 'Island flow',
        title: 'Paradise Program',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-full border border-teal-100 bg-white/80 shadow-lg',
        frameClass: 'rounded-[2.5rem] border border-teal-100 bg-white/72 p-5 sm:p-8 md:p-12 shadow-[0_28px_90px_rgba(11,143,123,0.14)]',
        spineClass: 'bg-gradient-to-b from-teal-100 via-primary/55 to-teal-100',
        cardClass: 'rounded-[1.75rem] border border-teal-100 bg-white/80',
        timeClass: 'text-primary/75',
        eventClass: 'text-[#124C45]',
        iconFrameClass: 'rounded-full border border-teal-100 bg-[#effcf8] shadow-md',
        connectorClass: 'bg-teal-200',
        reminderCardClass: 'rounded-[1.75rem] border border-teal-100 bg-[#effcf8]/75',
        reminderTextClass: 'text-[#124C45]/70',
        ornament: 'botanical',
    },
    midnight: {
        eyebrow: 'After-hours order',
        title: 'Midnight Program',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-full border border-primary/45 bg-[#05060a] shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
        frameClass: 'rounded-[1.5rem] border border-primary/30 bg-[#05060a]/75 p-5 sm:p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.55)]',
        spineClass: 'bg-gradient-to-b from-transparent via-primary/70 to-transparent',
        cardClass: 'rounded-[1.25rem] border border-primary/25 bg-white/[0.055]',
        timeClass: 'text-primary/80',
        eventClass: 'text-white/90',
        iconFrameClass: 'rounded-full border border-primary/45 bg-[#05060a] shadow-lg',
        connectorClass: 'bg-primary/45',
        reminderCardClass: 'rounded-[1.25rem] border border-primary/25 bg-white/[0.05]',
        reminderTextClass: 'text-white/68',
    },
    sakura: {
        eyebrow: 'Petal by petal',
        title: 'The Blossom Program',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-[2rem] border border-pink-100 bg-white/82 shadow-lg',
        frameClass: 'rounded-[2.75rem] border border-pink-100 bg-white/72 p-5 sm:p-8 md:p-12 shadow-[0_28px_90px_rgba(216,141,169,0.14)]',
        spineClass: 'bg-gradient-to-b from-pink-100 via-primary/45 to-pink-100',
        cardClass: 'rounded-[2rem] border border-pink-100 bg-white/82',
        timeClass: 'text-primary/72',
        eventClass: 'text-[#5C4650]',
        iconFrameClass: 'rounded-[1.5rem] border border-pink-100 bg-pink-50 shadow-md',
        connectorClass: 'bg-pink-200',
        reminderCardClass: 'rounded-[2rem] border border-pink-100 bg-pink-50/50',
        reminderTextClass: 'text-[#5C4650]/70',
        ornament: 'dots',
    },
    vogue: {
        eyebrow: 'Run of show',
        title: 'The Edit',
        maxWidth: 'max-w-6xl',
        headerBadgeClass: 'rounded-full border border-black bg-white',
        frameClass: 'rounded-none border border-black bg-white p-5 sm:p-8 md:p-12 shadow-[22px_22px_0_rgba(0,0,0,0.06)]',
        spineClass: 'bg-black',
        cardClass: 'rounded-none border border-black bg-white',
        timeClass: 'text-black/68',
        eventClass: 'text-black',
        iconFrameClass: 'rounded-full border border-black bg-white shadow-none',
        connectorClass: 'bg-black',
        reminderCardClass: 'rounded-none border border-black bg-white',
        reminderTextClass: 'text-black/62',
        ornament: 'rails',
    },
    rustic: {
        eyebrow: 'Barn glow timing',
        title: 'The Gathered Day',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-sm border border-[#bb8e60]/40 bg-[#fff8ee] shadow-md',
        frameClass: 'rounded-sm border border-[#bb8e60]/35 bg-[#fff8ee]/85 p-5 sm:p-8 md:p-12 shadow-[0_26px_80px_rgba(140,100,70,0.16)]',
        spineClass: 'bg-gradient-to-b from-transparent via-[#8C6446]/55 to-transparent',
        cardClass: 'rounded-sm border border-[#bb8e60]/30 bg-white/68',
        timeClass: 'text-[#8C6446]/80',
        eventClass: 'text-[#4A3324]',
        iconFrameClass: 'rounded-sm border border-[#bb8e60]/40 bg-[#fff8ee] shadow-md',
        connectorClass: 'bg-[#d8b58f]',
        reminderCardClass: 'rounded-sm border border-[#bb8e60]/30 bg-white/62',
        reminderTextClass: 'text-[#4A3324]/70',
    },
    film: {
        eyebrow: 'Analog sequence',
        title: 'The Film Roll',
        maxWidth: 'max-w-6xl',
        headerBadgeClass: 'rounded-sm border border-white/15 bg-black/45',
        frameClass: 'rounded-sm border border-white/10 bg-black/35 p-5 sm:p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.52)] sepia-[0.12]',
        spineClass: 'bg-gradient-to-b from-transparent via-primary/70 to-transparent',
        cardClass: 'rounded-sm border border-white/10 bg-white/[0.06]',
        timeClass: 'text-primary/80',
        eventClass: 'text-white/86',
        iconFrameClass: 'rounded-sm border border-white/15 bg-black/65 shadow-lg',
        connectorClass: 'bg-primary/45',
        reminderCardClass: 'rounded-sm border border-white/10 bg-white/[0.06]',
        reminderTextClass: 'text-white/76',
        ornament: 'film',
    },
    glitch: {
        eyebrow: 'Signal path',
        title: 'The Event Signal',
        maxWidth: 'max-w-6xl',
        headerBadgeClass: 'rounded-none border border-cyan-300/60 bg-black shadow-[0_0_28px_rgba(78,242,224,0.22)]',
        frameClass: 'rounded-none border border-cyan-300/35 bg-black/78 p-5 sm:p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.58)]',
        spineClass: 'bg-gradient-to-b from-fuchsia-400/0 via-cyan-300 to-fuchsia-400/0',
        cardClass: 'rounded-none border border-cyan-300/25 bg-cyan-300/[0.04]',
        timeClass: 'text-cyan-200',
        eventClass: 'text-white/90',
        iconFrameClass: 'rounded-none border border-cyan-300/55 bg-black shadow-[0_0_24px_rgba(78,242,224,0.24)]',
        connectorClass: 'bg-cyan-300/70',
        reminderCardClass: 'rounded-none border border-cyan-300/25 bg-cyan-300/[0.04]',
        reminderTextClass: 'text-white/76',
        ornament: 'signal',
    },
    vintage: {
        eyebrow: 'Keepsake order',
        title: 'The Postcard Program',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-sm border border-primary/35 bg-[#fcf7ef] shadow-md',
        frameClass: 'rounded-sm border border-primary/30 bg-[#fcf7ef]/88 p-5 sm:p-8 md:p-12 shadow-[0_26px_80px_rgba(166,124,82,0.16)] ring-4 ring-primary/5',
        spineClass: 'bg-gradient-to-b from-transparent via-primary/50 to-transparent',
        cardClass: 'rounded-sm border border-primary/25 bg-[#fffaf0]/78 ring-4 ring-primary/5',
        timeClass: 'text-primary/75',
        eventClass: 'text-[#4A3A31]',
        iconFrameClass: 'rounded-sm border border-primary/30 bg-[#fcf7ef] shadow-md',
        connectorClass: 'bg-primary/25',
        reminderCardClass: 'rounded-sm border border-primary/25 bg-[#fffaf0]/75 ring-4 ring-primary/5',
        reminderTextClass: 'text-[#4A3A31]/70',
        ornament: 'corner',
    },
    editorial: {
        eyebrow: 'Magazine pacing',
        title: 'The Event Edit',
        maxWidth: 'max-w-6xl',
        headerBadgeClass: 'rounded-none border border-black/20 bg-white',
        frameClass: 'rounded-none border border-black/10 bg-white p-5 sm:p-8 md:p-12 shadow-[20px_20px_0_rgba(0,0,0,0.05)]',
        spineClass: 'bg-black/85',
        cardClass: 'rounded-none border border-black/10 bg-white',
        timeClass: 'text-black/68',
        eventClass: 'text-black',
        iconFrameClass: 'rounded-none border border-black/15 bg-white shadow-none',
        connectorClass: 'bg-black/70',
        reminderCardClass: 'rounded-none border border-black/10 bg-white',
        reminderTextClass: 'text-black/62',
        ornament: 'rails',
    },
    royal: {
        eyebrow: 'Royal order',
        title: 'The Court Program',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-full border border-primary/45 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
        frameClass: 'rounded-none border border-primary/35 bg-black/62 p-5 sm:p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.55)]',
        spineClass: 'bg-gradient-to-b from-transparent via-primary/70 to-transparent',
        cardClass: 'rounded-none border border-primary/30 bg-white/[0.055]',
        timeClass: 'text-primary/80',
        eventClass: 'text-white/90',
        iconFrameClass: 'rounded-full border border-primary/45 bg-black shadow-lg',
        connectorClass: 'bg-primary/45',
        reminderCardClass: 'rounded-none border border-primary/30 bg-white/[0.05]',
        reminderTextClass: 'text-white/68',
        ornament: 'corner',
    },
    garden: {
        eyebrow: 'Garden path',
        title: 'The Conservatory Program',
        maxWidth: 'max-w-5xl',
        headerBadgeClass: 'rounded-full border border-green-100 bg-white/80 shadow-lg',
        frameClass: 'rounded-[2.5rem] border border-green-100 bg-white/74 p-5 sm:p-8 md:p-12 shadow-[0_28px_90px_rgba(83,122,87,0.14)]',
        spineClass: 'bg-gradient-to-b from-green-100 via-primary/50 to-green-100',
        cardClass: 'rounded-[1.75rem] border border-green-100 bg-white/82',
        timeClass: 'text-primary/75',
        eventClass: 'text-[#27422A]',
        iconFrameClass: 'rounded-full border border-green-100 bg-[#f8fbf5] shadow-md',
        connectorClass: 'bg-green-200',
        reminderCardClass: 'rounded-[1.75rem] border border-green-100 bg-[#f8fbf5]/80',
        reminderTextClass: 'text-[#27422A]/70',
        ornament: 'botanical',
    },
};

const STYLE_VARIANT_TIMELINE_DESIGNS: Record<string, Partial<TimelineDesign>> = {
    'luxury-planner': {
        eyebrow: 'Planner-led flow',
        title: 'The Celebration Plan',
        headerBadgeClass: 'rounded-none border border-[#b9975b]/35 bg-[#fbf7ef] shadow-[0_20px_60px_rgba(43,37,32,0.10)]',
        frameClass: 'rounded-none border border-[#b9975b]/30 bg-[#fbf7ef]/86 p-5 shadow-[0_28px_90px_rgba(43,37,32,0.14)] sm:p-8 md:p-12',
        spineClass: 'bg-gradient-to-b from-transparent via-[#b9975b]/70 to-transparent',
        cardClass: 'rounded-none border border-[#b9975b]/25 bg-white/78 shadow-sm',
        timeClass: 'text-[#b9975b]',
        eventClass: 'text-[#2b2520]',
        iconFrameClass: 'rounded-none border border-[#b9975b]/45 bg-white shadow-md',
        connectorClass: 'bg-[#b9975b]/45',
        reminderCardClass: 'rounded-none border border-[#b9975b]/25 bg-white/72',
        reminderTextClass: 'text-[#6f645b]',
        ornament: 'rails',
    },
    'editorial-photo': {
        eyebrow: 'Photo-led pacing',
        title: 'The Event Sequence',
        headerBadgeClass: 'rounded-none border border-black/20 bg-white',
        frameClass: 'rounded-none border border-black/10 bg-[#f7f3ee] p-5 shadow-[20px_20px_0_rgba(0,0,0,0.05)] sm:p-8 md:p-12',
        cardClass: 'rounded-none border border-black/10 bg-white',
        timeClass: 'text-black/68',
        eventClass: 'text-black',
        iconFrameClass: 'rounded-none border border-black/15 bg-white shadow-none',
        ornament: 'rails',
    },
    'romantic-estate': {
        eyebrow: 'Estate rhythm',
        title: 'The Romantic Program',
        headerBadgeClass: 'rounded-full border border-[#efd3d8] bg-white/82 shadow-lg shadow-[#b97983]/10',
        frameClass: 'rounded-[2.75rem] border border-[#efd3d8] bg-white/72 p-5 shadow-[0_28px_90px_rgba(185,121,131,0.14)] sm:p-8 md:p-12',
        spineClass: 'bg-gradient-to-b from-transparent via-[#b97983]/50 to-transparent',
        cardClass: 'rounded-[2rem] border border-[#efd3d8] bg-white/82',
        timeClass: 'text-[#b97983]',
        eventClass: 'text-[#55373b]',
        iconFrameClass: 'rounded-full border border-[#efd3d8] bg-[#fff8f5] shadow-md',
        connectorClass: 'bg-[#efd3d8]',
        reminderCardClass: 'rounded-[2rem] border border-[#efd3d8] bg-[#fff8f5]/75',
        reminderTextClass: 'text-[#816066]',
        ornament: 'dots',
    },
};

function getTimelineDesign(template: string, templateStyle?: string) {
    const base = TIMELINE_DESIGNS[template] || TIMELINE_DESIGNS.classic;
    const variant = templateStyle && templateStyle !== 'default' ? STYLE_VARIANT_TIMELINE_DESIGNS[templateStyle] : undefined;
    return {
        ...base,
        ...(variant || {}),
    };
}

function TimelineReminderIllustration({ variant, color }: { variant: 'time' | 'finish' | 'enjoy'; color: string }) {
    if (variant === 'finish') {
        return (
            <svg viewBox="0 0 120 72" className="mx-auto h-16 w-24" fill="none" aria-hidden="true">
                <path d="M22 56c15-18 61-18 76 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <path d="M42 50c-5-11-2-27 11-31 8-2 15 1 19 8 10-2 17 3 19 12 2 7-1 14-7 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M51 30c6 7 14 7 21 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <path d="M35 61h50" stroke={color} strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    if (variant === 'enjoy') {
        return (
            <svg viewBox="0 0 120 72" className="mx-auto h-16 w-24" fill="none" aria-hidden="true">
                <path d="M36 56c6-18 10-29 24-29s18 11 24 29" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <path d="M47 30c4 5 8 8 13 8s9-3 13-8" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <path d="M25 22l8 7M95 22l-8 7M60 9v10M36 13l5 9M84 13l-5 9" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <path d="M43 58h34" stroke={color} strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 120 72" className="mx-auto h-16 w-24" fill="none" aria-hidden="true">
            <circle cx="60" cy="34" r="20" stroke={color} strokeWidth="2" />
            <path d="M60 22v13l9 6M37 18l-7-7M83 18l7-7M44 59l-7 7M76 59l7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M44 13c5-5 27-5 32 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function TimelineOrnament({ type, color }: { type?: TimelineDesign['ornament']; color: string }) {
    if (!type) return null;

    if (type === 'film') {
        return (
            <>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.14)_0_12px,transparent_12px_28px)]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.10)_0_12px,transparent_12px_28px)]" />
            </>
        );
    }

    if (type === 'signal') {
        return (
            <>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
                <div className="pointer-events-none absolute left-0 top-10 h-px w-full bg-gradient-to-r from-transparent via-fuchsia-400/50 to-transparent" />
            </>
        );
    }

    if (type === 'rails') {
        return (
            <>
                <div className="pointer-events-none absolute left-4 top-4 bottom-4 hidden w-px bg-current opacity-10 md:block" />
                <div className="pointer-events-none absolute right-4 top-4 bottom-4 hidden w-px bg-current opacity-10 md:block" />
            </>
        );
    }

    if (type === 'dots') {
        return (
            <div
                className="pointer-events-none absolute inset-4 opacity-20"
                style={{ backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`, backgroundSize: '18px 18px' }}
            />
        );
    }

    if (type === 'botanical') {
        return (
            <svg viewBox="0 0 220 220" className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 opacity-20" fill="none" aria-hidden="true">
                <path d="M42 174C68 109 111 62 174 35" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <path d="M80 118c-28-7-43 4-47 21 24 6 39-1 47-21ZM112 83c-23-18-42-14-53-1 20 16 36 17 53 1ZM145 55c-14-24-33-28-48-20 13 21 28 28 48 20Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            </svg>
        );
    }

    return (
        <>
            <div className="pointer-events-none absolute left-4 top-4 h-12 w-12 border-l border-t opacity-25" style={{ borderColor: color }} />
            <div className="pointer-events-none absolute bottom-4 right-4 h-12 w-12 border-b border-r opacity-25" style={{ borderColor: color }} />
        </>
    );
}

/**
 * Parses a free-text program timeline into structured {time, event} pairs.
 * Supports formats like:
 *   "2:00 PM - Guest Arrival"
 *   "14:00 Ceremony begins"
 *   "3pm | Reception"
 *   Plain lines with no time are rendered as-is in the event column.
 */
function parseTimeline(raw: string): TimelineItem[] {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
        // Pattern: optional time prefix + delimiter + event name
        const match = line.match(
            /^(\d{1,2}(?::\d{2})?(?:\s?[apAP][mM])?)\s*[-–|:•]\s*(.+)$/
        );
        if (match) {
            return { time: match[1].trim(), event: match[2].trim() };
        }
        // No time detected — treat full line as event with empty time
        return { time: '', event: line };
    });
}

export default function TimelineSection({ timeline, wedding, id }: TimelineSectionProps) {
    const { registerSection, unregisterSection } = useSectionContext();
    
    useEffect(() => {
        registerSection(id, 'Timeline');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);
    
    if (!timeline) return null;

    const items = parseTimeline(timeline);
    const hasAnyTime = items.some(i => i.time !== '');

    const template = wedding?.template || 'classic';
    const templateStyle = wedding?.template_style;
    const motifColor = wedding?.motif_color || '#D16C78';
    const visual = getTemplateVisualProfile(template, motifColor);
    const titleStyle = getSectionTitleStyle(wedding || {}, visual.headingClass);
    const design = getTimelineDesign(template, templateStyle);
    const isSharp = visual.isSharp;
    const isDark = visual.isDark;
    const isVintage = ['vintage', 'rustic', 'boho', 'artdeco'].includes(template);

    return (
        <section id={id} className={`py-16 sm:py-24 md:py-32 relative z-10 overflow-hidden ${visual.sectionClass}`} style={visual.sectionStyle}>
            {visual.ornament === 'film' && <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0_12px,transparent_12px_26px)]" />}
            <div className={`${design.maxWidth} mx-auto px-4 sm:px-6 md:px-8 relative`}>
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mb-8 sm:mb-12 md:mb-16"
                >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto flex items-center justify-center mb-4 sm:mb-6 min-h-[44px] min-w-[44px] ${design.headerBadgeClass}`}>
                        <Clock className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-primary' : 'text-primary'}`} />
                    </div>
                    <p className={`mb-4 text-[10px] font-black uppercase ${visual.eyebrowClass}`}>{design.eyebrow}</p>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-sm ${titleStyle.className}`} style={titleStyle.style}>
                        {design.title}
                    </h2>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        <span className={`border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${isDark ? 'border-white/10 bg-white/5 text-white/75' : 'border-primary/10 bg-white/55 text-[#4A4444]/70'}`}>
                            {items.length} {items.length === 1 ? 'moment' : 'moments'}
                        </span>
                        {hasAnyTime && (
                            <span className={`border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${isDark ? 'border-white/10 bg-white/5 text-white/75' : 'border-primary/10 bg-white/55 text-[#4A4444]/70'}`}>
                                Guest-friendly timing
                            </span>
                        )}
                    </div>
                    {isVintage && (
                        <div className="flex items-center justify-center gap-3 mt-4 opacity-70">
                            <div className="h-px w-16 bg-primary" />
                            <span className="text-primary text-xs tracking-widest uppercase">✦</span>
                            <div className="h-px w-16 bg-primary" />
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, type: 'spring' }}
                    className={`relative overflow-hidden ${design.frameClass}`}
                >
                    <TimelineOrnament type={design.ornament} color={motifColor} />
                    <div className="relative">
                        <div className={`absolute bottom-5 left-[1.375rem] top-5 w-px sm:left-6 md:left-1/2 md:-translate-x-1/2 ${design.spineClass}`} />
                        <div className="space-y-6 sm:space-y-8">
                            {items.map((item, idx) => {
                                const Icon = timelineIcons[idx % timelineIcons.length];
                                const isLeft = idx % 2 === 0;
                                const cardAlignmentClass = isLeft
                                    ? 'md:order-1 md:text-right'
                                    : 'md:order-3 md:text-left';

                                return (
                                    <motion.div
                                        key={`${item.time}-${item.event}-${idx}`}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.06 }}
                                        className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4 md:grid-cols-[1fr_5rem_1fr] md:gap-5"
                                    >
                                        <div className={`order-2 min-w-0 p-4 text-left backdrop-blur sm:p-5 ${cardAlignmentClass} ${design.cardClass}`}>
                                            <div className={`mb-3 inline-flex items-center gap-2 border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.22em] ${isDark ? 'border-white/10 bg-white/5' : 'border-primary/10 bg-white/45'} ${design.timeClass}`}>
                                                <span>{String(idx + 1).padStart(2, '0')}</span>
                                                <span className={`h-px w-4 ${design.connectorClass}`} />
                                                <span>{item.time || (hasAnyTime ? 'Soon' : `Part ${idx + 1}`)}</span>
                                            </div>
                                            <p className={`break-words font-serif text-base leading-snug sm:text-lg md:text-xl ${design.eventClass}`}>
                                                {item.event}
                                            </p>
                                        </div>

                                        <div className={`relative z-10 order-1 mx-auto flex h-11 w-11 items-center justify-center sm:h-12 sm:w-12 md:order-2 md:h-16 md:w-16 ${design.iconFrameClass}`} style={{ borderColor: `${motifColor}55`, color: motifColor }}>
                                            <Icon className={`h-5 w-5 stroke-[1.6] sm:h-6 sm:w-6 md:h-7 md:w-7 ${template === 'artdeco' ? '-rotate-45' : ''}`} />
                                        </div>

                                        <div className={`hidden md:flex ${isLeft ? 'order-3' : 'order-1'} items-center justify-center`}>
                                            <div className={`h-px w-8 sm:w-12 md:w-16 ${design.connectorClass}`} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`relative mt-10 grid gap-3 border-t pt-8 sm:grid-cols-3 ${isDark ? 'border-white/10' : 'border-primary/10'}`}>
                        {[
                            { title: 'Be on Time', body: 'Arrive early, settle in, and enjoy every transition with ease.', variant: 'time' as const },
                            { title: 'Finish the Event', body: 'Stay through the special moments, final photos, and closing send-off.', variant: 'finish' as const },
                            { title: 'Enjoy and Have Fun', body: 'Celebrate freely, take photos, dance, and make memories with us.', variant: 'enjoy' as const },
                        ].map((reminder) => (
                            <div key={reminder.title} className={`p-4 text-center ${design.reminderCardClass}`}>
                                <TimelineReminderIllustration variant={reminder.variant} color={motifColor} />
                                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-primary">{reminder.title}</p>
                                <p className={`mt-2 text-xs leading-5 ${design.reminderTextClass}`}>{reminder.body}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
