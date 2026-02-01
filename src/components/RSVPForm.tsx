'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RSVPForm({ weddingId }: { weddingId: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        guestName: '',
        attendance: 'Yes',
        numGuests: 1,
        mealPreference: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('rsvps')
                .insert({
                    wedding_id: weddingId,
                    guest_name: formData.guestName,
                    attendance: formData.attendance,
                    num_guests: formData.numGuests,
                    meal_preference: formData.mealPreference,
                    message: formData.message
                });

            if (error) {
                console.error("Supabase RSVP error:", error);
                alert("Failed to submit RSVP. Please try again.");
            } else {
                setIsSubmitted(true);
            }
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
        <div className="p-8 md:p-12 rounded-[2rem] bg-white soft-shadow border border-border">
            <h2 className="text-2xl font-serif font-bold text-primary mb-8 text-center italic">RSVP for our Special Day</h2>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary ml-1">Guest Full Name</label>
                    <input
                        required
                        placeholder="Enter your full name"
                        value={formData.guestName}
                        onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                        className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground placeholder:text-text-secondary/30"
                    />
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
                            type="number"
                            min="1"
                            max="10"
                            value={formData.numGuests}
                            onChange={(e) => setFormData(prev => ({ ...prev, numGuests: parseInt(e.target.value) }))}
                            className="w-full px-6 py-4 rounded-2xl border border-border focus:border-primary outline-none transition-all bg-neutral text-foreground"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary ml-1">Meal Preference (Optional)</label>
                    <input
                        placeholder="Vegetarian, Halal, Allergies, etc."
                        value={formData.mealPreference}
                        onChange={(e) => setFormData(prev => ({ ...prev, mealPreference: e.target.value }))}
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
