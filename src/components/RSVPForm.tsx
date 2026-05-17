'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Music, Users, AlertCircle } from 'lucide-react';
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
};

export default function RSVPForm({ weddingId, wedding }: { weddingId: string, wedding?: WeddingPreview }) {
    const isSharp = wedding?.template === 'editorial' || wedding?.template === 'minimal' || wedding?.template === 'vogue';
    const isDark = wedding?.template === 'midnight' || wedding?.template === 'royal' || wedding?.template === 'urban';
    const isVintage = wedding?.template === 'vintage' || wedding?.template === 'film' || wedding?.template === 'rustic';
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
                source: 'rsvp_form',
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
        <div className={`p-5 sm:p-8 md:p-12 rounded-[2rem] soft-shadow border transition-colors ${
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

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">Guest Full Name *</label>
                        <input
                            required
                            placeholder="Enter your full name"
                            value={formData.guestName}
                            onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                            className={`w-full px-6 py-4 rounded-2xl border focus:border-primary outline-none transition-all placeholder:text-text-secondary/30 ${
                                isDark ? 'bg-white/5 border-white/10 text-white' :
                                isSharp ? 'bg-neutral/30 border-black/5 rounded-none' :
                                isVintage ? 'bg-white/50 border-[#d4c5b3] italic' :
                                'bg-neutral border-border text-foreground'
                            }`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">Email Address *</label>
                        <input
                            required
                            type="email"
                            placeholder="For your confirmation"
                            value={formData.guestEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                            className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground placeholder:text-text-secondary/30"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">Will you attend?</label>
                        <select
                            value={formData.attendance}
                            onChange={(e) => setFormData(prev => ({ ...prev, attendance: e.target.value }))}
                            className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground"
                        >
                            <option value="Yes">Yes, gladly!</option>
                            <option value="No">Regretfully, no.</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">Number of Guests</label>
                        <input
                                    type="number" min="1" max="100"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={formData.numGuests === 0 ? '' : formData.numGuests}
                                    onChange={(e) => setFormData(prev => ({ ...prev, numGuests: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                                    className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                    </div>
                </div>

                {formData.numGuests > 1 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Names of Additional Guests
                        </label>
                        <input
                            placeholder="e.g. Jane Doe, John Smith"
                            value={formData.plusOneNames}
                            onChange={(e) => setFormData(prev => ({ ...prev, plusOneNames: e.target.value }))}
                            className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground placeholder:text-text-secondary/30"
                        />
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">Children Attending</label>
                        <input
                            type="number" min="0" max="100"
                            inputMode="numeric"
                            placeholder="0"
                            value={formData.childrenCount === 0 ? '' : formData.childrenCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, childrenCount: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                            className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">Dietary Preference</label>
                        <select
                            value={formData.mealPreference}
                            onChange={(e) => setFormData(prev => ({ ...prev, mealPreference: e.target.value }))}
                            className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground"
                        >
                            <option value="">Select...</option>
                            {DIETARY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                {formData.mealPreference === 'Other (see message)' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">Dietary Details / Allergies</label>
                        <input
                            placeholder="Please describe your dietary requirements"
                            value={formData.dietaryDetails}
                            onChange={(e) => setFormData(prev => ({ ...prev, dietaryDetails: e.target.value }))}
                            className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground placeholder:text-text-secondary/30"
                        />
                    </motion.div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary ml-1 flex items-center gap-2">
                        <Music className="w-4 h-4" /> Song Request
                    </label>
                    <input
                        placeholder="e.g. 'Dancing Queen' by ABBA"
                        value={formData.songRequest}
                        onChange={(e) => setFormData(prev => ({ ...prev, songRequest: e.target.value }))}
                        className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground placeholder:text-text-secondary/30"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary ml-1">Message for the Couple</label>
                    <textarea
                        placeholder="Write a sweet note..."
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground h-32 resize-none placeholder:text-text-secondary/30"
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
