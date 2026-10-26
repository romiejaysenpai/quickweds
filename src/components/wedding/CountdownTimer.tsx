'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { CalendarHeart } from 'lucide-react';
import { useSectionContext } from '@/context/SectionContext';
import { getTemplateVisualProfile } from '@/lib/theme-engine';

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface CountdownTimerProps {
    weddingDate: string;
    weddingTime?: string;
    brideName: string;
    groomName: string;
    venueName?: string;
    venueAddress?: string;
    className?: string;
    id: string;
    template?: string;
    motifColor?: string;
    cardStyle?: string;
    invert?: boolean;
}

function generateICS(props: CountdownTimerProps): string {
    const date = parseWeddingTargetDate(props.weddingDate, props.weddingTime);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatDate = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 4); 

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//QuickWeds//EN',
        'BEGIN:VEVENT',
        `DTSTART:${formatDate(date)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${props.brideName} & ${props.groomName}'s Wedding`,
        `LOCATION:${props.venueName || ''}${props.venueAddress ? ', ' + props.venueAddress : ''}`,
        `DESCRIPTION:We can't wait to celebrate our special day with you!\\n\\n${props.brideName} & ${props.groomName}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\\r\\n');
}

function parseWeddingTargetDate(weddingDate: string, weddingTime?: string): Date {
    if (!weddingDate) return new Date();

    const cleanDateStr = String(weddingDate).trim();
    const dateMatch = cleanDateStr.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    let target: Date;

    if (dateMatch) {
        const year = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1;
        const day = parseInt(dateMatch[3], 10);
        target = new Date(year, month, day);
    } else {
        target = new Date(weddingDate);
    }

    if (weddingTime && typeof weddingTime === 'string' && weddingTime.trim().length > 0) {
        const timeMatch = weddingTime.trim().match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/i);
        if (timeMatch) {
            let hour = Number(timeMatch[1]);
            const minute = Number(timeMatch[2] || 0);
            if (hour <= 23 && minute <= 59 && (!timeMatch[3] || hour <= 12)) {
                if (timeMatch[3]) hour = (hour % 12) + (timeMatch[3].toLowerCase() === 'pm' ? 12 : 0);
                target.setHours(hour, minute, 0, 0);
            }
        }
    } else {
        target.setHours(12, 0, 0, 0); // Default to 12:00 PM local time
    }

    return target;
}

export default function CountdownTimer({
    weddingDate,
    weddingTime,
    brideName,
    groomName,
    venueName,
    venueAddress,
    className = '',
    id,
    template = 'classic',
    motifColor = '#D16C78',
    cardStyle,
    invert = false,
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isPast, setIsPast] = useState(false);
    const isMounted = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
    const { registerSection, unregisterSection } = useSectionContext();
    
    useEffect(() => {
        registerSection(id, 'Countdown');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    useEffect(() => {
        const target = parseWeddingTargetDate(weddingDate, weddingTime);

        const update = () => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                setIsPast(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setIsPast(false);
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [weddingDate, weddingTime]);

    const handleAddToCalendar = () => {
        const ics = generateICS({ weddingDate, weddingTime, brideName, groomName, venueName, venueAddress, id });
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${brideName}-${groomName}-wedding.ics`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Suppress Hydration issue by displaying generic zeros/empty until mounted, allowing the DOM to match the server output
    if (!isMounted) {
        return (
            <section data-wedding-section="CountdownTimer" id={id} className={`px-4 py-12 text-center min-h-[160px] flex items-center justify-center opacity-0 ${className}`}>
                <div className="sr-only">Loading timer...</div>
            </section>
        );
    }

    const visual = getTemplateVisualProfile(template, motifColor, invert, cardStyle);
    const isEditorial = visual.mood === 'editorial';
    const isDark = visual.isDark;
    const sectionClasses = `${visual.sectionClass} ${className}`;
    const units = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    return (
        <section data-wedding-section="CountdownTimer" id={id} className={`px-4 py-12 sm:px-6 sm:py-16 ${sectionClasses}`} style={visual.sectionStyle}>
            <div className="mx-auto max-w-3xl text-center">
                <h2 className={`text-2xl sm:text-3xl ${visual.headingClass}`}>
                    {isPast ? 'Our wedding day has arrived' : <>Counting down <span className={isEditorial ? '' : 'italic'}>to forever</span></>}
                </h2>
                <div role="timer" aria-label="Time until the wedding" className={`my-7 grid grid-cols-4 divide-x border-y py-6 sm:py-8 ${isDark ? 'divide-white/15 border-white/15 text-white' : 'divide-black/15 border-black/15 text-[#4A4444]'}`}>
                    {units.map((unit) => (
                        <div key={unit.label} className="min-w-0 px-1 sm:px-4">
                            <span className="block font-serif text-3xl tabular-nums leading-none sm:text-5xl">{String(unit.value).padStart(2, '0')}</span>
                            <span className="mt-3 block text-[11px] sm:text-xs uppercase tracking-wider">{unit.label}</span>
                        </div>
                    ))}
                </div>
                {!isPast && <button type="button" onClick={handleAddToCalendar} className={`inline-flex min-h-11 items-center gap-2 border-b border-current/40 px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${visual.bodyClass}`}>
                    <CalendarHeart className="h-4 w-4" aria-hidden="true" /> Save the date
                </button>}
            </div>
        </section>
    );
}
