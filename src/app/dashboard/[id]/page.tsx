import { notFound } from 'next/navigation';
import { Heart, Users, Share2, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { db, APP_COLLECTIONS } from '@/lib/firebase-admin';

async function getWeddingData(id: string) {
    const weddingDoc = await db.collection(APP_COLLECTIONS.WEDDINGS).doc(id).get();
    if (!weddingDoc.exists) return null;

    const rsvpSnapshot = await db.collection(APP_COLLECTIONS.RSVPS)
        .where('wedding_id', '==', id)
        .orderBy('created_at', 'desc')
        .get();

    const wedding = weddingDoc.data();
    const rsvps = rsvpSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { wedding, rsvps };
}

export default async function DashboardPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ created?: string }> }) {
    const { id } = await params;
    const { created } = await searchParams;
    const data = await getWeddingData(id);
    if (!data) notFound();

    const { wedding, rsvps } = data as any;

    // In production, you would use a real domain or environment variable
    const domain = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${domain}/w/${wedding.id}`;

    const confirmedGuests = rsvps.filter((r: any) => r.attendance === 'Yes').reduce((acc: number, r: any) => acc + (r.num_guests || 1), 0);

    return (
        <div className="min-h-screen bg-neutral pb-20">
            <div className="bg-white border-b border-border p-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-10 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                    <Link href={url} target="_blank" className="flex items-center gap-2 px-6 py-2 rounded-xl bg-neutral text-primary text-sm font-bold border border-border hover:bg-neutral-hover transition-all">
                        View Live Invitation <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 pt-12 text-left">
                {created && (
                    <div className="mb-12 p-8 rounded-3xl bg-success-bg border border-border flex items-center gap-6 animate-in fade-in slide-in-from-top-4">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-accent shadow-sm">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-primary mb-1">Your invitation is live!</h2>
                            <p className="text-text-secondary">Share your special URL below or use the QR code for your physical invitations.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-3xl bg-white border border-border soft-shadow">
                                <Users className="w-8 h-8 text-primary mb-4" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary/60 mb-1">Total Confirmed Guests</h3>
                                <p className="text-4xl font-serif font-bold text-foreground">{confirmedGuests}</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-white border border-border soft-shadow">
                                <Calendar className="w-8 h-8 text-primary mb-4" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary/60 mb-1">RSVP Responses</h3>
                                <p className="text-4xl font-serif font-bold text-foreground">{rsvps.length}</p>
                            </div>
                        </div>

                        {/* RSVP List */}
                        <div className="bg-white rounded-3xl border border-border soft-shadow overflow-hidden">
                            <div className="p-8 border-b border-border flex justify-between items-center">
                                <h3 className="text-2xl font-serif font-bold text-foreground">Recent Responses</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-neutral text-text-secondary/60 text-[10px] uppercase tracking-widest font-bold">
                                        <tr>
                                            <th className="px-8 py-4">Guest Name</th>
                                            <th className="px-8 py-4">Attending</th>
                                            <th className="px-8 py-4">Guests</th>
                                            <th className="px-8 py-4">Meal Pref</th>
                                            <th className="px-8 py-4">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rsvps.map((rsvp: any) => (
                                            <tr key={rsvp.id} className="hover:bg-neutral/30 transition-colors">
                                                <td className="px-8 py-6 font-bold text-foreground">{rsvp.guest_name}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rsvp.attendance === 'Yes' ? 'bg-success-bg text-primary' : 'bg-error-bg text-error-text'}`}>
                                                        {rsvp.attendance}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-text-secondary font-medium">{rsvp.num_guests}</td>
                                                <td className="px-8 py-6 text-text-secondary font-medium">{rsvp.meal_preference || '-'}</td>
                                                <td className="px-8 py-6 text-text-secondary/60 italic text-sm max-w-xs truncate">{rsvp.message || '-'}</td>
                                            </tr>
                                        ))}
                                        {rsvps.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center text-text-secondary/30 italic font-serif text-xl">
                                                    No responses yet. Share your link to start collecting RSVPs!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Share Card */}
                        <div className="p-8 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20">
                            <Share2 className="w-8 h-8 mb-6 text-white/40" />
                            <h3 className="text-2xl font-serif font-bold mb-2">Share Invitation</h3>
                            <p className="text-white/70 mb-8 border-b border-white/20 pb-4 break-all font-mono text-sm">{url}</p>
                            <div className="bg-white p-6 rounded-2xl flex justify-center mb-6 shadow-inner">
                                <QRCodeSVG value={url} size={180} fgColor="#D16C78" />
                            </div>
                            <p className="text-center text-white/60 text-xs uppercase tracking-widest font-bold">Scan to Preview</p>
                        </div>

                        {/* Event Info Card */}
                        <div className="p-8 rounded-3xl bg-white border border-border soft-shadow">
                            <h3 className="text-xl font-serif font-bold mb-6 text-foreground border-b border-border pb-4">Event Details</h3>
                            <div className="space-y-6 text-sm">
                                <div>
                                    <span className="text-text-secondary/60 block text-[10px] uppercase tracking-widest font-bold pb-2">Date & Time</span>
                                    <span className="font-bold text-foreground text-base">{wedding.wedding_date} @ {wedding.wedding_time}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary/60 block text-[10px] uppercase tracking-widest font-bold pb-2">Venue</span>
                                    <span className="font-bold text-foreground text-base">{wedding.venue_name}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary/60 block text-[10px] uppercase tracking-widest font-bold pb-2">RSVP Deadline</span>
                                    <span className="font-bold text-primary text-base">{wedding.rsvp_deadline}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
