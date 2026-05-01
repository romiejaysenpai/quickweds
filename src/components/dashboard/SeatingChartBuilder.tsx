'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, Trash2, Loader2, UserPlus, X, Layout,
    CheckCircle2, Search, Circle, Square, RectangleHorizontal, Edit2,
} from 'lucide-react';
import {
    GUEST_GROUP_OPTIONS,
    getGuestGroupLabel,
    type EnhancedRSVP,
    type GuestGroup,
} from '@/lib/guest-list';

interface Table {
    id: string;
    table_name: string;
    table_shape: 'round' | 'square' | 'rectangular';
    capacity: number;
    position_x: number;
    position_y: number;
}

interface Assignment {
    id: string;
    table_id: string;
    rsvp_id: string;
    guest_name: string;
}

export default function SeatingChartBuilder({ weddingId }: { weddingId: string }) {
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState<EnhancedRSVP[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState<'all' | GuestGroup>('all');
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [editingTableId, setEditingTableId] = useState<string | null>(null);
    const [tableFormData, setTableFormData] = useState<{ name: string; shape: 'round' | 'square' | 'rectangular'; capacity: number }>({
        name: '',
        shape: 'round',
        capacity: 8,
    });

    const guestMap = useMemo(() => new Map(guests.map((guest) => [guest.id, guest])), [guests]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [guestsRes, tablesRes, assignmentsRes] = await Promise.all([
                supabase
                    .from('rsvps')
                    .select('id, guest_name, guest_group, guest_email, rsvp_status, attendance, num_guests, table_assignment, plus_one_name, plus_one_allowed')
                    .eq('wedding_id', weddingId)
                    .or('rsvp_status.eq.confirmed,attendance.eq.Yes')
                    .order('created_at', { ascending: true }),
                supabase.from('seating_tables').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: true }),
                supabase.from('seating_assignments').select('*').eq('wedding_id', weddingId),
            ]);

            if (guestsRes.data) setGuests(guestsRes.data as EnhancedRSVP[]);
            if (tablesRes.data) setTables(tablesRes.data);
            if (assignmentsRes.data) setAssignments(assignmentsRes.data);
        } catch (err) {
            console.error('Error loading seating data:', err);
        } finally {
            setLoading(false);
        }
    }, [weddingId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const getSeatsUsed = (tableId: string) =>
        assignments
            .filter((assignment) => assignment.table_id === tableId)
            .reduce((total, assignment) => total + (guestMap.get(assignment.rsvp_id)?.num_guests || 1), 0);

    const syncRsvpTableAssignment = async (rsvpId: string, tableName: string | null) => {
        const { error } = await supabase.from('rsvps').update({ table_assignment: tableName }).eq('id', rsvpId);
        if (error) throw error;
    };

    const openAddTableModal = () => {
        setEditingTableId(null);
        setTableFormData({ name: `Table ${tables.length + 1}`, shape: 'round', capacity: 8 });
        setIsTableModalOpen(true);
    };

    const openEditTableModal = (table: Table) => {
        setEditingTableId(table.id);
        setTableFormData({ name: table.table_name, shape: table.table_shape, capacity: table.capacity });
        setIsTableModalOpen(true);
    };

    const handleSaveTable = async () => {
        if (!tableFormData.name.trim()) return alert('Table name is required');
        if (tableFormData.capacity < 1) return alert('Capacity must be at least 1');

        try {
            if (editingTableId) {
                const existingTable = tables.find((table) => table.id === editingTableId);
                const { data, error } = await supabase
                    .from('seating_tables')
                    .update({
                        table_name: tableFormData.name,
                        table_shape: tableFormData.shape,
                        capacity: tableFormData.capacity,
                    })
                    .eq('id', editingTableId)
                    .select()
                    .single();

                if (error) throw error;

                if (existingTable && existingTable.table_name !== tableFormData.name) {
                    const assignedRsvpIds = assignments
                        .filter((assignment) => assignment.table_id === editingTableId)
                        .map((assignment) => assignment.rsvp_id);

                    if (assignedRsvpIds.length > 0) {
                        const { error: syncError } = await supabase
                            .from('rsvps')
                            .update({ table_assignment: tableFormData.name })
                            .in('id', assignedRsvpIds);
                        if (syncError) throw syncError;
                    }
                }

                setTables((current) => current.map((table) => (table.id === editingTableId ? data : table)));
            } else {
                const { data, error } = await supabase
                    .from('seating_tables')
                    .insert({
                        wedding_id: weddingId,
                        table_name: tableFormData.name,
                        table_shape: tableFormData.shape,
                        capacity: tableFormData.capacity,
                        position_x: 50,
                        position_y: 50,
                    })
                    .select()
                    .single();

                if (error) throw error;
                if (data) setTables((current) => [...current, data]);
            }

            setIsTableModalOpen(false);
            await loadData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown seating save error';
            alert(`Failed to save table: ${message}`);
        }
    };

    const deleteTable = async (tableId: string) => {
        if (!confirm('Are you sure? All assignments to this table will be removed.')) return;

        try {
            const assignedRsvpIds = assignments
                .filter((assignment) => assignment.table_id === tableId)
                .map((assignment) => assignment.rsvp_id);

            if (assignedRsvpIds.length > 0) {
                const { error: clearError } = await supabase.from('rsvps').update({ table_assignment: null }).in('id', assignedRsvpIds);
                if (clearError) throw clearError;

                const { error: deleteAssignmentsError } = await supabase.from('seating_assignments').delete().eq('table_id', tableId);
                if (deleteAssignmentsError) throw deleteAssignmentsError;
            }

            const { error } = await supabase.from('seating_tables').delete().eq('id', tableId);
            if (error) throw error;

            if (selectedTable === tableId) setSelectedTable(null);
            await loadData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown seating delete error';
            alert(`Failed to delete table: ${message}`);
        }
    };

    const assignGuest = async (guest: EnhancedRSVP, tableId: string) => {
        if (assignments.find((assignment) => assignment.rsvp_id === guest.id)) {
            return alert('Guest is already assigned');
        }

        const table = tables.find((item) => item.id === tableId);
        const seatsUsed = getSeatsUsed(tableId);
        if (table && seatsUsed + (guest.num_guests || 1) > table.capacity) {
            return alert('This table does not have enough remaining seats for that party.');
        }

        try {
            const { data, error } = await supabase
                .from('seating_assignments')
                .insert({
                    wedding_id: weddingId,
                    table_id: tableId,
                    rsvp_id: guest.id,
                    guest_name: guest.guest_name,
                })
                .select()
                .single();

            if (error) throw error;

            await syncRsvpTableAssignment(guest.id, table?.table_name || null);
            if (data) setAssignments((current) => [...current, data]);
            await loadData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown seating assignment error';
            alert(`Failed to assign guest: ${message}`);
        }
    };

    const removeAssignment = async (assignment: Assignment) => {
        try {
            const { error } = await supabase.from('seating_assignments').delete().eq('id', assignment.id);
            if (error) throw error;

            await syncRsvpTableAssignment(assignment.rsvp_id, null);
            await loadData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown seat removal error';
            alert(`Failed to remove assignment: ${message}`);
        }
    };

    const unassignedGuests = useMemo(() => {
        return guests
            .filter((guest) => !assignments.find((assignment) => assignment.rsvp_id === guest.id))
            .filter((guest) => {
                const normalizedQuery = searchQuery.toLowerCase();
                const matchesSearch = [
                    guest.guest_name,
                    guest.guest_email,
                    getGuestGroupLabel(guest.guest_group),
                    guest.table_assignment,
                ].some((value) => (value || '').toLowerCase().includes(normalizedQuery));
                const matchesGroup = groupFilter === 'all' ? true : guest.guest_group === groupFilter;
                return matchesSearch && matchesGroup;
            });
    }, [assignments, guests, groupFilter, searchQuery]);

    const seatingSummary = useMemo(() => {
        const totalGuests = guests.reduce((total, guest) => total + (guest.num_guests || 1), 0);
        const seatedGuests = assignments.reduce((total, assignment) => total + (guestMap.get(assignment.rsvp_id)?.num_guests || 1), 0);
        const totalSeats = tables.reduce((total, table) => total + table.capacity, 0);

        return {
            totalGuests,
            seatedGuests,
            unassignedParties: Math.max(0, guests.length - assignments.length),
            totalSeats,
            remainingSeats: totalSeats - seatedGuests,
        };
    }, [assignments, guestMap, guests, tables]);

    const getShapeClasses = (shape: string) => {
        switch (shape) {
            case 'square':
                return 'rounded-2xl aspect-square';
            case 'rectangular':
                return 'rounded-2xl aspect-video';
            case 'round':
            default:
                return 'rounded-[2rem] min-h-[160px]';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] soft-shadow border border-border">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary font-serif italic">Loading seating arrangements...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 relative">
            <div className="bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 soft-shadow border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-10">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Seating Chart Builder</h2>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1">Design your floor plan and keep every table in sync with the guest list.</p>
                    </div>
                    <button onClick={openAddTableModal} className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl sm:rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95 min-h-[44px]">
                        <Plus className="w-5 h-5" /> Add Table
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        ['Seated Guests', `${seatingSummary.seatedGuests}/${seatingSummary.totalGuests}`],
                        ['Unassigned Parties', seatingSummary.unassignedParties],
                        ['Total Tables', tables.length],
                        ['Open Seats', seatingSummary.remainingSeats],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-border bg-neutral/50 p-4 text-center sm:text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">{label}</p>
                            <p className={`mt-2 font-serif text-2xl font-bold ${label === 'Open Seats' && Number(value) < 0 ? 'text-red-500' : 'text-foreground'}`}>{value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-neutral/40 dark:bg-neutral/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 border-2 border-dashed border-border min-h-[400px] sm:min-h-[600px] relative">
                            {tables.length === 0 ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary opacity-50">
                                    <Layout className="w-16 h-16 mb-4" />
                                    <p className="font-serif italic text-lg">No tables defined yet.</p>
                                    <p className="text-sm mt-2">Click &quot;Add Table&quot; to start your floor plan.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <AnimatePresence>
                                        {tables.map((table) => {
                                            const tableAssignments = assignments.filter((assignment) => assignment.table_id === table.id);
                                            const seatsUsed = getSeatsUsed(table.id);
                                            const isSelected = selectedTable === table.id;
                                            const seatsRemaining = table.capacity - seatsUsed;
                                            const isFull = seatsRemaining === 0;
                                            const isOverbooked = seatsRemaining < 0;

                                            return (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    key={table.id}
                                                    onClick={() => setSelectedTable(table.id)}
                                                    className={`relative p-0 transition-all cursor-pointer bg-white dark:bg-white/10 group flex flex-col ${getShapeClasses(table.table_shape)} ${isSelected ? 'shadow-xl ring-2 ring-primary scale-[1.02] border-transparent' : 'border-2 border-border hover:border-primary/40 hover:shadow-md'}`}
                                                >
                                                    <div className="flex justify-between items-start pt-6 px-6 mb-4 z-10 w-full relative">
                                                        <div>
                                                            <h3 className="font-serif font-bold text-lg text-foreground">{table.table_name}</h3>
                                                            <div className="flex items-center gap-2">
                                                                <p className={`text-xs font-bold ${isOverbooked ? 'text-red-500' : isFull ? 'text-amber-600' : 'text-text-secondary'}`}>{seatsUsed} / {table.capacity} Seats</p>
                                                                <span className="text-border px-1">•</span>
                                                                <p className="text-xs text-text-secondary uppercase">{table.table_shape}</p>
                                                            </div>
                                                            <p className={`mt-1 text-[10px] font-black uppercase tracking-wider ${isOverbooked ? 'text-red-500' : isFull ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                                {isOverbooked ? `${Math.abs(seatsRemaining)} over capacity` : isFull ? 'Table full' : `${seatsRemaining} seats open`}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={(event) => { event.stopPropagation(); openEditTableModal(table); }} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={(event) => { event.stopPropagation(); void deleteTable(table.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                                            {tableAssignments.map((assignment) => {
                                                                const guest = guestMap.get(assignment.rsvp_id);
                                                                return (
                                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={assignment.id} className="relative z-10 inline-flex flex-col gap-1 px-3 py-2 bg-neutral dark:bg-neutral/40 rounded-2xl text-xs font-medium border border-border group/seat">
                                                                        <span className="truncate max-w-[120px] font-bold">{assignment.guest_name}</span>
                                                                        <span className="text-[10px] text-text-secondary">Party of {guest?.num_guests || 1} · {getGuestGroupLabel(guest?.guest_group)}</span>
                                                                        <button onClick={(event) => { event.stopPropagation(); void removeAssignment(assignment); }} className="text-text-secondary hover:text-red-500 hover:bg-neutral p-0.5 rounded-full opacity-0 group-hover/seat:opacity-100 transition-all absolute -top-2 -right-2 bg-white shadow-sm border border-border">
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                            {Array.from({ length: Math.max(0, table.capacity - seatsUsed) }).map((_, index) => (
                                                                <div key={`${table.id}-seat-${index}`} className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center text-border/50 bg-neutral/30">
                                                                    <UserPlus className="w-3 h-3" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                                            Active Table
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-white/10 rounded-2xl sm:rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col h-full max-h-[600px] sm:max-h-[700px]">
                            <div className="p-4 sm:p-6 border-b border-border bg-neutral/30 dark:bg-neutral/10">
                                <h3 className="font-serif font-bold text-xl flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-primary" />
                                    Guest List
                                </h3>
                                <div className="relative mb-3">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                                    <input type="text" placeholder="Search guests..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full bg-white border border-border rounded-xl pl-14 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value as 'all' | GuestGroup)} className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors">
                                    <option value="all">All Groups</option>
                                    {GUEST_GROUP_OPTIONS.map((group) => (
                                        <option key={group.value} value={group.value}>{group.label}</option>
                                    ))}
                                </select>
                                <div className="mt-4 flex items-center justify-between text-xs">
                                    <span className="text-text-secondary font-bold uppercase tracking-wider">Unassigned</span>
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{unassignedGuests.length}</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                                {!selectedTable && tables.length > 0 && (
                                    <div className="absolute inset-x-4 top-4 bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center z-10 backdrop-blur-sm">
                                        <p className="text-xs font-bold text-primary">Select a table first to assign guests</p>
                                    </div>
                                )}
                                <AnimatePresence>
                                    {unassignedGuests.length === 0 ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                                            {searchQuery || groupFilter !== 'all' ? <p className="text-sm text-text-secondary italic">No guests match this filter.</p> : <><CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" /><p className="text-sm text-text-secondary font-serif italic">All confirmed guests have seats!</p></>}
                                        </motion.div>
                                    ) : (
                                        unassignedGuests.map((guest) => (
                                            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={guest.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${selectedTable ? 'bg-white border-border hover:border-primary/50 hover:shadow-md' : 'bg-neutral/50 border-transparent opacity-60 grayscale'}`}>
                                                <div className="min-w-0 pr-2">
                                                    <p className="font-bold text-sm truncate text-foreground">{guest.guest_name}</p>
                                                    <p className="text-[11px] text-text-secondary mt-0.5">Party of {guest.num_guests} · {getGuestGroupLabel(guest.guest_group)}</p>
                                                    {guest.plus_one_allowed && <p className="text-[10px] text-secondary/70 mt-1">Plus-one {guest.plus_one_name ? `for ${guest.plus_one_name}` : 'enabled'}</p>}
                                                </div>
                                                <button disabled={!selectedTable} onClick={() => selectedTable && void assignGuest(guest, selectedTable)} className={`p-2.5 rounded-xl transition-all shrink-0 ${selectedTable ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95' : 'bg-neutral text-border cursor-not-allowed'}`} title={selectedTable ? 'Assign to selected table' : 'Select a table first'}>
                                                    <UserPlus className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isTableModalOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setIsTableModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 z-[60] shadow-2xl border border-border">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif font-bold text-xl sm:text-2xl text-foreground">{editingTableId ? 'Edit Table' : 'Customize Table'}</h3>
                                <button onClick={() => setIsTableModalOpen(false)} className="p-2 hover:bg-neutral dark:hover:bg-neutral/10 rounded-full transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Table Name</label>
                                    <input type="text" value={tableFormData.name} onChange={(event) => setTableFormData({ ...tableFormData, name: event.target.value })} className="w-full bg-neutral/50 border border-border rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. VIP Table, Table 1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Table Shape</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[{ id: 'round', label: 'Round', icon: Circle }, { id: 'rectangular', label: 'Rectangle', icon: RectangleHorizontal }, { id: 'square', label: 'Square', icon: Square }].map((shape) => (
                                            <button key={shape.id} onClick={() => setTableFormData({ ...tableFormData, shape: shape.id as 'round' | 'square' | 'rectangular' })} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${tableFormData.shape === shape.id ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30 text-text-secondary hover:bg-neutral'}`}>
                                                <shape.icon className="w-6 h-6 mb-2" strokeWidth={tableFormData.shape === shape.id ? 2.5 : 1.5} />
                                                <span className="text-xs font-bold">{shape.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Number of Seats (Capacity)</label>
                                    <div className="mb-3 grid grid-cols-4 gap-2">
                                        {[6, 8, 10, 12].map((capacity) => (
                                            <button
                                                key={capacity}
                                                type="button"
                                                onClick={() => setTableFormData((current) => ({ ...current, capacity }))}
                                                className={`rounded-xl border px-3 py-2 text-xs font-black transition-all ${tableFormData.capacity === capacity ? 'border-primary bg-primary text-white' : 'border-border bg-neutral text-text-secondary hover:border-primary hover:text-primary'}`}
                                            >
                                                {capacity}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button type="button" onClick={() => setTableFormData((current) => ({ ...current, capacity: Math.max(1, current.capacity - 1) }))} className="w-12 h-12 rounded-xl bg-neutral border border-border flex items-center justify-center text-foreground hover:bg-neutral/80 active:scale-95 transition-all">-</button>
                                        <div className="flex-1 text-center font-serif text-3xl font-bold text-primary">{tableFormData.capacity}</div>
                                        <button type="button" onClick={() => setTableFormData((current) => ({ ...current, capacity: Math.max(1, current.capacity + 1) }))} className="w-12 h-12 rounded-xl bg-neutral border border-border flex items-center justify-center text-foreground hover:bg-neutral/80 active:scale-95 transition-all">+</button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => void handleSaveTable()} className="w-full mt-8 bg-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all active:translate-y-0">
                                {editingTableId ? 'Save Changes' : 'Create Table'}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
