'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Music, Users, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackWeddingEvent } from '@/lib/wedding-features';

const DIETARY_OPTIONS = [
    'No Preference',
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher',
    'Gluten-Free',
    'Other (see message)',
];

export default function RSVPForm({ weddingId, wedding }: { weddingId: string, wedding?: any }) {
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
            // Check for duplicate RSVP
            const { data: existing, error: checkError } = await supabase
                .from('rsvps')
                .select('id')
                .eq('wedding_id', weddingId)
                .ilike('guest_name', formData.guestName.trim())
                .limit(1);

            if (checkError) {
                console.warn("Duplicate check error (ignored):", checkError);
            }

            if (existing && existing.length > 0) {
                setDuplicateError(true);
                setSubmitError("You have already RSVP'd for this wedding. If you need to make changes, please contact the couple directly.");
                setIsSubmitting(false);
                return;
            }

            const insertData: any = {
                wedding_id: weddingId,
                guest_name: formData.guestName.trim(),
                guest_email: formData.guestEmail.trim() || null,
                attendance: formData.attendance,
                num_guests: formData.numGuests || 1,
            };

            // Optional fields - only include if they have values to avoid schema conflicts
            if (formData.mealPreference && formData.mealPreference !== 'No Preference') insertData.meal_preference = formData.mealPreference;
            if (formData.dietaryDetails) insertData.dietary_details = formData.dietaryDetails;
            if (formData.message) insertData.message = formData.message;
            if (formData.plusOneNames) insertData.plus_one_names = formData.plusOneNames;
            if (formData.songRequest) insertData.song_request = formData.songRequest;
            if (formData.childrenCount > 0) insertData.children_count = formData.childrenCount;

            const { error: insertError } = await supabase.from('rsvps').insert(insertData);

            if (insertError) {
                console.error("Supabase RSVP error:", insertError);
                setSubmitError(`Submission failed: ${insertError.message}. Details: ${insertError.details || 'None'}`);
                setIsSubmitting(false);
                return;
            }

            // Success!
            setIsSubmitted(true);
            void trackWeddingEvent(weddingId, 'rsvp_submitted', {
                source: 'rsvp_form',
                attendance: formData.attendance,
            });
            
            // Trigger email notification
            fetch('/api/rsvp-notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId,
                    guestName: formData.guestName.trim(),
                    guestEmail: formData.guestEmail.trim(),
                    attendance: formData.attendance,
                    numGuests: formData.numGuests,
                    message: formData.message,
                    dietaryDetails: formData.dietaryDetails,
                    songRequest: formData.songRequest,
                    plusOneNames: formData.plusOneNames,
                    childrenCount: formData.childrenCount
                }),
            })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok || !data.success) {
                    console.error("📧 Email delivery issue:", data);
                } else {
                    console.log("📧 Emails triggered successfully");
                }
            })
            .catch(err => console.error("📧 Email notification network error:", err));
        } catch (err) {
            console.error(err);
            alert("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 rounded-[2rem] bg-success-bg border border-border text-center soft-shadow"
            >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-3xl font-serif mb-2 text-primary">Thank You!</h3>
                <p className="text-text-secondary italic">Your response has been received. We can&apos;t wait to see you!</p>
            </motion.div>
        );
    }

    return (
        <div className={`p-8 md:p-12 rounded-[2rem] soft-shadow border transition-colors ${
            isDark ? 'bg-black/40 border-primary/20 text-white backdrop-blur-md' : 
            isSharp ? 'bg-white border-black/5 rounded-none' :
            isVintage ? 'bg-[#fdfbf6] border-[#d4c5b3] rounded-3xl' :
            'bg-white border-border'
        }`}>
            <h2 className={`text-2xl font-serif font-bold mb-8 text-center italic ${isDark ? 'text-primary' : 'text-primary'}`}>
                RSVP for our Special Day
            </h2>

            {duplicateError && (
                <div className="mb-6 p-4 rounded-2xl bg-error-bg border border-error-text/20 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-error-text flex-shrink-0" />
                    <p className="text-sm text-error-text">It looks like you&apos;ve already submitted an RSVP. If you need to update it, please contact the couple.</p>
                </div>
            )}
            
            {submitError && (
                <div className="mb-6 p-4 rounded-2xl bg-error-bg border border-error-text/20 flex items-center gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-error-text flex-shrink-0" />
                    <div>
                        <p className="font-bold text-error-text text-sm">Submission Error</p>
                        <p className="text-xs text-error-text/70">{submitError}</p>
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

                {/* Attendance + Guests */}
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
                            type="number" min="1" max="10"
                            value={formData.numGuests}
                            onChange={(e) => setFormData(prev => ({ ...prev, numGuests: parseInt(e.target.value) || 1 }))}
                            className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground"
                        />
                    </div>
                </div>

                {/* Plus One Names (shown if numGuests > 1) */}
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

                {/* Children Count */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">Children Attending</label>
                        <input
                            type="number" min="0" max="10"
                            value={formData.childrenCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, childrenCount: parseInt(e.target.value) || 0 }))}
                            className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground"
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

                {/* Dietary Details (if Other) */}
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

                {/* Song Request */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary ml-1 flex items-center gap-2">
                        <Music className="w-4 h-4" /> Song Request <span className="text-text-secondary/50 font-normal">(What gets you on the dance floor?)</span>
                    </label>
                    <input
                        placeholder="e.g. 'Dancing Queen' by ABBA"
                        value={formData.songRequest}
                        onChange={(e) => setFormData(prev => ({ ...prev, songRequest: e.target.value }))}
                        className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground placeholder:text-text-secondary/30"
                    />
                </div>

                {/* Message */}
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
                    className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:bg-primary-disabled"
                >
                    {isSubmitting ? 'Sending...' : (
                        <> Submit RSVP <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> </>
                    )}
                </button>
            </form>
        </div>
    );
}
