'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
    weddingDate: string;
    weddingTime?: string;
    brideName: string;
    groomName: string;
    venueName?: string;
    venueAddress?: string;
    className?: string;
}

function generateICS(props: CountdownTimerProps): string {
    const date = new Date(props.weddingDate);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatDate = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    // Set time if provided
    if (props.weddingTime) {
        const [h, m] = props.weddingTime.split(':').map(Number);
        date.setHours(h || 0, m || 0);
    }

    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 4); // 4 hour default event

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//QuickWeds//EN',
        'BEGIN:VEVENT',
        `DTSTART:${formatDate(date)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${props.brideName} & ${props.groomName}'s Wedding`,
        `LOCATION:${props.venueName || ''}${props.venueAddress ? ', ' + props.venueAddress : ''}`,
        `DESCRIPTION:You are invited to the wedding of ${props.brideName} and ${props.groomName}. We can't wait to celebrate with you!`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
}

export default function CountdownTimer({
    weddingDate,
    weddingTime,
    brideName,
    groomName,
    venueName,
    venueAddress,
    className = '',
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isPast, setIsPast] = useState(false);

    useEffect(() => {
        const target = new Date(weddingDate);
        if (weddingTime) {
            const [h, m] = weddingTime.split(':').map(Number);
            target.setHours(h || 0, m || 0);
        }

        const update = () => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                setIsPast(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

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
        const ics = generateICS({ weddingDate, weddingTime, brideName, groomName, venueName, venueAddress });
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${brideName}-${groomName}-wedding.ics`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const units = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    if (isPast) {
        return (
            <section className={`py-16 px-6 text-center ${className}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-serif mb-4">🎉 Today is the Day!</h2>
                    <p className="text-xl font-serif italic opacity-70">The celebration has begun.</p>
                </motion.div>
            </section>
        );
    }

    return (
        <section className={`py-16 md:py-24 px-6 ${className}`}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center"
            >
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4 block opacity-60">
                    Counting Down To
                </span>
                <h2 className="text-4xl md:text-5xl font-serif mb-12">The Big Day</h2>

                <div className="grid grid-cols-4 gap-4 md:gap-8 mb-12">
                    {units.map((unit) => (
                        <div
                            key={unit.label}
                            className="p-4 md:p-8 rounded-[2rem] bg-white/80 backdrop-blur-sm soft-shadow border border-primary/5"
                        >
                            <motion.span
                                key={unit.value}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-3xl md:text-5xl font-serif font-bold text-primary block"
                            >
                                {String(unit.value).padStart(2, '0')}
                            </motion.span>
                            <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold opacity-40 mt-2 block">
                                {unit.label}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleAddToCalendar}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-all border border-primary/20"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add to Calendar
                </button>
            </motion.div>
        </section>
    );
}
