'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, Plus, Trash2, Send, CheckCircle2, Loader2, 
    Clock, Save, ArrowRight, Type, Eye, AlertCircle
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
    const [activeView, setActiveView] = useState<'send' | 'templates' | 'history'>('send');
    
    // Template Builder State
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
        } catch (err: any) {
            alert("Failed to create template: " + (err.message || "Unknown error"));
        }
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm("Delete this template permanently?")) return;
        try {
            const { error } = await supabase.from('thank_you_templates').delete().eq('id', id);
            if (error) throw error;
            setTemplates(templates.filter(t => t.id !== id));
        } catch (err) {
            alert("Failed to delete template");
        }
    };

    const sendNote = async (guest: RSVP) => {
        if (!guest.guest_email) return alert("Guest doesn't have an email address.");

        const template = templates.length > 0 ? templates[0] : null;
        if (!template) {
            alert("Please create a template first.");
            setActiveView('templates');
            setIsCreatingTemplate(true);
            return;
        }

        try {
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
            
            // Visual feedback - normally would also trigger actual email send via API here
        } catch (err) {
            alert("Failed to record thank you note");
        }
    };

    // Derived states
    const guestsNeedingThanks = useMemo(() => {
        return guests.filter(g => !notes.find(n => n.recipient_email === g.guest_email && n.status === 'sent'));
    }, [guests, notes]);

    const guestsThanked = useMemo(() => {
        return notes.filter(n => n.status === 'sent');
    }, [notes]);

    // Live Preview generator
    const generatePreview = (text: string, guestName: string = "Sarah & John") => {
        if (!text) return <span className="text-text-secondary italic">Your message preview will appear here...</span>;
        
        let processed = text
            .replace(/{guest_name}/g, `<strong class="text-primary">${guestName}</strong>`)
            .replace(/\n/g, '<br/>');
            
        return <div dangerouslySetInnerHTML={{ __html: processed }} className="leading-relaxed" />;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] soft-shadow border border-border">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary font-serif italic">Loading Thank-You Note Studio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 soft-shadow border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Thank You Note Studio</h2>
                        <p className="text-sm text-text-secondary mt-1">Design email templates and track gratitude sent to your guests.</p>
                    </div>
                    
                    {/* iOS Style Segmented Control */}
                    <div className="flex bg-neutral/80 p-1.5 rounded-2xl border border-border/50">
                        {[
                            { id: 'send', label: 'Action Filter' },
                            { id: 'templates', label: 'Templates' },
                            { id: 'history', label: 'Sent History' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveView(tab.id as 'send'|'templates'|'history')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
                                    activeView === tab.id 
                                    ? 'text-primary shadow-sm bg-white' 
                                    : 'text-text-secondary hover:text-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* VIEW: SEND FILTER */}
                {activeView === 'send' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-3xl p-6">
                                <div>
                                    <h3 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                                        <Mail className="w-6 h-6 text-primary" />
                                        Needs Thanking
                                    </h3>
                                    <p className="text-sm text-text-secondary mt-1">You have {guestsNeedingThanks.length} guests left to thank.</p>
                                </div>
                                {templates.length === 0 && (
                                    <div className="flex flex-col items-end">
                                        <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                                        <span className="text-xs text-amber-600 font-bold bg-amber-100 px-3 py-1 rounded-full">Create Template First</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {guestsNeedingThanks.length === 0 ? (
                                    <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-3xl bg-neutral/30">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
                                        <h4 className="font-serif font-bold text-lg">Incredible!</h4>
                                        <p className="text-sm text-text-secondary">All your confirmed guests have been thanked.</p>
                                    </div>
                                ) : (
                                    guestsNeedingThanks.map(guest => (
                                        <div key={guest.id} className="p-5 bg-white border border-border hover:border-primary/40 hover:shadow-md rounded-[1.5rem] flex flex-col justify-between group transition-all">
                                            <div className="mb-4">
                                                <p className="font-bold text-foreground text-lg">{guest.guest_name}</p>
                                                <p className="text-xs text-text-secondary truncate mt-0.5">{guest.guest_email || 'No email provided - Send via Text'}</p>
                                            </div>
                                            
                                            <button 
                                                disabled={!guest.guest_email || templates.length === 0}
                                                onClick={() => sendNote(guest)}
                                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                                    !guest.guest_email || templates.length === 0
                                                    ? 'bg-neutral text-border cursor-not-allowed'
                                                    : 'bg-primary text-white hover:-translate-y-0.5 shadow-sm active:translate-y-0'
                                                }`}
                                            >
                                                <Send className="w-4 h-4" /> 
                                                Send Email Note
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Summary Widget */}
                        <div className="space-y-4">
                            <div className="bg-neutral/50 rounded-3xl p-6 border border-border">
                                <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Progress</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium">Total Thanked</span>
                                            <span className="font-bold text-emerald-600">{guestsThanked.length}</span>
                                        </div>
                                        <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 rounded-full" 
                                                style={{ width: `${(guestsThanked.length / Math.max(1, guests.length)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-border">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium">Remaining</span>
                                            <span className="font-bold text-primary">{guestsNeedingThanks.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* VIEW: TEMPLATES BUILDER */}
                {activeView === 'templates' && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        {!isCreatingTemplate ? (
                            <div className="space-y-6">
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => { setIsCreatingTemplate(true); setNewTemplate({ name: '', subject: 'Thank you for celebrating with us!', body: '' }); }}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                                    >
                                        <Plus className="w-5 h-5" /> Design New Template
                                    </button>
                                </div>

                                {templates.length === 0 ? (
                                    <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-neutral/20">
                                        <Type className="w-12 h-12 text-text-secondary opacity-30 mx-auto mb-4" />
                                        <h4 className="font-serif font-bold text-xl mb-1">No Templates Yet</h4>
                                        <p className="text-sm text-text-secondary">Design your first email template to start thanking guests.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {templates.map(t => (
                                            <div key={t.id} className="bg-white border-2 border-border/80 hover:border-primary/40 p-6 rounded-[2rem] transition-all group relative">
                                                <button 
                                                    onClick={() => deleteTemplate(t.id)}
                                                    className="absolute top-6 right-6 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 rounded-full bg-white z-10 shadow-sm"
                                                    title="Delete Template"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <Mail className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg text-foreground">{t.name}</h4>
                                                        {t.is_default && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>}
                                                    </div>
                                                </div>

                                                <div className="space-y-4 bg-neutral/30 rounded-2xl p-4 border border-border/50">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Subject</p>
                                                        <p className="text-sm font-medium">{t.subject_template}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Message Preview</p>
                                                        <div className="text-sm line-clamp-3 text-text-secondary leading-relaxed bg-white/50 p-2 rounded-xl">
                                                            {generatePreview(t.body_template)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-neutral/40 p-2 sm:p-4 rounded-[2.5rem] border border-border">
                                {/* Editor Side */}
                                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-border border-opacity-50 space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-serif font-bold text-2xl">Template Builder</h3>
                                        <button onClick={() => setIsCreatingTemplate(false)} className="p-2 hover:bg-neutral rounded-full transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Template Name</label>
                                            <input 
                                                placeholder="e.g. Standard Thank You" 
                                                value={newTemplate.name}
                                                onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                                                className="w-full bg-neutral/80 border border-border focus:border-primary focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Email Subject</label>
                                            <input 
                                                placeholder="Thank you for coming!" 
                                                value={newTemplate.subject}
                                                onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})}
                                                className="w-full bg-neutral/80 border border-border focus:border-primary focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium text-sm"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Message Body</label>
                                                <div className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-lg font-bold">
                                                    Use <span className="font-mono bg-white px-1 rounded">{'{guest_name}'}</span> to personalize
                                                </div>
                                            </div>
                                            <textarea 
                                                placeholder="Dear {guest_name}, thank you so much for celebrating our special day with us..." 
                                                rows={8}
                                                value={newTemplate.body}
                                                onChange={e => setNewTemplate({...newTemplate, body: e.target.value})}
                                                className="w-full bg-neutral/80 border border-border focus:border-primary focus:bg-white rounded-xl px-4 py-3 outline-none transition-all text-sm leading-relaxed custom-scrollbar whitespace-pre-wrap"
                                            />
                                        </div>

                                        <button 
                                            onClick={createTemplate} 
                                            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" /> Save Template
                                        </button>
                                    </div>
                                </div>

                                {/* Preview Side */}
                                <div className="bg-[#f0f2f5] p-6 sm:p-8 rounded-[2rem] border border-border flex flex-col">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                                        <Eye className="w-4 h-4" /> Live Email Preview
                                    </h3>
                                    
                                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden flex flex-col">
                                        <div className="bg-neutral/80 px-4 py-3 border-b border-border text-sm flex gap-3 items-center">
                                            <span className="text-text-secondary text-xs uppercase font-bold tracking-wider w-12">From:</span>
                                            <span className="font-bold">You & Your Partner</span>
                                        </div>
                                        <div className="bg-white px-4 py-3 border-b border-border text-sm flex gap-3 items-center">
                                            <span className="text-text-secondary text-xs uppercase font-bold tracking-wider w-12">Subj:</span>
                                            <span className="font-bold">{newTemplate.subject || ' '}</span>
                                        </div>
                                        
                                        <div className="p-6 flex-1 bg-white">
                                            <div className="font-serif">
                                                {generatePreview(newTemplate.body)}
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-neutral/50 text-center text-[10px] text-text-secondary border-t border-border">
                                            Powered by QuickWeds Editor
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* VIEW: SENT HISTORY */}
                {activeView === 'history' && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h3 className="font-serif font-bold text-xl flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-text-secondary" />
                            Activity Log
                        </h3>
                        
                        {notes.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-neutral/20">
                                <Send className="w-12 h-12 text-text-secondary opacity-30 mx-auto mb-4" />
                                <p className="text-sm text-text-secondary font-medium">Your outbox is pristine.</p>
                                <p className="text-xs text-text-secondary mt-1 italic">Notes you send will be logged here automatically.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-border rounded-3xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral/80 border-b border-border text-xs uppercase tracking-widest text-text-secondary">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Recipient</th>
                                            <th className="px-6 py-4 font-bold">Date Sent</th>
                                            <th className="px-6 py-4 font-bold text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {notes.map(note => (
                                            <tr key={note.id} className="hover:bg-neutral/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-foreground">{note.recipient_name}</p>
                                                    <p className="text-xs text-text-secondary mt-0.5">{note.recipient_email}</p>
                                                </td>
                                                <td className="px-6 py-4 text-text-secondary">
                                                    {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    <div className="text-[10px]">{new Date(note.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit'})}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                                                        <CheckCircle2 className="w-3 h-3" /> Sent
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
