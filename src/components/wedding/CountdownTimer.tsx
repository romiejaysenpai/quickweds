'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarHeart, MapPin, Sparkles, Clock } from 'lucide-react';
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
        const timeParts = weddingTime.trim().split(':').map(Number);
        if (!isNaN(timeParts[0])) {
            target.setHours(timeParts[0], timeParts[1] || 0, 0, 0);
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
    if (!isMounted) return <div className="sr-only">Loading timer...</div>;

    const visual = getTemplateVisualProfile(template, motifColor, invert, cardStyle);
    const isEditorial = visual.mood === 'editorial';
    const isDark = visual.isDark;
    const sectionClasses = `${visual.sectionClass} ${className}`;
    const panelClass = visual.cardClass;
    const detailIconClass = isDark
        ? 'border-primary/25 bg-primary/10 text-primary'
        : isEditorial
            ? 'border-black/15 bg-black text-white'
            : 'border-primary/15 bg-primary/8 text-primary';
    const unitShellClass = visual.accentCardClass;
    const unitValueClass = isDark ? 'text-white' : 'text-[#222]';
    const separatorClass = isDark ? 'bg-primary/25' : isEditorial ? 'bg-black/15' : 'bg-primary/15';
    const badgeText = visual.badgePrefix ? `${visual.badgePrefix}COUNTDOWN` : 'THE COUNTDOWN';

    if (isPast) {
        return (
            <section className={`py-8 sm:py-12 px-4 sm:px-6 w-full ${sectionClasses} flex justify-center`} style={visual.sectionStyle}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className={`max-w-3xl w-full text-center p-6 sm:p-8 md:p-12 relative overflow-hidden ${panelClass}`}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.16)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_5s_infinite]" />
                    <Sparkles className="w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 text-primary mx-auto mb-4 sm:mb-6 animate-pulse" />
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl leading-tight ${visual.headingClass}`}>Happily Ever After <br/><span className={isEditorial ? '' : 'italic font-light'}>Has Begun</span></h2>
                    <p className={`text-base sm:text-lg uppercase tracking-widest font-black opacity-50 mt-4 sm:mt-6 block ${visual.bodyClass}`}>We did it!</p>
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

    const targetDateObj = parseWeddingTargetDate(weddingDate, weddingTime);

    return (
        <section className={`py-12 sm:py-16 md:py-24 px-4 sm:px-6 w-full flex justify-center ${sectionClasses}`} style={visual.sectionStyle}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-100px", once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-5xl w-full"
            >
                <div className={`relative overflow-hidden group ${panelClass}`}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-24 sm:h-32 bg-primary/15 blur-[60px] sm:blur-[80px] rounded-full pointer-events-none -translate-y-1/2 transition-opacity duration-1000 opacity-50 group-hover:opacity-90" />
                    
                    <div className="p-6 sm:p-10 md:p-14 lg:p-16 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12">
                        
                        {/* Event Details Section */}
                        <div className="text-center md:text-left flex-1 md:max-w-sm shrink-0">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center justify-center md:justify-start gap-3 mb-4 sm:mb-6"
                            >
                                <span className={visual.badgeStyleClass || `text-[9px] sm:text-xs font-black uppercase ${visual.eyebrowClass}`}>
                                    {badgeText}
                                </span>
                            </motion.div>
                            
                            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6 sm:mb-8 leading-[1.1] ${visual.headingClass}`}>
                                Counting down <br /> <span className={isEditorial ? '' : 'italic font-light'}>to forever</span>
                            </h2>
                            
                            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                                <div className="flex items-start justify-center md:justify-start gap-3 sm:gap-4 group/item">
                                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border transition-colors min-h-[44px] min-w-[44px] ${detailIconClass}`}>
                                        <CalendarHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="text-left font-serif pt-1 sm:pt-1.5">
                                        <p className={`text-base sm:text-lg md:text-xl leading-none mb-1 ${unitValueClass}`}>
                                            {targetDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        {weddingTime && <p className={`text-xs font-sans font-bold tracking-widest uppercase opacity-65 ${visual.bodyClass}`}>{weddingTime}</p>}
                                    </div>
                                </div>
                                {venueName && (
                                    <div className="flex items-start justify-center md:justify-start gap-3 sm:gap-4 group/item">
                                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border transition-colors min-h-[44px] min-w-[44px] ${detailIconClass}`}>
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="text-left font-serif pt-1 sm:pt-1.5">
                                            <p className={`text-base sm:text-lg md:text-xl leading-tight mb-1 ${unitValueClass}`}>{venueName}</p>
                                            {venueAddress && <p className={`text-xs font-sans font-bold tracking-widest uppercase opacity-65 line-clamp-2 ${visual.bodyClass}`}>{venueAddress}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToCalendar}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-primary text-white font-black text-xs uppercase tracking-widest shadow-[0_10px_20px_-10px_var(--primary)] hover:shadow-[0_15px_30px_-10px_var(--primary)] transition-all min-h-[44px]"
                            >
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Save Date & Time</span>
                                <span className="sm:hidden">Save Date</span>
                            </motion.button>
                        </div>

                        {/* Timer Grid Section */}
                        <div className={`w-[1px] h-24 sm:h-32 hidden lg:block shrink-0 ${separatorClass}`} />

                        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3 sm:gap-4 md:gap-6 flex-1 w-full relative z-20">
                            <AnimatePresence>
                                {units.map((unit, i) => (
                                    <motion.div
                                        key={unit.label}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                                        className={`relative group/box hover:-translate-y-2 transition-transform duration-500 w-full ${unitShellClass}`}
                                    >
                                        <div className="w-full h-full p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
                                            <motion.div
                                                key={unit.value}
                                                initial={{ y: -15, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-2 ${unitValueClass}`}
                                            >
                                                {String(unit.value).padStart(2, '0')}
                                            </motion.div>
                                            <span className={`text-[10px] sm:text-xs uppercase font-bold tracking-[0.25em] ${visual.eyebrowClass}`}>
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
