'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Mail, 
    Plus, 
    Trash2, 
    Send, 
    Edit, 
    CheckCircle2, 
    Loader2, 
    Clock,
    User,
    Gift,
    MessageSquare,
    Save
} from 'lucide-react';

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
    recipient_name: string;
    recipient_email: string;
    status: 'draft' | 'scheduled' | 'sent' | 'failed';
    gift_description?: string;
    created_at: string;
}

export default function ThankYouNoteManager({ weddingId }: { weddingId: string }) {
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [notes, setNotes] = useState<ThankYouNote[]>([]);
    const [guests, setGuests] = useState<RSVP[]>([]);
    const [activeView, setActiveView] = useState<'notes' | 'templates'>('notes');
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });

    useEffect(() => {
        loadData();
    }, [weddingId]);

    const loadData = async () => {
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
    };

    const createTemplate = async () => {
        if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) return;
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
        } catch (err) {
            alert("Failed to create template");
        }
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm("Delete this template?")) return;
        try {
            const { error } = await supabase.from('thank_you_templates').delete().eq('id', id);
            if (error) throw error;
            setTemplates(templates.filter(t => t.id !== id));
        } catch (err) {
            alert("Failed to delete template");
        }
    };

    const sendNote = async (guest: RSVP) => {
        if (!guest.guest_email) {
            alert("Guest doesn't have an email address.");
            return;
        }

        const template = templates.find(t => t.is_default) || templates[0];
        if (!template) {
            alert("Please create a template first.");
            setActiveView('templates');
            return;
        }

        try {
            // In a real app, this would trigger a serverless function to send the email
            const { data, error } = await supabase.from('thank_you_notes').insert({
                wedding_id: weddingId,
                rsvp_id: guest.id,
                recipient_name: guest.guest_name,
                recipient_email: guest.guest_email,
                template_id: template.id,
                status: 'sent',
                sent_at: new Date().toISOString()
            }).select().single();

            if (error) throw error;
            if (data) setNotes([data, ...notes]);
            alert(`Thank-you note sent to ${guest.guest_name}!`);
        } catch (err) {
            alert("Failed to send note");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] soft-shadow border border-border">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary font-serif italic">Loading thank-you notes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 soft-shadow border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Automated Thank-You Notes</h2>
                        <p className="text-sm text-text-secondary mt-1">Send personalized thank-you emails to your guests effortlessly.</p>
                    </div>
                    <div className="flex bg-neutral p-1 rounded-2xl">
                        <button 
                            onClick={() => setActiveView('notes')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'notes' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}
                        >
                            History
                        </button>
                        <button 
                            onClick={() => setActiveView('templates')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'templates' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}
                        >
                            Templates
                        </button>
                    </div>
                </div>

                {activeView === 'templates' ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-serif font-bold text-xl">Templates</h3>
                            {!isCreatingTemplate && (
                                <button 
                                    onClick={() => setIsCreatingTemplate(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm"
                                >
                                    <Plus className="w-4 h-4" /> New Template
                                </button>
                            )}
                        </div>

                        {isCreatingTemplate && (
                            <div className="p-6 bg-neutral/50 border border-border rounded-3xl space-y-4">
                                <input 
                                    placeholder="Template Name (e.g., Post-Wedding Standard)" 
                                    value={newTemplate.name}
                                    onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                                    className="w-full bg-white border border-border rounded-xl px-4 py-3 outline-none"
                                />
                                <input 
                                    placeholder="Email Subject Line" 
                                    value={newTemplate.subject}
                                    onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})}
                                    className="w-full bg-white border border-border rounded-xl px-4 py-3 outline-none"
                                />
                                <textarea 
                                    placeholder="Message Body (Use {guest_name} for personalization)" 
                                    rows={5}
                                    value={newTemplate.body}
                                    onChange={e => setNewTemplate({...newTemplate, body: e.target.value})}
                                    className="w-full bg-white border border-border rounded-xl px-4 py-3 outline-none resize-none"
                                />
                                <div className="flex gap-2">
                                    <button onClick={createTemplate} className="bg-primary text-white px-6 py-2 rounded-xl font-bold">Save Template</button>
                                    <button onClick={() => setIsCreatingTemplate(false)} className="bg-white border border-border px-6 py-2 rounded-xl font-bold">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map(t => (
                                <div key={t.id} className="p-6 border border-border rounded-3xl space-y-3 relative group">
                                    <button 
                                        onClick={() => deleteTemplate(t.id)}
                                        className="absolute top-4 right-4 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <h4 className="font-bold text-lg">{t.name}</h4>
                                    <p className="text-xs text-text-secondary uppercase tracking-widest font-black">Subject</p>
                                    <p className="text-sm">{t.subject_template}</p>
                                    <p className="text-xs text-text-secondary uppercase tracking-widest font-black">Message Preview</p>
                                    <p className="text-sm line-clamp-3 text-text-secondary italic">"{t.body_template}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Send New Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="font-serif font-bold text-xl flex items-center gap-2">
                                <Send className="w-5 h-5 text-primary" />
                                Ready to Send
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {guests.filter(g => !notes.find(n => n.recipient_email === g.guest_email && n.status === 'sent')).map(guest => (
                                    <div key={guest.id} className="p-4 border border-border rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-colors">
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm truncate">{guest.guest_name}</p>
                                            <p className="text-xs text-text-secondary truncate">{guest.guest_email || 'No email'}</p>
                                        </div>
                                        <button 
                                            onClick={() => sendNote(guest)}
                                            className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                                            title="Send Thank-You Note"
                                        >
                                            <Mail className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* History Section */}
                        <div className="space-y-6">
                            <h3 className="font-serif font-bold text-xl flex items-center gap-2">
                                <Clock className="w-5 h-5 text-text-secondary" />
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {notes.length === 0 ? (
                                    <p className="text-sm text-text-secondary italic py-10 text-center border-2 border-dashed border-border rounded-3xl">No notes sent yet.</p>
                                ) : (
                                    notes.map(note => (
                                        <div key={note.id} className="p-4 bg-neutral/50 rounded-2xl border border-border">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-bold text-sm">{note.recipient_name}</p>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Sent
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-text-secondary">
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
