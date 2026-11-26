'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CalendarHeart, ChevronDown } from 'lucide-react';
import { useSectionActions } from '@/context/SectionContext';
import { getSectionTitleStyle, getTemplateVisualProfile } from '@/lib/theme-engine';
import type { Wedding } from '@/types/wedding';
import { buildSmartCalendarLinks } from './SmartCalendar';

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
    wedding?: Wedding;
}

function parseWeddingTargetDate(weddingDate: string, weddingTime?: string): Date | null {
    if (!weddingDate) return null;

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

    if (Number.isNaN(target.getTime())) return null;

    if (weddingTime && typeof weddingTime === 'string' && weddingTime.trim().length > 0) {
        // Support single times ("4:00 PM", "16:30:00") and ranges ("4:00 PM - 10:00 PM")
        const startSegment = weddingTime.trim().split(/\s*(?:-|–|—|to)\s*/i)[0]?.trim() || '';
        const timeMatch = startSegment.match(/^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?\s*(am|pm)?$/i);
        if (timeMatch) {
            let hour = Number(timeMatch[1]);
            const minute = Number(timeMatch[2] || 0);
            const second = Number(timeMatch[3] || 0);
            if (hour <= 23 && minute <= 59 && second <= 59 && (!timeMatch[4] || hour <= 12)) {
                if (timeMatch[4]) hour = (hour % 12) + (timeMatch[4].toLowerCase() === 'pm' ? 12 : 0);
                target.setHours(hour, minute, second, 0);
            }
        }
    } else {
        target.setHours(12, 0, 0, 0);
    }

    return target;
}

function MiniWeddingCalendar({
    date,
    motifColor,
    isDark,
}: {
    date: Date;
    motifColor: string;
    isDark: boolean;
}) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const selectedDay = date.getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div
            data-wedding-card="true"
            className={`mx-auto mt-8 max-w-[17rem] border px-5 py-4 ${
                isDark
                    ? 'border-white/15 bg-white/[0.04] text-white'
                    : 'border-current/15 bg-white/75 text-current'
            } rounded-2xl`}
            aria-label={`Wedding calendar: ${date.toLocaleDateString('en-US', { dateStyle: 'full' })}`}
        >
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.26em] opacity-80">
                {monthLabel}
            </p>
            <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase opacity-55">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                    <span key={idx}>{d}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs tabular-nums">
                {Array.from({ length: firstWeekday }).map((_, i) => (
                    <span key={`empty-${i}`} aria-hidden="true" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const isWeddingDay = day === selectedDay;
                    return (
                        <span
                            key={day}
                            aria-current={isWeddingDay ? 'date' : undefined}
                            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${
                                isWeddingDay ? 'font-semibold text-white shadow-sm' : 'opacity-75'
                            }`}
                            style={isWeddingDay ? { backgroundColor: motifColor } : undefined}
                        >
                            {day}
                        </span>
                    );
                })}
            </div>
        </div>
    );
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
    wedding,
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isPast, setIsPast] = useState(false);
    const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isMounted = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
    const { registerSection, unregisterSection } = useSectionActions();

    useEffect(() => {
        registerSection(id, 'Countdown');
        return () => unregisterSection(id);
    }, [id, registerSection, unregisterSection]);

    useEffect(() => {
        const target = parseWeddingTargetDate(weddingDate, weddingTime);
        if (!target) return;

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

    useEffect(() => {
        if (!calendarMenuOpen) return;
        const onPointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setCalendarMenuOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setCalendarMenuOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [calendarMenuOpen]);

    const visual = getTemplateVisualProfile(template, motifColor, invert, cardStyle);
    const titleStyle = wedding ? getSectionTitleStyle(wedding, visual.headingClass) : { className: visual.headingClass, style: undefined };
    const isEditorial = visual.mood === 'editorial' || visual.mood === 'nordic';
    const isStationeryMood = visual.isVintage || visual.isOrganic || visual.mood === 'classic' || visual.mood === 'romantic' || visual.mood === 'playful';
    const isDark = visual.isDark;
    const isSharp = visual.isSharp;
    const targetDate = parseWeddingTargetDate(weddingDate, weddingTime);
    const calendarLinks = buildSmartCalendarLinks({
        bride_name: brideName,
        groom_name: groomName,
        wedding_date: weddingDate,
        wedding_time: weddingTime || '',
        venue_name: venueName || '',
        venue_address: venueAddress,
    });

    const units = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    return (
        <section
            data-wedding-section="CountdownTimer"
            id={id}
            className={`px-4 py-12 sm:px-6 sm:py-16 ${visual.sectionClass} ${className}`}
            style={visual.sectionStyle}
        >
            <div className={`mx-auto text-center ${isEditorial ? 'max-w-4xl' : 'max-w-3xl'}`}>
                <p className={`mb-2 text-[11px] font-medium uppercase tracking-[0.28em] opacity-75 ${visual.eyebrowClass}`}>
                    {isMounted && isPast ? 'Celebrating Forever' : 'Save the Date'}
                </p>
                <h2 className={`text-2xl sm:text-3xl md:text-4xl ${titleStyle.className}`} style={titleStyle.style}>
                    {isMounted && isPast ? 'Our wedding day has arrived' : <>Counting down <span className={isEditorial ? '' : 'italic'}>to forever</span></>}
                </h2>

                <div
                    role="timer"
                    aria-label="Time until the wedding"
                    className={`my-7 grid grid-cols-4 divide-x border-y py-6 sm:py-8 ${
                        isDark
                            ? 'divide-white/15 border-white/15 text-white'
                            : 'divide-black/12 border-black/12 text-[#352C2C]'
                    }`}
                >
                    {units.map((unit) => (
                        <div key={unit.label} className="min-w-0 px-1 sm:px-4">
                            <span
                                className={`block font-serif tabular-nums leading-none ${
                                    isEditorial ? 'text-3xl font-light sm:text-5xl' : 'text-3xl sm:text-5xl md:text-6xl'
                                }`}
                            >
                                {isMounted ? String(unit.value).padStart(2, '0') : '--'}
                            </span>
                            <span className="mt-3 block text-[10px] font-medium uppercase tracking-[0.22em] opacity-70 sm:text-[11px]">
                                {unit.label}
                            </span>
                        </div>
                    ))}
                </div>

                {(!isMounted || !isPast) && isStationeryMood && targetDate && (
                    <MiniWeddingCalendar date={targetDate} motifColor={motifColor} isDark={isDark} />
                )}

                {(!isMounted || !isPast) && calendarLinks && (
                    <div ref={menuRef} className="relative mt-7 inline-block">
                        <button
                            data-wedding-control="secondary"
                            type="button"
                            aria-expanded={calendarMenuOpen}
                            aria-haspopup="menu"
                            onClick={() => setCalendarMenuOpen((prev) => !prev)}
                            className={`inline-flex min-h-11 items-center gap-2 border border-current/25 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${
                                isSharp ? 'rounded-none' : 'rounded-full'
                            } ${visual.bodyClass}`}
                        >
                            <CalendarHeart className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Save the date</span>
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${calendarMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>

                        {calendarMenuOpen && (
                            <div
                                role="menu"
                                aria-label="Add wedding to calendar"
                                className={`absolute left-1/2 top-full z-40 mt-2 w-52 -translate-x-1/2 overflow-hidden border p-1.5 text-left shadow-xl backdrop-blur-xl ${
                                    isSharp ? 'rounded-none' : 'rounded-xl'
                                } ${
                                    isDark
                                        ? 'border-white/15 bg-[#151418]/95 text-white'
                                        : 'border-stone-200 bg-white/95 text-stone-800'
                                }`}
                            >
                                <a
                                    role="menuitem"
                                    href={calendarLinks.google}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setCalendarMenuOpen(false)}
                                    className={`flex min-h-10 items-center px-3 py-2 text-xs font-medium ${isSharp ? 'rounded-none' : 'rounded-lg'} ${isDark ? 'hover:bg-white/10' : 'hover:bg-stone-100'}`}
                                >
                                    Google Calendar
                                </a>
                                <a
                                    role="menuitem"
                                    href={calendarLinks.apple}
                                    download={`${brideName}-${groomName}-wedding.ics`}
                                    onClick={() => setCalendarMenuOpen(false)}
                                    className={`flex min-h-10 items-center px-3 py-2 text-xs font-medium ${isSharp ? 'rounded-none' : 'rounded-lg'} ${isDark ? 'hover:bg-white/10' : 'hover:bg-stone-100'}`}
                                >
                                    Apple Calendar (.ics)
                                </a>
                                <a
                                    role="menuitem"
                                    href={calendarLinks.outlook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setCalendarMenuOpen(false)}
                                    className={`flex min-h-10 items-center px-3 py-2 text-xs font-medium ${isSharp ? 'rounded-none' : 'rounded-lg'} ${isDark ? 'hover:bg-white/10' : 'hover:bg-stone-100'}`}
                                >
                                    Outlook Calendar
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
