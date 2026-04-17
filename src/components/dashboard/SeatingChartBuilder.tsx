'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Plus, Trash2, Loader2, UserPlus, X, Layout, 
    CheckCircle2, Search, Circle, Square, RectangleHorizontal, Edit2
} from 'lucide-react';

interface Guest {
    id: string;
    guest_name: string;
    rsvp_status: string;
    num_guests: number;
}

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
    const [guests, setGuests] = useState<Guest[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for Add/Edit Table
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [editingTableId, setEditingTableId] = useState<string | null>(null);
    const [tableFormData, setTableFormData] = useState<{name: string, shape: 'round' | 'square' | 'rectangular', capacity: number}>({
        name: '', shape: 'round', capacity: 8
    });

    useEffect(() => {
        loadData();
    }, [weddingId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [guestsRes, tablesRes, assignmentsRes] = await Promise.all([
                supabase.from('rsvps').select('id, guest_name, rsvp_status, num_guests').eq('wedding_id', weddingId).eq('rsvp_status', 'confirmed'),
                supabase.from('seating_tables').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: true }),
                supabase.from('seating_assignments').select('*').eq('wedding_id', weddingId)
            ]);

            if (guestsRes.data) setGuests(guestsRes.data);
            if (tablesRes.data) setTables(tablesRes.data);
            if (assignmentsRes.data) setAssignments(assignmentsRes.data);
        } catch (err) {
            console.error("Error loading seating data:", err);
        } finally {
            setLoading(false);
        }
    };

    const openAddTableModal = () => {
        setEditingTableId(null);
        setTableFormData({ name: `Table ${tables.length + 1}`, shape: 'round', capacity: 8 });
        setIsTableModalOpen(true);
    };

    const openEditTableModal = (table: Table) => {
        setEditingTableId(table.id);
        setTableFormData({ name: table.table_name, shape: table.table_shape as any, capacity: table.capacity });
        setIsTableModalOpen(true);
    };

    const handleSaveTable = async () => {
        if (!tableFormData.name.trim()) return alert("Table name is required");
        if (tableFormData.capacity < 1) return alert("Capacity must be at least 1");

        try {
            if (editingTableId) {
                // Update
                const { data, error } = await supabase.from('seating_tables')
                    .update({
                        table_name: tableFormData.name,
                        table_shape: tableFormData.shape,
                        capacity: tableFormData.capacity
                    })
                    .eq('id', editingTableId)
                    .select().single();
                
                if (error) throw error;
                setTables(tables.map(t => t.id === editingTableId ? data : t));
            } else {
                // Insert
                const { data, error } = await supabase.from('seating_tables').insert({
                    wedding_id: weddingId,
                    table_name: tableFormData.name,
                    table_shape: tableFormData.shape,
                    capacity: tableFormData.capacity,
                    position_x: 50,
                    position_y: 50
                }).select().single();

                if (error) throw error;
                if (data) setTables([...tables, data]);
            }
            setIsTableModalOpen(false);
        } catch (err: any) {
            alert("Failed to save table: " + err.message);
        }
    };

    const deleteTable = async (tableId: string) => {
        if (!confirm("Are you sure? All assignments to this table will be removed.")) return;
        try {
            await supabase.from('seating_tables').delete().eq('id', tableId);
            setTables(tables.filter(t => t.id !== tableId));
            setAssignments(assignments.filter(a => a.table_id !== tableId));
            if (selectedTable === tableId) setSelectedTable(null);
        } catch (err: any) {
            alert("Failed to delete table: " + err.message);
        }
    };

    const assignGuest = async (guest: Guest, tableId: string) => {
        if (assignments.find(a => a.rsvp_id === guest.id)) return alert("Guest is already assigned");
        const tableAssignments = assignments.filter(a => a.table_id === tableId);
        const table = tables.find(t => t.id === tableId);
        if (table && tableAssignments.length >= table.capacity) return alert("Table is at full capacity");

        try {
            const { data, error } = await supabase.from('seating_assignments').insert({
                wedding_id: weddingId,
                table_id: tableId,
                rsvp_id: guest.id,
                guest_name: guest.guest_name
            }).select().single();

            if (error) throw error;
            if (data) setAssignments([...assignments, data]);
        } catch (err: any) {
            alert("Failed to assign guest: " + err.message);
        }
    };

    const removeAssignment = async (assignmentId: string) => {
        try {
            await supabase.from('seating_assignments').delete().eq('id', assignmentId);
            setAssignments(assignments.filter(a => a.id !== assignmentId));
        } catch (err: any) {
            alert("Failed to remove assignment: " + err.message);
        }
    };

    const unassignedGuests = useMemo(() => {
        return guests
            .filter(g => !assignments.find(a => a.rsvp_id === g.id))
            .filter(g => g.guest_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [guests, assignments, searchQuery]);


    // CSS Class helpers for table shapes
    const getShapeClasses = (shape: string) => {
        switch (shape) {
            case 'square': return 'rounded-2xl aspect-square';
            case 'rectangular': return 'rounded-2xl aspect-video';
            case 'round': default: return 'rounded-[2rem] min-h-[160px]';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] soft-shadow border border-border">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary font-serif italic">Loading seating arrangements...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 soft-shadow border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Seating Chart Builder</h2>
                        <p className="text-sm text-text-secondary mt-1">Design your floor plan and manage guest seating effortlessly.</p>
                    </div>
                    <button 
                        onClick={openAddTableModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Customize New Table
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tables Layout */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#fcfaf9] rounded-[2.5rem] p-6 sm:p-8 border-2 border-dashed border-border/60 min-h-[600px] relative">
                            {tables.length === 0 ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary opacity-50">
                                    <Layout className="w-16 h-16 mb-4" />
                                    <p className="font-serif italic text-lg">No tables defined yet.</p>
                                    <p className="text-sm mt-2">Click "Customize New Table" to start your floor plan.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <AnimatePresence>
                                        {tables.map(table => {
                                            const tableAssignments = assignments.filter(a => a.table_id === table.id);
                                            const isSelected = selectedTable === table.id;

                                            return (
                                                <motion.div 
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    key={table.id}
                                                    onClick={() => setSelectedTable(table.id)}
                                                    className={`relative p-6 transition-all cursor-pointer bg-white group flex flex-col ${getShapeClasses(table.table_shape)} ${
                                                        isSelected 
                                                            ? 'shadow-xl ring-2 ring-primary scale-[1.02] border-transparent' 
                                                            : 'border-2 border-border hover:border-primary/40 hover:shadow-md'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-4 z-10 w-full relative bg-white/80 backdrop-blur-sm p-2 rounded-xl -mx-2 -mt-2">
                                                        <div>
                                                            <h3 className="font-serif font-bold text-lg text-foreground">{table.table_name}</h3>
                                                            <div className="flex items-center gap-2">
                                                                <p className={`text-xs font-bold ${tableAssignments.length >= table.capacity ? 'text-red-500' : 'text-text-secondary'}`}>
                                                                    {tableAssignments.length} / {table.capacity} Seats 
                                                                </p>
                                                                <span className="text-border px-1">•</span>
                                                                <p className="text-xs text-text-secondary uppercase">{table.table_shape}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); openEditTableModal(table); }}
                                                                className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                                            {tableAssignments.map(assign => (
                                                                <motion.div 
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    key={assign.id} 
                                                                    className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral rounded-full text-xs font-medium border border-border group/seat"
                                                                >
                                                                    <span className="truncate max-w-[90px]">{assign.guest_name}</span>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); removeAssignment(assign.id); }}
                                                                        className="text-text-secondary hover:text-red-500 hover:bg-red-50 p-0.5 rounded-full opacity-0 group-hover/seat:opacity-100 transition-all absolute -top-2 -right-2 bg-white shadow-sm border border-border"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </motion.div>
                                                            ))}
                                                            {Array.from({ length: Math.max(0, table.capacity - tableAssignments.length) }).map((_, i) => (
                                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center text-border/50 bg-neutral/30">
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

                    {/* Unassigned Guests Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col h-full max-h-[700px]">
                            <div className="p-6 border-b border-border bg-neutral/30">
                                <h3 className="font-serif font-bold text-xl flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-primary" />
                                    Guest List
                                </h3>
                                
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                    <input 
                                        type="text"
                                        placeholder="Search guests..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-between text-xs">
                                    <span className="text-text-secondary font-bold uppercase tracking-wider">Unassigned</span>
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{unassignedGuests.length}</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                                {!selectedTable && tables.length > 0 && (
                                    <div className="absolute inset-x-4 top-4 bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center z-10 backdrop-blur-sm">
                                        <p className="text-xs font-bold text-primary">👈 Select a table first to assign guests</p>
                                    </div>
                                )}
                                
                                <AnimatePresence>
                                    {unassignedGuests.length === 0 ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                                            {searchQuery ? (
                                                <p className="text-sm text-text-secondary italic">No guests match "{searchQuery}"</p>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                                                    <p className="text-sm text-text-secondary font-serif italic">All registered guests have seats!</p>
                                                </>
                                            )}
                                        </motion.div>
                                    ) : (
                                        unassignedGuests.map(guest => (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={guest.id}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                                                    selectedTable ? 'bg-white border-border hover:border-primary/50 hover:shadow-md' : 'bg-neutral/50 border-transparent opacity-60 grayscale'
                                                }`}
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="font-bold text-sm truncate text-foreground">{guest.guest_name}</p>
                                                    <p className="text-[11px] text-text-secondary mt-0.5">Party of {guest.num_guests}</p>
                                                </div>
                                                <button 
                                                    disabled={!selectedTable}
                                                    onClick={() => selectedTable && assignGuest(guest, selectedTable)}
                                                    className={`p-2.5 rounded-xl transition-all shrink-0 ${
                                                        selectedTable 
                                                            ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95' 
                                                            : 'bg-neutral text-border cursor-not-allowed'
                                                    }`}
                                                    title={selectedTable ? "Assign to selected table" : "Select a table first"}
                                                >
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

            {/* Modal for Add/Edit Table */}
            <AnimatePresence>
                {isTableModalOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                            onClick={() => setIsTableModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2.5rem] p-8 z-50 shadow-2xl border border-border"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif font-bold text-2xl">{editingTableId ? 'Edit Table' : 'Customize Table'}</h3>
                                <button onClick={() => setIsTableModalOpen(false)} className="p-2 hover:bg-neutral rounded-full transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Table Name</label>
                                    <input 
                                        type="text" 
                                        value={tableFormData.name}
                                        onChange={(e) => setTableFormData({...tableFormData, name: e.target.value})}
                                        className="w-full bg-neutral/50 border border-border rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="e.g. VIP Table, Table 1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Table Shape</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'round', label: 'Round', icon: Circle },
                                            { id: 'rectangular', label: 'Rectangle', icon: RectangleHorizontal },
                                            { id: 'square', label: 'Square', icon: Square },
                                        ].map(shape => (
                                            <button
                                                key={shape.id}
                                                onClick={() => setTableFormData({...tableFormData, shape: shape.id as any})}
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                                    tableFormData.shape === shape.id 
                                                    ? 'border-primary bg-primary/5 text-primary' 
                                                    : 'border-border hover:border-primary/30 text-text-secondary hover:bg-neutral'
                                                }`}
                                            >
                                                <shape.icon className="w-6 h-6 mb-2" strokeWidth={tableFormData.shape === shape.id ? 2.5 : 1.5} />
                                                <span className="text-xs font-bold">{shape.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Number of Seats (Capacity)</label>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setTableFormData(p => ({...p, capacity: Math.max(1, p.capacity - 1)}))}
                                            className="w-12 h-12 rounded-xl bg-neutral border border-border flex items-center justify-center text-foreground hover:bg-neutral/80 active:scale-95 transition-all"
                                        >-</button>
                                        <div className="flex-1 text-center font-serif text-3xl font-bold text-primary">
                                            {tableFormData.capacity}
                                        </div>
                                        <button 
                                            onClick={() => setTableFormData(p => ({...p, capacity: Math.max(1, p.capacity + 1)}))}
                                            className="w-12 h-12 rounded-xl bg-neutral border border-border flex items-center justify-center text-foreground hover:bg-neutral/80 active:scale-95 transition-all"
                                        >+</button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveTable}
                                className="w-full mt-8 bg-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all active:translate-y-0"
                            >
                                {editingTableId ? 'Save Changes' : 'Create Table'}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
