'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Music, Users, AlertCircle, CalendarDays } from 'lucide-react';
import type { RsvpEventResponse, WeddingRsvpEvent } from '@/types/wedding';
import { trackWeddingEvent } from '@/lib/wedding-features';
import confetti from 'canvas-confetti';

const DIETARY_OPTIONS = [
    'No Preference',
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher',
    'Gluten-Free',
    'Other (see message)',
];

type WeddingPreview = {
    template?: string;
    motif_color?: string;
    rsvp_events?: WeddingRsvpEvent[] | string;
};

export default function RSVPForm({ weddingId, wedding, submissionSource = 'hosted' }: { weddingId: string, wedding?: WeddingPreview, submissionSource?: 'hosted' | 'embed' }) {
    const events = (() => {
        if (Array.isArray(wedding?.rsvp_events)) return wedding.rsvp_events.filter((event) => event?.id && event?.name);
        if (typeof wedding?.rsvp_events !== 'string') return [];
        try { const value = JSON.parse(wedding.rsvp_events); return Array.isArray(value) ? value.filter((event) => event?.id && event?.name) : []; } catch { return []; }
    })() as WeddingRsvpEvent[];
    const isSharp = wedding?.template === 'editorial' || wedding?.template === 'minimal' || wedding?.template === 'vogue';
    const isDark = wedding?.template === 'midnight' || wedding?.template === 'royal' || wedding?.template === 'urban';
    const isVintage = wedding?.template === 'vintage' || wedding?.template === 'film' || wedding?.template === 'rustic';
    const fieldClass = `w-full min-h-[48px] rounded-2xl border px-4 py-3 text-base outline-none transition-all placeholder:text-text-secondary/30 focus:border-primary sm:px-6 sm:py-4 ${
        isDark ? 'border-white/10 bg-white/[0.08] text-white placeholder:text-white/30' :
        isSharp ? 'rounded-none border-black/10 bg-white text-foreground' :
        isVintage ? 'border-[#d4c5b3] bg-white/70 text-foreground' :
        'border-border bg-neutral text-foreground'
    }`;
    const labelClass = `ml-1 text-sm font-bold ${isDark ? 'text-white/70' : 'text-text-secondary'}`;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [duplicateError, setDuplicateError] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        guestName: '',
        guestEmail: '',
        attendance: 'Yes',
        numGuests: 1,
        mealPreference: '',
        dietaryDetails: '',
        message: '',
        plusOneNames: '',
        songRequest: '',
        childrenCount: 0,
        householdName: '',
        householdMembers: '',
        eventResponses: events.map((event) => ({ eventId: event.id, attendance: 'Yes' as const })) as RsvpEventResponse[],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setDuplicateError(false);
        setSubmitError(null);

        try {
            const response = await fetch('/api/public/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId,
                    submissionSource,
                    guestName: formData.guestName.trim(),
                    guestEmail: formData.guestEmail.trim(),
                    attendance: formData.attendance,
                    numGuests: formData.numGuests,
                    mealPreference: formData.mealPreference,
                    dietaryDetails: formData.dietaryDetails,
                    message: formData.message,
                    plusOneNames: formData.plusOneNames,
                    songRequest: formData.songRequest,
                    childrenCount: formData.childrenCount,
                    householdName: formData.householdName.trim(),
                    householdMembers: formData.householdMembers.split(/\n|,/).map((name) => name.trim()).filter(Boolean),
                    eventResponses: formData.eventResponses,
                }),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 409 || result.code === 'duplicate_rsvp') {
                    setDuplicateError(true);
                }
                setSubmitError(result.error || 'Submission failed. Please try again.');
                setIsSubmitting(false);
                return;
            }

            setIsSubmitted(true);
            
            // Confetti
            const end = Date.now() + 3 * 1000;
            const colors = [wedding?.motif_color || '#D4AF37', '#ffffff', '#ffd700'];
            (function frame() {
                confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
                confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());

            void trackWeddingEvent(weddingId, 'rsvp_submitted', {
                source: submissionSource === 'embed' ? 'rsvp_embed' : 'rsvp_form',
                attendance: formData.attendance,
            });
        } catch (err) {
            console.error(err);
            setSubmitError("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-center soft-shadow"
            >
                <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-serif mb-2 text-foreground">Thank You!</h3>
                <p className="text-text-secondary italic">Your response has been received. We can&apos;t wait to see you!</p>
            </motion.div>
        );
    }

    return (
        <div className={`mx-auto w-full max-w-3xl p-4 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] soft-shadow border transition-colors ${
            isDark ? 'bg-black/40 border-primary/20 text-white backdrop-blur-md' : 
            isSharp ? 'bg-white border-black/5 rounded-none' :
            isVintage ? 'bg-[#fdfbf6] border-[#d4c5b3] rounded-3xl' :
            'bg-white border-border'
        }`}>
            <h2 className={`text-2xl font-serif font-bold mb-8 text-center italic text-primary`}>
                RSVP for our Special Day
            </h2>

            {duplicateError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">You have already submitted an RSVP for this name.</p>
                </div>
            )}
            
            {submitError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-red-600 text-sm">Submission Error</p>
                        <p className="text-xs text-red-600/70">{submitError}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className={labelClass}>Guest Full Name *</label>
                        <input
                            required
                            placeholder="Enter your full name"
                            value={formData.guestName}
                            onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                            className={fieldClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>Email Address *</label>
                        <input
                            required
                            type="email"
                            placeholder="For your confirmation"
                            value={formData.guestEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                            className={fieldClass}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className={labelClass}>Will you attend?</label>
                        <select
                            value={formData.attendance}
                            onChange={(e) => setFormData(prev => ({ ...prev, attendance: e.target.value }))}
                            className={fieldClass}
                        >
                            <option value="Yes">Yes, gladly!</option>
                            <option value="No">Regretfully, no.</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>Number of Guests</label>
                        <input
                                    type="number" min="1" max="100"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={formData.numGuests === 0 ? '' : formData.numGuests}
                                    onChange={(e) => setFormData(prev => ({ ...prev, numGuests: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                                    className={`${fieldClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                />
                    </div>
                </div>

                {formData.numGuests > 1 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                        <label className={`${labelClass} flex items-center gap-2`}>
                            <Users className="w-4 h-4" /> Names of Additional Guests
                        </label>
                        <input
                            placeholder="e.g. Jane Doe, John Smith"
                            value={formData.plusOneNames}
                            onChange={(e) => setFormData(prev => ({ ...prev, plusOneNames: e.target.value }))}
                            className={fieldClass}
                        />
                    </motion.div>
                )}

                <div className="space-y-2">
                    <label className={`${labelClass} flex items-center gap-2`}><Users className="h-4 w-4" /> Household or family name</label>
                    <input placeholder="e.g. The Santos Family" value={formData.householdName} onChange={(e) => setFormData((prev) => ({ ...prev, householdName: e.target.value }))} className={fieldClass} />
                    <p className={`ml-1 text-xs ${isDark ? 'text-white/50' : 'text-text-secondary'}`}>Optional. Use this when one response represents a household.</p>
                </div>

                {formData.numGuests > 1 && (
                    <div className="space-y-2">
                        <label className={labelClass}>Household member names</label>
                        <textarea placeholder={'One name per line\nJamie Santos\nAvery Santos'} value={formData.householdMembers} onChange={(e) => setFormData((prev) => ({ ...prev, householdMembers: e.target.value }))} className={`${fieldClass} min-h-28 resize-y`} />
                    </div>
                )}

                {events.length > 0 && (
                    <fieldset className={`space-y-3 rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-neutral/50'}`}>
                        <legend className={`px-2 text-sm font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>Choose events</legend>
                        {events.map((event) => {
                            const response = formData.eventResponses.find((item) => item.eventId === event.id)?.attendance || 'Yes';
                            return <div key={event.id} className={`grid gap-3 border-b pb-4 last:border-0 last:pb-0 sm:grid-cols-[1fr_150px] ${isDark ? 'border-white/10' : 'border-border'}`}>
                                <div>
                                    <p className={`flex items-center gap-2 font-bold ${isDark ? 'text-white' : 'text-foreground'}`}><CalendarDays className="h-4 w-4 text-primary" /> {event.name}</p>
                                    <p className={`mt-1 text-xs ${isDark ? 'text-white/55' : 'text-text-secondary'}`}>{[event.date, event.time, event.venue].filter(Boolean).join(' · ')}</p>
                                    {event.description && <p className={`mt-1 text-xs ${isDark ? 'text-white/55' : 'text-text-secondary'}`}>{event.description}</p>}
                                </div>
                                <select aria-label={`Attendance for ${event.name}`} value={response} onChange={(e) => setFormData((prev) => ({ ...prev, eventResponses: prev.eventResponses.some((item) => item.eventId === event.id) ? prev.eventResponses.map((item) => item.eventId === event.id ? { ...item, attendance: e.target.value as RsvpEventResponse['attendance'] } : item) : [...prev.eventResponses, { eventId: event.id, attendance: e.target.value as RsvpEventResponse['attendance'] }] }))} className={fieldClass}>
                                    <option value="Yes">Attending</option><option value="Maybe">Maybe</option><option value="No">Not attending</option>
                                </select>
                            </div>;
                        })}
                    </fieldset>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className={labelClass}>Children Attending</label>
                        <input
                            type="number" min="0" max="100"
                            inputMode="numeric"
                            placeholder="0"
                            value={formData.childrenCount === 0 ? '' : formData.childrenCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, childrenCount: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                            className={`${fieldClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>Dietary Preference</label>
                        <select
                            value={formData.mealPreference}
                            onChange={(e) => setFormData(prev => ({ ...prev, mealPreference: e.target.value }))}
                            className={fieldClass}
                        >
                            <option value="">Select...</option>
                            {DIETARY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                {formData.mealPreference === 'Other (see message)' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                        <label className={labelClass}>Dietary Details / Allergies</label>
                        <input
                            placeholder="Please describe your dietary requirements"
                            value={formData.dietaryDetails}
                            onChange={(e) => setFormData(prev => ({ ...prev, dietaryDetails: e.target.value }))}
                            className={fieldClass}
                        />
                    </motion.div>
                )}

                <div className="space-y-2">
                    <label className={`${labelClass} flex items-center gap-2`}>
                        <Music className="w-4 h-4" /> Song Request
                    </label>
                    <input
                        placeholder="e.g. 'Dancing Queen' by ABBA"
                        value={formData.songRequest}
                        onChange={(e) => setFormData(prev => ({ ...prev, songRequest: e.target.value }))}
                        className={fieldClass}
                    />
                </div>

                <div className="space-y-2">
                    <label className={labelClass}>Message for the Couple</label>
                    <textarea
                        placeholder="Write a sweet note..."
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className={`${fieldClass} h-32 resize-none`}
                    />
                </div>

                <button
                    disabled={isSubmitting}
                    className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                    {isSubmitting ? 'Sending...' : (
                        <> Submit RSVP <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> </>
                    )}
                </button>
            </form>
        </div>
    );
}
