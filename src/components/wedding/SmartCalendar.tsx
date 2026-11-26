'use client';

import { motion } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SmartCalendarProps {
    wedding: {
        bride_name: string;
        groom_name: string;
        wedding_date: string;
        wedding_time: string;
        venue_name: string;
        venue_address?: string;
    };
    motifColor: string;
}

export function parseWeddingStartDateTime(weddingDate?: string, weddingTime?: string): Date | null {
    if (!weddingDate || typeof weddingDate !== 'string') return null;

    const dateMatch = weddingDate.trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (!dateMatch) {
        const fallback = new Date(weddingDate);
        return Number.isNaN(fallback.getTime()) ? null : fallback;
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]) - 1;
    const day = Number(dateMatch[3]);
    if (month < 0 || month > 11 || day < 1 || day > 31) return null;

    let hours = 10;
    let minutes = 0;
    if (weddingTime && typeof weddingTime === 'string') {
        const timeMatch = weddingTime.trim().match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/i);
        if (timeMatch) {
            const parsedHours = Number(timeMatch[1]);
            const parsedMinutes = Number(timeMatch[2] || '0');
            const meridiem = timeMatch[3]?.toLowerCase();
            const validHours = meridiem
                ? parsedHours >= 1 && parsedHours <= 12
                : parsedHours >= 0 && parsedHours <= 23;
            if (validHours && parsedMinutes >= 0 && parsedMinutes <= 59) {
                hours = parsedHours;
                minutes = parsedMinutes;
                if (meridiem === 'pm' && hours < 12) hours += 12;
                if (meridiem === 'am' && hours === 12) hours = 0;
            }
        }
    }

    const parsed = new Date(year, month, day, hours, minutes, 0);
    if (
        Number.isNaN(parsed.getTime()) ||
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month ||
        parsed.getDate() !== day
    ) {
        return null;
    }
    return parsed;
}

export function formatLocalCalendarDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

export function formatLocalIsoDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function escapeIcsText(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
}

export function buildSmartCalendarLinks(wedding: SmartCalendarProps['wedding'], now?: Date) {
    const startDateTime = parseWeddingStartDateTime(wedding.wedding_date, wedding.wedding_time);
    if (!startDateTime) return null;

    const title = `Wedding of ${wedding.bride_name || 'Bride'} & ${wedding.groom_name || 'Groom'}`;
    const description = `We can't wait to celebrate with you${wedding.venue_name ? ` at ${wedding.venue_name}` : ''}!`;
    const location = wedding.venue_address || wedding.venue_name || '';

    const endDateTime = new Date(startDateTime.getTime() + 6 * 60 * 60 * 1000); // Default +6 hours
    const startLocal = formatLocalCalendarDateTime(startDateTime);
    const endLocal = formatLocalCalendarDateTime(endDateTime);
    const dtStamp = (now ?? new Date()).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const slugPart = `${wedding.bride_name || 'bride'}-${wedding.groom_name || 'groom'}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'wedding';
    const uid = `${slugPart}-${startLocal}@quickweds.site`;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//QuickWeds//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${startLocal}`,
        `DTEND:${endLocal}`,
        `SUMMARY:${escapeIcsText(title)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
        `LOCATION:${escapeIcsText(location)}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');

    return {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startLocal}/${endLocal}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
        apple: `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`,
        outlook: `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(formatLocalIsoDateTime(startDateTime))}&enddt=${encodeURIComponent(formatLocalIsoDateTime(endDateTime))}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
    };
}

export default function SmartCalendar({ wedding, motifColor }: SmartCalendarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleMouseDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const links = buildSmartCalendarLinks(wedding);
    if (!links) return null;

    return (
        <div ref={containerRef} className="relative inline-block">
            <motion.button
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-3 px-6 py-4 rounded-full bg-white border border-border/50 shadow-lg soft-shadow transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary" style={{ color: motifColor }}>
                    <Calendar className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-foreground">Save the Date</span>
                <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {isOpen && (
                <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full mt-4 left-0 w-64 bg-white border border-border/50 rounded-2xl shadow-2xl p-2 z-[70] backdrop-blur-xl"
                >
                    <a
                        href={links.google}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <span className="text-[10px] font-black text-red-500">G</span>
                        </div>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Google Calendar</span>
                    </a>

                    <a
                        href={links.apple}
                        download="wedding-event.ics"
                        role="menuitem"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center border border-border/20">
                            <span className="text-[10px] font-black text-foreground">A</span>
                        </div>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Apple Calendar</span>
                    </a>

                    <a
                        href={links.outlook}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                            <span className="text-[10px] font-black text-sky-600">O</span>
                        </div>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Outlook Calendar</span>
                    </a>
                </motion.div>
            )}
        </div>
    );
}
