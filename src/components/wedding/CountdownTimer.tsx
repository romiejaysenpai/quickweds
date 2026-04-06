'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarHeart, MapPin, Sparkles, Clock } from 'lucide-react';

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

    if (props.weddingTime) {
        const [h, m] = props.weddingTime.split(':').map(Number);
        date.setHours(h || 0, m || 0);
    }

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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
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

    // Suppress Hydration issue by displaying generic zeros/empty until mounted, allowing the DOM to match the server output
    if (!isMounted) return <div className="sr-only">Loading timer...</div>;

    if (isPast) {
        return (
            <section className={`py-8 sm:py-12 px-4 sm:px-6 w-full ${className} relative overflow-hidden flex justify-center`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl w-full text-center p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[3rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_5s_infinite]" />
                    <Sparkles className="w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 text-primary mx-auto mb-4 sm:mb-6 animate-pulse" />
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-serif text-primary/90 leading-tight">Happily Ever After <br/><span className="italic font-light">Has Begun</span></h2>
                    <p className="text-base sm:text-lg uppercase tracking-widest font-black opacity-30 mt-4 sm:mt-6 block">We did it!</p>
                </motion.div>
            </section>
        );
    }

    const units = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds },
    ];

    return (
        <section className={`py-12 sm:py-16 md:py-24 px-4 sm:px-6 w-full flex justify-center relative ${className}`}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-100px", once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-5xl w-full"
            >
                <div className="relative p-[1px] rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-b from-white/60 to-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden group">
                    {/* Atmospheric Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-24 sm:h-32 bg-primary/20 blur-[60px] sm:blur-[80px] rounded-full pointer-events-none -translate-y-1/2 transition-opacity duration-1000 opacity-50 group-hover:opacity-100" />
                    
                    <div className="bg-white/40 backdrop-blur-3xl rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-16 lg:p-20 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12">
                        
                        {/* Event Details Section */}
                        <div className="text-center md:text-left flex-1 md:max-w-sm shrink-0">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center justify-center md:justify-start gap-3 mb-4 sm:mb-6"
                            >
                                <span className="h-[1px] w-8 sm:w-12 bg-primary/30 hidden md:block" />
                                <span className="text-[9px] sm:text-xs font-black uppercase tracking-[0.4em] text-primary/70">The Details</span>
                                <span className="h-[1px] w-8 sm:w-12 bg-primary/30 hidden md:block" />
                            </motion.div>
                            
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif text-[#333] mb-6 sm:mb-8 leading-[1.1]">
                                Counting down <br /> <span className="italic font-light text-primary">to forever</span>
                            </h2>
                            
                            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                                <div className="flex items-start justify-center md:justify-start gap-3 sm:gap-4 group/item">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover/item:bg-primary/10 transition-colors min-h-[44px] min-w-[44px]">
                                        <CalendarHeart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    </div>
                                    <div className="text-left font-serif pt-1 sm:pt-1.5">
                                        <p className="text-base sm:text-lg md:text-xl text-[#444] leading-none mb-1">{new Date(weddingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        {weddingTime && <p className="text-xs font-sans font-bold tracking-widest uppercase opacity-40">{weddingTime}</p>}
                                    </div>
                                </div>
                                {venueName && (
                                    <div className="flex items-start justify-center md:justify-start gap-3 sm:gap-4 group/item">
                                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover/item:bg-primary/10 transition-colors min-h-[44px] min-w-[44px]">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                        </div>
                                        <div className="text-left font-serif pt-1 sm:pt-1.5">
                                            <p className="text-base sm:text-lg md:text-xl text-[#444] leading-tight mb-1">{venueName}</p>
                                            {venueAddress && <p className="text-xs font-sans font-bold tracking-widest uppercase opacity-40 line-clamp-2">{venueAddress}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToCalendar}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-primary text-white font-black text-xs uppercase tracking-widest shadow-[0_10px_20px_-10px_var(--primary)] hover:shadow-[0_15px_30px_-10px_var(--primary)] transition-all min-h-[44px]"
                            >
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Save Date & Time</span>
                                <span className="sm:hidden">Save Date</span>
                            </motion.button>
                        </div>

                        {/* Timer Grid Section */}
                        <div className="w-[1px] h-24 sm:h-32 bg-primary/10 hidden lg:block shrink-0" />

                        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3 sm:gap-4 md:gap-6 flex-1 w-full relative z-20">
                            <AnimatePresence>
                                {units.map((unit, i) => (
                                    <motion.div
                                        key={unit.label}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                                        className="relative p-[1px] rounded-3xl bg-gradient-to-br from-white/80 to-white/10 group/box hover:-translate-y-2 transition-transform duration-500 w-full"
                                    >
                                        <div className="w-full h-full bg-white/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
                                            <motion.div
                                                key={unit.value}
                                                initial={{ y: -10, opacity: 0, scale: 0.9 }}
                                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                                transition={{ type: "spring", damping: 15 }}
                                            >
                                                <span className="text-4xl md:text-5xl lg:text-7xl font-serif font-light tracking-tighter text-[#333] drop-shadow-sm mb-2 block">
                                                    {String(unit.value).padStart(2, '0')}
                                                </span>
                                            </motion.div>
                                            <span className="text-[10px] md:text-xs font-sans font-black uppercase tracking-[0.25em] text-primary/70">
                                                {unit.label}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
