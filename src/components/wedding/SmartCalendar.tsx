'use client';

import { motion } from 'framer-motion';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

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

export default function SmartCalendar({ wedding, motifColor }: SmartCalendarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const title = `Wedding of ${wedding.bride_name} & ${wedding.groom_name}`;
    const description = `We can't wait to celebrate with you at ${wedding.venue_name}!`;
    const location = wedding.venue_address || wedding.venue_name;
    
    // Combine date and time
    const startDateTime = new Date(`${wedding.wedding_date}T${wedding.wedding_time || '10:00'}`);
    const endDateTime = new Date(startDateTime.getTime() + 6 * 60 * 60 * 1000); // Default +6 hours

    const formatDateTime = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");

    const links = {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDateTime(startDateTime)}/${formatDateTime(endDateTime)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
        apple: `data:text/calendar;charset=utf-8,${encodeURIComponent(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${description}\nLOCATION:${location}\nDTSTART:${formatDateTime(startDateTime)}\nDTEND:${formatDateTime(endDateTime)}\nEND:VEVENT\nEND:VCALENDAR`)}`,
    };

    return (
        <div className="relative inline-block">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-6 py-4 rounded-full bg-white dark:bg-neutral border border-border/50 shadow-lg soft-shadow transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary" style={{ color: motifColor }}>
                    <Calendar className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-foreground">Save the Date</span>
                <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full mt-4 left-0 w-64 bg-white dark:bg-neutral border border-border/50 rounded-2xl shadow-2xl p-2 z-[70] backdrop-blur-xl"
                >
                    <a 
                        href={links.google} 
                        target="_blank" 
                        rel="noopener noreferrer"
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
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center border border-border/20">
                            <span className="text-[10px] font-black text-foreground">A</span>
                        </div>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Apple Calendar</span>
                    </a>
                </motion.div>
            )}
        </div>
    );
}
