'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    FileText,
    Loader2,
    Phone,
    Printer,
    ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCachedSession } from '@/lib/session-cache';

// Types representing the API payload structure
type Wedding = {
    id: string;
    bride_name: string | null;
    groom_name: string | null;
    wedding_date: string | null;
    wedding_time: string | null;
    venue_name: string | null;
    venue_address: string | null;
    currency: string | null;
};

type EmergencyContact = {
    name: string;
    role: string;
    phone: string;
};

type Settings = {
    emergency_contacts: EmergencyContact[];
    coordinator_notes: string | null;
};

type Guest = {
    id: string;
    guest_name: string;
    guest_email: string | null;
    rsvp_status: string;
    attendance: string | null;
    num_guests: number;
    guest_group: string | null;
    table_assignment: string | null;
    plus_one_allowed: boolean;
    plus_one_name: string | null;
    plus_one_email: string | null;
    plus_one_rsvp_status: string;
    children_count: number;
    meal_preference: string | null;
    dietary_details: string | null;
    message: string | null;
    phone: string | null;
};

type SeatingTable = {
    id: string;
    table_name: string;
    table_shape: string;
    capacity: number;
};

type SeatingAssignment = {
    id: string;
    table_id: string;
    rsvp_id: string | null;
    guest_name: string;
    guest_email: string | null;
};

type Vendor = {
    id: string;
    role: string;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    amount: number;
    payment_status: string;
    payment_method: string | null;
};

type Budget = {
    id: string;
    category: string;
    item_name: string;
    estimated_cost: number;
    actual_cost: number;
    is_paid: boolean;
};

type TimelineEvent = {
    id: string;
    title: string;
    starts_at: string;
    ends_at: string | null;
    location: string | null;
    notes: string | null;
};

async function getToken() {
    const { data } = await getCachedSession();
    return data.session?.access_token || '';
}

function getCurrencySymbol(currency?: string | null) {
    const normalized = String(currency || 'USD').toLowerCase();
    if (normalized === 'usd') return '$';
    if (normalized === 'jpy' || normalized === 'yen') return '¥';
    if (normalized === 'php' || normalized === 'peso') return '₱';
    if (normalized === 'eur') return '€';
    if (normalized === 'gbp') return '£';
    return '$';
}

export default function CoordinatorReportPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const weddingId = params?.id || '';

    // Data States
    const [wedding, setWedding] = useState<Wedding | null>(null);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [rsvps, setRsvps] = useState<Guest[]>([]);
    const [seatingTables, setSeatingTables] = useState<SeatingTable[]>([]);
    const [seatingAssignments, setSeatingAssignments] = useState<SeatingAssignment[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [events, setEvents] = useState<TimelineEvent[]>([]);

    // Page States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Toggle Toggles
    const [showEmergencyContacts, setShowEmergencyContacts] = useState(true);
    const [showTimeline, setShowTimeline] = useState(true);
    const [showSeatingChart, setShowSeatingChart] = useState(true);
    const [showGuestList, setShowGuestList] = useState(true);
    const [showVipNotes, setShowVipNotes] = useState(true);
    const [showAllergies, setShowAllergies] = useState(true);
    const [showVendors, setShowVendors] = useState(true);
    const [showUnpaidBalances, setShowUnpaidBalances] = useState(true);

    // Styling configuration
    const [printTheme, setPrintTheme] = useState<'classic' | 'monochrome'>('classic');

    const loadData = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/wedding-day/coordinator-report?weddingId=${encodeURIComponent(weddingId)}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load report data.');

            setWedding(data.wedding);
            setSettings(data.settings);
            setRsvps(data.rsvps || []);
            setSeatingTables(data.seatingTables || []);
            setSeatingAssignments(data.seatingAssignments || []);
            setVendors(data.vendors || []);
            setBudgets(data.budgets || []);
            setEvents(data.events || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load report data.');
        } finally {
            setLoading(false);
        }
    }, [router, weddingId]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user && weddingId) void loadData();
    }, [authLoading, user, weddingId, router, loadData]);

    const coupleNames = useMemo(() => {
        if (!wedding) return 'Wedding Report';
        return [wedding.bride_name, wedding.groom_name].filter(Boolean).join(' & ') || 'Wedding Report';
    }, [wedding]);

    const currencySymbol = useMemo(() => getCurrencySymbol(wedding?.currency), [wedding]);

    // Headcount Computations
    const headcountSummary = useMemo(() => {
        const confirmed = rsvps
            .filter((g) => g.rsvp_status === 'confirmed' || g.rsvp_status === 'confirmed_manual' || g.attendance === 'Yes');
        const declined = rsvps
            .filter((g) => g.rsvp_status === 'declined' || g.attendance === 'No');
        const pending = rsvps
            .filter((g) => g.rsvp_status === 'pending' && g.attendance !== 'Yes' && g.attendance !== 'No');

        const confirmedHeadcount = confirmed.reduce((sum, g) => sum + (g.num_guests || 1), 0);
        const declinedHeadcount = declined.reduce((sum, g) => sum + (g.num_guests || 1), 0);
        const pendingHeadcount = pending.reduce((sum, g) => sum + (g.num_guests || 1), 0);

        return {
            totalGuests: confirmedHeadcount + declinedHeadcount + pendingHeadcount,
            confirmed: confirmedHeadcount,
            declined: declinedHeadcount,
            pending: pendingHeadcount,
            confirmedRsvps: confirmed.length,
            totalRsvps: rsvps.length
        };
    }, [rsvps]);

    // Grouping Guest Table Assignments
    const tablesWithGuests = useMemo(() => {
        return seatingTables.map((table) => {
            // Find assignments matching this table_id
            const tableAssignments = seatingAssignments.filter((sa) => sa.table_id === table.id);

            // Fetch actual guests corresponding to assignments
            const guestsSeated = tableAssignments.map((assignment) => {
                const matchedGuest = rsvps.find((rsvp) => rsvp.id === assignment.rsvp_id);
                return {
                    name: assignment.guest_name,
                    dietary: matchedGuest?.dietary_details || null,
                    group: matchedGuest?.guest_group || null,
                    meal: matchedGuest?.meal_preference || null
                };
            });

            // Fallback: If table_assignments is empty, grab guests whose `table_assignment` column matches table name
            if (guestsSeated.length === 0) {
                const guestsMatchedByName = rsvps
                    .filter((rsvp) => rsvp.table_assignment?.trim().toLowerCase() === table.table_name.trim().toLowerCase())
                    .map((g) => ({
                        name: g.guest_name,
                        dietary: g.dietary_details,
                        group: g.guest_group,
                        meal: g.meal_preference
                    }));
                guestsSeated.push(...guestsMatchedByName);
            }

            return {
                ...table,
                guests: guestsSeated
            };
        });
    }, [seatingTables, seatingAssignments, rsvps]);

    // Unassigned confirmed guests
    const unassignedGuests = useMemo(() => {
        const confirmed = rsvps.filter((g) => g.rsvp_status === 'confirmed' || g.rsvp_status === 'confirmed_manual' || g.attendance === 'Yes');
        return confirmed.filter((guest) => {
            const hasAssignment = seatingAssignments.some((sa) => sa.rsvp_id === guest.id);
            const hasTextAssignment = guest.table_assignment && guest.table_assignment.trim() !== '';
            return !hasAssignment && !hasTextAssignment;
        });
    }, [rsvps, seatingAssignments]);

    // VIP guests
    const vipGuests = useMemo(() => {
        return rsvps.filter((g) => String(g.guest_group || '').toLowerCase() === 'vip');
    }, [rsvps]);

    // Guests with dietary restrictions
    const dietaryGuests = useMemo(() => {
        return rsvps.filter((g) => {
            const hasDietary = g.dietary_details && g.dietary_details.trim() !== '';
            const isAttending = g.rsvp_status === 'confirmed' || g.rsvp_status === 'confirmed_manual' || g.attendance === 'Yes';
            return hasDietary && isAttending;
        });
    }, [rsvps]);

    // Budget unpaid balance computations
    const budgetSummary = useMemo(() => {
        // Vendors unpaid
        const outstandingVendors = vendors.map((vendor) => {
            const isPaid = vendor.payment_status?.toLowerCase() === 'paid';
            const isPending = vendor.payment_status?.toLowerCase() === 'pending';
            const paidAmount = isPaid ? vendor.amount : (isPending ? vendor.amount * 0.5 : 0); // hypothetical estimation
            const balance = vendor.amount - paidAmount;

            return {
                ...vendor,
                paid: paidAmount,
                balance
            };
        }).filter((v) => v.balance > 0);

        // Budget items unpaid
        const outstandingBudgets = budgets.filter((b) => !b.is_paid && b.actual_cost > 0);

        const totalVendorOwed = outstandingVendors.reduce((sum, v) => sum + v.balance, 0);
        const totalBudgetOwed = outstandingBudgets.reduce((sum, b) => sum + (b.actual_cost || 0), 0);

        return {
            outstandingVendors,
            outstandingBudgets,
            totalOwed: totalVendorOwed + totalBudgetOwed
        };
    }, [vendors, budgets]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FFF8F4] px-4">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                    <p className="mt-3 text-sm font-bold text-text-secondary">Generating handoff report...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FFF8F4] px-4">
                <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 p-8 text-center shadow-xl shadow-primary/5 space-y-4">
                    <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
                    <h1 className="text-xl font-serif font-bold text-foreground">Report Generation Failed</h1>
                    <p className="text-sm text-text-secondary leading-relaxed">{error}</p>
                    <button onClick={() => void loadData()} className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition">
                        Retry Loading
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={`min-h-screen ${printTheme === 'monochrome' ? 'bg-white text-black' : 'bg-[#FFF8F4] text-foreground'} pb-12`}>
            {/* Sticky Web Control Panel - HIDDEN IN PRINT VIEW */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border py-4 px-4 shadow-md print:hidden">
                <div className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/dashboard/${weddingId}/wedding-day`} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral transition">
                            <ArrowLeft className="h-5 w-5 text-text-secondary" />
                        </Link>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">Pre-wedding Day Export</p>
                            <h1 className="text-lg font-serif font-bold">Coordinator Handoff Report</h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Theme Select */}
                        <div className="flex rounded-xl bg-neutral p-1 border border-border">
                            <button
                                onClick={() => setPrintTheme('classic')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${printTheme === 'classic' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-foreground'}`}
                            >
                                Elegant Style
                            </button>
                            <button
                                onClick={() => setPrintTheme('monochrome')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${printTheme === 'monochrome' ? 'bg-white text-black shadow-sm border border-neutral' : 'text-text-secondary hover:text-foreground'}`}
                            >
                                Ink Saver
                            </button>
                        </div>

                        {/* Print Button */}
                        <button
                            onClick={handlePrint}
                            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition"
                        >
                            <Printer className="h-4 w-4" />
                            Print / Save PDF
                        </button>
                    </div>
                </div>

                {/* Section Toggles Toolbar */}
                <div className="max-w-6xl mx-auto mt-4 pt-3 border-t border-border/60">
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-text-secondary mb-2">Visible Report Sections</p>
                    <div className="flex flex-wrap gap-2">
                        <SectionToggle label="Emergency Contacts" active={showEmergencyContacts} onClick={() => setShowEmergencyContacts(!showEmergencyContacts)} />
                        <SectionToggle label="Timeline" active={showTimeline} onClick={() => setShowTimeline(!showTimeline)} />
                        <SectionToggle label="Seating Chart" active={showSeatingChart} onClick={() => setShowSeatingChart(!showSeatingChart)} />
                        <SectionToggle label="Guest List" active={showGuestList} onClick={() => setShowGuestList(!showGuestList)} />
                        <SectionToggle label="VIP Notes" active={showVipNotes} onClick={() => setShowVipNotes(!showVipNotes)} />
                        <SectionToggle label="Allergies" active={showAllergies} onClick={() => setShowAllergies(!showAllergies)} />
                        <SectionToggle label="Suppliers" active={showVendors} onClick={() => setShowVendors(!showVendors)} />
                        <SectionToggle label="Outstanding Balances" active={showUnpaidBalances} onClick={() => setShowUnpaidBalances(!showUnpaidBalances)} />
                    </div>
                </div>
            </div>

            {/* REPORT BODY */}
            <div className="max-w-5xl mx-auto mt-6 px-4 print:px-0 print:mt-0">
                <article className={`bg-white p-6 sm:p-10 rounded-3xl border border-border/80 shadow-xl shadow-primary/5 print:shadow-none print:border-none print:p-0 ${printTheme === 'monochrome' ? 'text-black' : ''}`}>
                    {/* Header */}
                    <header className="border-b-4 border-primary pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 print:border-black">
                        <div>
                            <p className={`text-xs font-black uppercase tracking-[0.2em] ${printTheme === 'monochrome' ? 'text-black' : 'text-primary'}`}>
                                Official Coordinator Handoff Report
                            </p>
                            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold leading-tight">{coupleNames}</h2>
                            <p className="mt-2 text-sm text-text-secondary print:text-black">
                                Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date().toLocaleTimeString(undefined, { timeStyle: 'short' })}
                            </p>
                        </div>
                        <div className="text-left md:text-right text-sm leading-6 shrink-0 print:text-black">
                            {wedding?.wedding_date && (
                                <p><strong>Wedding Date:</strong> {new Date(wedding.wedding_date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                            )}
                            {wedding?.wedding_time && (
                                <p><strong>Time:</strong> {wedding.wedding_time}</p>
                            )}
                            {wedding?.venue_name && (
                                <p><strong>Venue:</strong> {wedding.venue_name}</p>
                            )}
                            {wedding?.venue_address && (
                                <p className="text-xs text-text-secondary print:text-black max-w-xs md:ml-auto">{wedding.venue_address}</p>
                            )}
                        </div>
                    </header>

                    {/* Operational Notes */}
                    {settings?.coordinator_notes && (
                        <section className={`mb-8 p-5 rounded-2xl border ${printTheme === 'monochrome' ? 'border-black' : 'border-primary/20 bg-primary/5'} break-inside-avoid`}>
                            <h3 className="font-serif text-lg font-bold flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4" /> Coordinator Notes
                            </h3>
                            <p className="text-sm leading-7 whitespace-pre-wrap text-foreground/90 print:text-black">{settings.coordinator_notes}</p>
                        </section>
                    )}

                    {/* Quick Headcount Summary Dashboard */}
                    <section className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-4 break-inside-avoid">
                        <div className={`p-4 rounded-xl border border-border text-center ${printTheme === 'monochrome' ? 'border-black' : 'bg-neutral/40'}`}>
                            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-text-secondary print:text-black">Total Headcount</p>
                            <p className={`mt-2 font-serif text-2xl font-bold ${printTheme === 'monochrome' ? '' : 'text-primary'}`}>{headcountSummary.totalGuests}</p>
                        </div>
                        <div className={`p-4 rounded-xl border border-border text-center ${printTheme === 'monochrome' ? 'border-black' : 'bg-emerald-50/50 border-emerald-100'}`}>
                            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-800 print:text-black">Confirmed Guests</p>
                            <p className="mt-2 font-serif text-2xl font-bold text-emerald-700 print:text-black">{headcountSummary.confirmed}</p>
                        </div>
                        <div className={`p-4 rounded-xl border border-border text-center ${printTheme === 'monochrome' ? 'border-black' : 'bg-rose-50/50 border-rose-100'}`}>
                            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-rose-800 print:text-black">Declined Guests</p>
                            <p className="mt-2 font-serif text-2xl font-bold text-rose-700 print:text-black">{headcountSummary.declined}</p>
                        </div>
                        <div className={`p-4 rounded-xl border border-border text-center ${printTheme === 'monochrome' ? 'border-black' : 'bg-amber-50/50 border-amber-100'}`}>
                            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-amber-800 print:text-black">Pending Headcount</p>
                            <p className="mt-2 font-serif text-2xl font-bold text-amber-700 print:text-black">{headcountSummary.pending}</p>
                        </div>
                    </section>

                    {/* EMERGENCY CONTACTS */}
                    {showEmergencyContacts && (
                        <section className="mb-10 break-inside-avoid">
                            <SectionHeading title="Emergency Contacts" printTheme={printTheme} />
                            {settings?.emergency_contacts && settings.emergency_contacts.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    {settings.emergency_contacts.map((contact, index) => (
                                        <div key={index} className={`p-4 rounded-2xl border border-border ${printTheme === 'monochrome' ? 'border-black bg-white' : 'bg-neutral/30'}`}>
                                            <p className="font-bold text-sm text-foreground print:text-black">{contact.name}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.05em] mt-1 ${printTheme === 'monochrome' ? 'text-black' : 'text-primary'}`}>{contact.role}</p>
                                            <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-text-secondary print:text-black">
                                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                                <span>{contact.phone}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary italic">No emergency contacts saved.</p>
                            )}
                        </section>
                    )}

                    {/* TIMELINE */}
                    {showTimeline && (
                        <section className="mb-10 page-break-after">
                            <SectionHeading title="Timeline & Run of Show" printTheme={printTheme} />
                            {events.length > 0 ? (
                                <div className="relative border-l border-border pl-6 space-y-6 md:space-y-8 print:border-black">
                                    {events.map((event) => {
                                        const startTime = new Date(event.starts_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                                        const endTime = event.ends_at ? new Date(event.ends_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : null;

                                        return (
                                            <div key={event.id} className="relative break-inside-avoid">
                                                {/* Timeline node */}
                                                <div className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border bg-white ${printTheme === 'monochrome' ? 'border-black' : 'border-primary'}`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${printTheme === 'monochrome' ? 'bg-black' : 'bg-primary'}`} />
                                                </div>
                                                <div>
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase mb-1.5 ${printTheme === 'monochrome' ? 'border border-black text-black' : 'bg-primary/10 text-primary'}`}>
                                                        {startTime} {endTime ? ` - ${endTime}` : ''}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-foreground print:text-black">{event.title}</h4>
                                                    {event.location && (
                                                        <p className="text-xs text-text-secondary print:text-black mt-1"><strong>Location:</strong> {event.location}</p>
                                                    )}
                                                    {event.notes && (
                                                        <p className="text-xs text-text-secondary print:text-black mt-1 leading-relaxed whitespace-pre-wrap">{event.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary italic">No timeline events scheduled.</p>
                            )}
                        </section>
                    )}

                    {/* SEATING CHART */}
                    {showSeatingChart && (
                        <section className="mb-10 page-break-after">
                            <SectionHeading title="Reception Seating Layout" printTheme={printTheme} />
                            {tablesWithGuests.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                                    {tablesWithGuests.map((table) => (
                                        <div key={table.id} className={`p-5 rounded-2xl border border-border break-inside-avoid ${printTheme === 'monochrome' ? 'border-black bg-white' : 'bg-neutral/20'}`}>
                                            <div className="border-b border-border/80 pb-2 mb-3 flex items-center justify-between print:border-black">
                                                <h4 className="font-bold text-sm text-foreground print:text-black">{table.table_name}</h4>
                                                <span className="text-[10px] text-text-secondary font-semibold print:text-black">Cap: {table.capacity}</span>
                                            </div>
                                            {table.guests.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {table.guests.map((g, idx) => (
                                                        <li key={idx} className="text-xs flex flex-wrap items-center gap-1.5 leading-relaxed text-foreground print:text-black">
                                                            <span className="font-semibold">{g.name}</span>
                                                            {g.group === 'vip' && (
                                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.05em] ${printTheme === 'monochrome' ? 'border border-black' : 'bg-primary/10 text-primary'}`}>
                                                                    VIP
                                                                </span>
                                                            )}
                                                            {g.dietary && (
                                                                <span className="text-rose-600 font-bold print:text-black text-[9px]">
                                                                    (Diet: {g.dietary})
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-[11px] text-text-secondary italic">No guests assigned.</p>
                                            )}
                                        </div>
                                    ))}
                                    {unassignedGuests.length > 0 && (
                                        <div className="p-5 rounded-2xl border border-dashed border-rose-200 bg-rose-50/20 break-inside-avoid print:border-black print:bg-white">
                                            <div className="border-b border-rose-200 pb-2 mb-3 print:border-black">
                                                <h4 className="font-bold text-sm text-rose-800 print:text-black">Unassigned Guests</h4>
                                                <span className="text-[10px] text-rose-700 font-semibold print:text-black">Count: {unassignedGuests.length}</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {unassignedGuests.map((g) => (
                                                    <li key={g.id} className="text-xs text-rose-900 print:text-black font-semibold leading-relaxed">
                                                        {g.guest_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary italic">No seating layout created.</p>
                            )}
                        </section>
                    )}

                    {/* VIP NOTES */}
                    {showVipNotes && (
                        <section className="mb-10 page-break-after">
                            <SectionHeading title="VIP Notes & Guest Details" printTheme={printTheme} />
                            {vipGuests.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className={`border-b-2 ${printTheme === 'monochrome' ? 'border-black text-black' : 'border-primary/20 text-primary'} font-black uppercase tracking-wider`}>
                                                <th className="py-2.5 pr-4">VIP Guest</th>
                                                <th className="py-2.5 pr-4">Table</th>
                                                <th className="py-2.5 pr-4">Meal Preference</th>
                                                <th className="py-2.5 pr-4">Dietary/Allergies</th>
                                                <th className="py-2.5">Personal Message / Note</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vipGuests.map((vip) => (
                                                <tr key={vip.id} className="border-b border-border/60 break-inside-avoid print:border-black">
                                                    <td className="py-3 pr-4 font-bold text-foreground print:text-black">{vip.guest_name}</td>
                                                    <td className="py-3 pr-4 font-medium text-text-secondary print:text-black">{vip.table_assignment || 'Unassigned'}</td>
                                                    <td className="py-3 pr-4 text-text-secondary print:text-black">{vip.meal_preference || '-'}</td>
                                                    <td className="py-3 pr-4 font-bold text-rose-700 print:text-black">{vip.dietary_details || '-'}</td>
                                                    <td className="py-3 text-text-secondary print:text-black italic leading-normal max-w-xs whitespace-normal">{vip.message || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary italic">No guests designated as VIP.</p>
                            )}
                        </section>
                    )}

                    {/* DIETARY & ALLERGIES SUMMARY */}
                    {showAllergies && (
                        <section className="mb-10 break-inside-avoid">
                            <SectionHeading title="Dietary Requirements & Allergies" printTheme={printTheme} />
                            {dietaryGuests.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className={`border-b-2 ${printTheme === 'monochrome' ? 'border-black text-black' : 'border-primary/20 text-primary'} font-black uppercase tracking-wider`}>
                                                <th className="py-2.5 pr-4">Guest Name</th>
                                                <th className="py-2.5 pr-4">Group</th>
                                                <th className="py-2.5 pr-4">Table</th>
                                                <th className="py-2.5 pr-4">Meal Preference</th>
                                                <th className="py-2.5">Allergies & Dietary Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dietaryGuests.map((guest) => (
                                                <tr key={guest.id} className="border-b border-border/60 print:border-black">
                                                    <td className="py-3 pr-4 font-bold text-foreground print:text-black">{guest.guest_name}</td>
                                                    <td className="py-3 pr-4 text-text-secondary print:text-black capitalize">{guest.guest_group?.replace('_', ' ') || 'General'}</td>
                                                    <td className="py-3 pr-4 font-medium text-text-secondary print:text-black">{guest.table_assignment || 'Unassigned'}</td>
                                                    <td className="py-3 pr-4 text-text-secondary print:text-black">{guest.meal_preference || '-'}</td>
                                                    <td className="py-3 font-black text-rose-700 print:text-black bg-rose-50/20 px-2 rounded print:bg-white print:px-0">{guest.dietary_details}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary italic">No dietary restrictions entered for confirmed guests.</p>
                            )}
                        </section>
                    )}

                    {/* FINAL GUEST LIST */}
                    {showGuestList && (
                        <section className="mb-10 page-break-after">
                            <SectionHeading title="Final Guest List (Attending)" printTheme={printTheme} />
                            {rsvps.filter((g) => g.rsvp_status === 'confirmed' || g.rsvp_status === 'confirmed_manual' || g.attendance === 'Yes').length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className={`border-b-2 ${printTheme === 'monochrome' ? 'border-black text-black' : 'border-primary/20 text-primary'} font-black uppercase tracking-wider`}>
                                                <th className="py-2.5 pr-4">Guest Name</th>
                                                <th className="py-2.5 pr-4">Email</th>
                                                <th className="py-2.5 pr-4">Phone</th>
                                                <th className="py-2.5 pr-4">Group</th>
                                                <th className="py-2.5 pr-4">Table</th>
                                                <th className="py-2.5 pr-4">Meal</th>
                                                <th className="py-2.5">Headcount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rsvps
                                                .filter((g) => g.rsvp_status === 'confirmed' || g.rsvp_status === 'confirmed_manual' || g.attendance === 'Yes')
                                                .map((guest) => (
                                                    <tr key={guest.id} className="border-b border-border/60 break-inside-avoid print:border-black">
                                                        <td className="py-3 pr-4 font-bold text-foreground print:text-black">
                                                            {guest.guest_name}
                                                            {guest.guest_group === 'vip' && (
                                                                <span className={`ml-1.5 px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.05em] ${printTheme === 'monochrome' ? 'border border-black' : 'bg-primary/10 text-primary'}`}>
                                                                    VIP
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black truncate max-w-[150px]">{guest.guest_email || '-'}</td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black">{guest.phone || '-'}</td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black capitalize">{guest.guest_group?.replace('_', ' ') || 'General'}</td>
                                                        <td className="py-3 pr-4 font-medium text-text-secondary print:text-black">{guest.table_assignment || 'Unassigned'}</td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black truncate max-w-[100px]">{guest.meal_preference || '-'}</td>
                                                        <td className="py-3 font-semibold text-foreground print:text-black">{guest.num_guests || 1}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary italic">No guests confirmed.</p>
                            )}
                        </section>
                    )}

                    {/* SUPPLIERS */}
                    {showVendors && (
                        <section className="mb-10 break-inside-avoid">
                            <SectionHeading title="Wedding Suppliers & Vendors" printTheme={printTheme} />
                            {vendors.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {vendors.map((vendor) => (
                                        <div key={vendor.id} className={`p-4 rounded-2xl border border-border break-inside-avoid ${printTheme === 'monochrome' ? 'border-black bg-white' : 'bg-neutral/20'}`}>
                                            <div className="flex justify-between items-start border-b border-border/60 pb-2 mb-3 print:border-black">
                                                <div>
                                                    <h4 className="font-bold text-sm text-foreground print:text-black">{vendor.name}</h4>
                                                    <p className={`text-[10px] font-black uppercase tracking-wider ${printTheme === 'monochrome' ? 'text-black' : 'text-primary'}`}>{vendor.role}</p>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                                    vendor.payment_status === 'paid'
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 print:text-black print:border-black'
                                                        : vendor.payment_status === 'pending'
                                                            ? 'bg-amber-50 border-amber-100 text-amber-700 print:text-black print:border-black'
                                                            : 'bg-neutral border-border text-text-secondary print:text-black print:border-black'
                                                }`}>
                                                    {vendor.payment_status}
                                                </span>
                                            </div>
                                            <div className="space-y-1.5 text-xs text-text-secondary print:text-black leading-relaxed">
                                                {vendor.phone && <p><strong>Phone:</strong> {vendor.phone}</p>}
                                                {vendor.email && <p><strong>Email:</strong> {vendor.email}</p>}
                                                {vendor.amount > 0 && <p><strong>Rate/Budget:</strong> {currencySymbol}{vendor.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>}
                                                {vendor.notes && <p className="italic mt-2 whitespace-pre-wrap">{vendor.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary italic">No supplier details saved.</p>
                            )}
                        </section>
                    )}

                    {/* OUTSTANDING BALANCES */}
                    {showUnpaidBalances && (
                        <section className="mb-6 break-inside-avoid">
                            <SectionHeading title="Outstanding Supplier Balances" printTheme={printTheme} />
                            {budgetSummary.outstandingVendors.length > 0 || budgetSummary.outstandingBudgets.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className={`border-b-2 ${printTheme === 'monochrome' ? 'border-black text-black' : 'border-primary/20 text-primary'} font-black uppercase tracking-wider`}>
                                                    <th className="py-2.5 pr-4">Supplier / Item</th>
                                                    <th className="py-2.5 pr-4">Category / Role</th>
                                                    <th className="py-2.5 pr-4">Payment Status</th>
                                                    <th className="py-2.5 pr-4">Total Fee</th>
                                                    <th className="py-2.5">Outstanding Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Outstanding Vendors */}
                                                {budgetSummary.outstandingVendors.map((vendor) => (
                                                    <tr key={vendor.id} className="border-b border-border/60 print:border-black">
                                                        <td className="py-3 pr-4 font-bold text-foreground print:text-black">{vendor.name}</td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black capitalize">{vendor.role}</td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black capitalize">{vendor.payment_status}</td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black">{currencySymbol}{vendor.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                        <td className="py-3 font-bold text-rose-700 print:text-black">{currencySymbol}{vendor.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))}

                                                {/* Outstanding Budget Line Items */}
                                                {budgetSummary.outstandingBudgets.map((budget) => (
                                                    <tr key={budget.id} className="border-b border-border/60 print:border-black">
                                                        <td className="py-3 pr-4 font-bold text-foreground print:text-black">{budget.item_name}</td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black capitalize">{budget.category}</td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black">Unpaid</td>
                                                        <td className="py-3 pr-4 text-text-secondary print:text-black">{currencySymbol}{budget.estimated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                        <td className="py-3 font-bold text-rose-700 print:text-black">{currencySymbol}{budget.actual_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary Totals */}
                                    <div className="flex justify-end">
                                        <div className={`p-4 rounded-2xl border ${printTheme === 'monochrome' ? 'border-black' : 'border-rose-100 bg-rose-50/30'} text-right max-w-sm w-full`}>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-rose-800 print:text-black">Total Outstanding Balance</p>
                                            <p className="mt-1 text-2xl font-serif font-bold text-rose-700 print:text-black">
                                                {currencySymbol}{budgetSummary.totalOwed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary italic">All budget items and suppliers are marked as paid! Outstanding balance is zero.</p>
                            )}
                        </section>
                    )}
                </article>
            </div>
        </main>
    );
}

// Section Toggling Pills (Web only)
function SectionToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 border min-h-[32px] ${
                active
                    ? 'bg-primary/10 border-primary/20 text-primary shadow-sm shadow-primary/5'
                    : 'bg-white border-border text-text-secondary hover:bg-neutral'
            }`}
        >
            {active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{label}</span>
        </button>
    );
}

// Section Heading styled consistently
function SectionHeading({ title, printTheme }: { title: string; printTheme: 'classic' | 'monochrome' }) {
    return (
        <div className={`border-b pb-2 mb-4 mt-8 flex items-center justify-between ${printTheme === 'monochrome' ? 'border-black' : 'border-primary/20'}`}>
            <h3 className={`font-serif text-xl font-bold ${printTheme === 'monochrome' ? 'text-black' : 'text-primary'}`}>
                {title}
            </h3>
        </div>
    );
}
