'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
    Trash2, Send, CheckCircle2, Loader2,
    Clock, Save, ArrowRight, Type, Eye, AlertCircle
} from 'lucide-react';
import { getSafeSupabaseSession } from '@/lib/supabase-auth';

interface Template {
    id: string;
    name: string;
    subject_template: string;
    body_template: string;
    is_default: boolean;
}

interface RSVP {
    id: string;
    guest_name: string;
    guest_email: string;
}

interface ThankYouNote {
    id: string;
    rsvp_id?: string | null;
    recipient_name: string;
    recipient_email: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    gift_description?: string;
    created_at: string;
}

type ActiveView = 'send' | 'templates' | 'history';

const MANAGER_TABS: Array<{ id: ActiveView; label: string }> = [
    { id: 'send', label: 'Send Notes' },
    { id: 'templates', label: 'Templates' },
    { id: 'history', label: 'History' },
];

function noteMatchesGuest(note: ThankYouNote, guest: RSVP) {
    return note.rsvp_id
        ? note.rsvp_id === guest.id
        : note.recipient_email === guest.guest_email;
}

export default function ThankYouNoteManager({ weddingId }: { weddingId: string }) {
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [notes, setNotes] = useState<ThankYouNote[]>([]);
    const [guests, setGuests] = useState<RSVP[]>([]);
    const [activeView, setActiveView] = useState<ActiveView>('send');
    const [sendingGuestId, setSendingGuestId] = useState<string | null>(null);
    const [sendFeedback, setSendFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    
    // Template Builder State
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [templatesRes, notesRes, guestsRes] = await Promise.all([
                supabase.from('thank_you_templates').select('*').eq('wedding_id', weddingId),
                supabase.from('thank_you_notes').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false }),
                supabase.from('rsvps').select('id, guest_name, guest_email').eq('wedding_id', weddingId).eq('rsvp_status', 'confirmed')
            ]);

            if (templatesRes.data) setTemplates(templatesRes.data);
            if (notesRes.data) setNotes(notesRes.data);
            if (guestsRes.data) setGuests(guestsRes.data);
        } catch (err) {
            console.error("Error loading thank-you note data:", err);
        } finally {
            setLoading(false);
        }
    }, [weddingId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const createTemplate = async () => {
        if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) return alert("Please fill all fields");
        try {
            const { data, error } = await supabase.from('thank_you_templates').insert({
                wedding_id: weddingId,
                name: newTemplate.name,
                subject_template: newTemplate.subject,
                body_template: newTemplate.body
            }).select().single();

            if (error) throw error;
            if (data) setTemplates([...templates, data]);
            setIsCreatingTemplate(false);
            setNewTemplate({ name: '', subject: '', body: '' });
            setActiveView('send');
        } catch (err) {
            alert("Failed to create template: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm("Delete this template permanently?")) return;
        try {
            const { error } = await supabase.from('thank_you_templates').delete().eq('id', id);
            if (error) throw error;
            setTemplates(templates.filter(t => t.id !== id));
        } catch {
            alert("Failed to delete template");
        }
    };

    const sendNote = async (guest: RSVP) => {
        if (!guest.guest_email) {
            setSendFeedback({ type: 'error', message: "This guest doesn't have an email address." });
            return;
        }

        setSendingGuestId(guest.id);
        setSendFeedback(null);
        try {
            const existingNote = notes.find((note) =>
                noteMatchesGuest(note, guest)
                && (note.status === 'draft' || note.status === 'failed')
            );

            let noteId = existingNote?.id;
            if (existingNote?.status === 'failed') {
                const { error: retryError } = await supabase
                    .from('thank_you_notes')
                    .update({ status: 'draft', sent_at: null })
                    .eq('id', existingNote.id)
                    .eq('wedding_id', weddingId);
                if (retryError) throw retryError;
            }

            if (!noteId) {
                const { data: createdNote, error: createError } = await supabase
                    .from('thank_you_notes')
                    .insert({
                        wedding_id: weddingId,
                        rsvp_id: guest.id,
                        recipient_name: guest.guest_name,
                        recipient_email: guest.guest_email,
                        status: 'draft',
                    })
                    .select('id')
                    .single();

                if (createError) throw createError;
                noteId = createdNote?.id;
            }

            if (!noteId) throw new Error('The thank-you note could not be prepared.');

            const { session, error: sessionError } = await getSafeSupabaseSession();
            if (sessionError || !session?.access_token) throw new Error('Your session expired. Please sign in again.');

            const response = await fetch('/api/weddings/thank-you/send', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weddingId, noteId }),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) throw new Error(result.error || 'The email provider did not accept this thank-you note.');
            if (result.sentCount === 1 && result.statusUpdateFailedCount > 0) {
                throw new Error('The email was accepted, but its history could not be updated. Do not resend it; refresh later or contact support.');
            }
            if (result.sentCount !== 1) throw new Error('The thank-you note was not sent. Please try again.');

            await loadData();
            setSendFeedback({ type: 'success', message: `Thank-you email sent to ${guest.guest_name}.` });
        } catch (err) {
            await loadData();
            setSendFeedback({
                type: 'error',
                message: err instanceof Error ? err.message : 'Unable to send this thank-you email.',
            });
        } finally {
            setSendingGuestId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] soft-shadow border border-border">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary font-serif italic">Loading thank you studio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header & Internal Nav */}
            <div className="bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 soft-shadow border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 sm:mb-10">
                    <div className="min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Thank You Studio</h2>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-xl">Express your gratitude. Send automated or custom thank you notes to your confirmed guests.</p>
                    </div>
                    
                    <div className="flex bg-neutral dark:bg-neutral/40 p-1 rounded-xl w-full md:w-auto border border-border/50 shadow-inner">
                        {MANAGER_TABS.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveView(tab.id)}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === tab.id ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-text-secondary hover:text-foreground'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeView === 'send' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Confirmed Attendees ({guests.length})</h3>
                        </div>
                        {sendFeedback && (
                            <div
                                className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${sendFeedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}
                                role={sendFeedback.type === 'error' ? 'alert' : 'status'}
                            >
                                {sendFeedback.type === 'success'
                                    ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                                    : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />}
                                <span>{sendFeedback.message}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {guests.length === 0 ? (
                                <div className="col-span-full py-12 text-center bg-neutral/30 dark:bg-neutral/10 rounded-2xl border border-dashed border-border opacity-50">
                                    <p className="font-serif italic text-sm">Waiting for confirmed guests...</p>
                                </div>
                            ) : (
                                guests.map(guest => {
                                    const noteSent = notes.some(n => noteMatchesGuest(n, guest) && n.status === 'sent');
                                    const noteProcessing = notes.some(n =>
                                        noteMatchesGuest(n, guest)
                                        && n.status === 'sending'
                                    );
                                    const isSending = sendingGuestId === guest.id || noteProcessing;
                                    return (
                                        <div key={guest.id} className="p-4 bg-white dark:bg-white/5 border border-border rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm">
                                            <div className="min-w-0 pr-2">
                                                <p className="font-bold text-sm truncate text-foreground">{guest.guest_name}</p>
                                                <p className="text-[10px] text-text-secondary truncate">{guest.guest_email}</p>
                                            </div>
                                            <button 
                                                onClick={() => !noteSent && sendNote(guest)}
                                                disabled={noteSent || noteProcessing || Boolean(sendingGuestId)}
                                                aria-label={noteSent
                                                    ? `Thank-you email sent to ${guest.guest_name}`
                                                    : noteProcessing
                                                        ? `Thank-you email to ${guest.guest_name} is being processed`
                                                        : `Send thank-you email to ${guest.guest_name}`}
                                                className={`p-2.5 rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-60 ${noteSent ? 'bg-emerald-50 text-emerald-500 cursor-default' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                                            >
                                                {noteSent
                                                    ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                                    : isSending
                                                        ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                        : <Send className="w-4 h-4" aria-hidden="true" />}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'templates' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2"><Type className="w-4 h-4" /> Design Studio</h3>
                            <button onClick={() => setIsCreatingTemplate(true)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:shadow-md transition-all">+ New</button>
                        </div>

                        {isCreatingTemplate ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral/30 dark:bg-neutral/10 p-5 rounded-2xl border border-border space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input placeholder="Template Name" className="bg-white dark:bg-white/5 border border-border p-3 rounded-xl text-sm" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} />
                                    <input placeholder="Subject Line" className="bg-white dark:bg-white/5 border border-border p-3 rounded-xl text-sm" value={newTemplate.subject} onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})} />
                                </div>
                                <textarea placeholder="Message Body... use {guest_name} for personalization" className="w-full bg-white dark:bg-white/5 border border-border p-3 rounded-xl text-sm min-h-[120px]" value={newTemplate.body} onChange={e => setNewTemplate({...newTemplate, body: e.target.value})} />
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => setIsCreatingTemplate(false)} className="px-4 py-2 text-text-secondary text-xs font-bold">Cancel</button>
                                    <button onClick={createTemplate} className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20">Save Template</button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-text-secondary/50 font-serif italic text-sm">Create your first personalized template.</div>
                                ) : (
                                    templates.map(t => (
                                        <div key={t.id} className="p-5 border border-border bg-white dark:bg-white/5 rounded-2xl flex flex-col gap-3 group relative hover:border-primary/30 transition-all shadow-sm">
                                            <h4 className="font-bold text-foreground text-sm">{t.name}</h4>
                                            <p className="text-xs text-text-secondary line-clamp-2 opacity-70 mb-2">{t.body_template}</p>
                                            <div className="flex gap-2 border-t border-border/50 pt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Eye className="w-4 h-4" />
                                                <Save className="w-4 h-4 ml-auto" />
                                            </div>
                                            <button onClick={() => deleteTemplate(t.id)} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'history' && (
                    <div className="space-y-4">
                        <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2"><Clock className="w-4 h-4" /> Activity Log</h3>
                        <div className="bg-white dark:bg-white/5 border border-border rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-neutral/40 dark:bg-neutral/20 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 font-black uppercase tracking-wider text-[10px] text-text-secondary">Guest</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-wider text-[10px] text-text-secondary">Status</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-wider text-[10px] text-text-secondary">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {notes.length === 0 ? (
                                        <tr><td colSpan={3} className="px-4 py-12 text-center text-text-secondary italic font-serif">No notes sent yet.</td></tr>
                                    ) : (
                                        notes.map(note => (
                                            <tr key={note.id} className="hover:bg-neutral/10 transition-colors">
                                                <td className="px-4 py-3 font-bold">{note.recipient_name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${note.status === 'sent' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {note.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary text-[10px]">{new Date(note.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Tips Box */}
            <div className="p-5 sm:p-8 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl sm:rounded-[2.5rem] flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5 h-5 text-primary" /></div>
                <div>
                    <h4 className="font-bold text-foreground text-sm sm:text-base">Tip: Personalize Your Templates</h4>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">Use <code>{`{guest_name}`}</code> in your subject or message body to make thank you notes feel personal.</p>
                </div>
            </div>
        </div>
    );
}
