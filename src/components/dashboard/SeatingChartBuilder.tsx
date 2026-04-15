'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Users, 
    Plus, 
    Trash2, 
    Move, 
    Save, 
    Loader2, 
    UserPlus, 
    X,
    Layout,
    Maximize2,
    CheckCircle2
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
    table_shape: 'round' | 'rectangular' | 'square';
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
    const [saving, setSaving] = useState(false);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [weddingId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [guestsRes, tablesRes, assignmentsRes] = await Promise.all([
                supabase.from('rsvps').select('id, guest_name, rsvp_status, num_guests').eq('wedding_id', weddingId).eq('rsvp_status', 'confirmed'),
                supabase.from('seating_tables').select('*').eq('wedding_id', weddingId),
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

    const addTable = async () => {
        const tableName = `Table ${tables.length + 1}`;
        try {
            const { data, error } = await supabase.from('seating_tables').insert({
                wedding_id: weddingId,
                table_name: tableName,
                table_shape: 'round',
                capacity: 8,
                position_x: 50 + (tables.length * 20),
                position_y: 50 + (tables.length * 20)
            }).select().single();

            if (error) throw error;
            if (data) setTables([...tables, data]);
        } catch (err) {
            alert("Failed to add table");
        }
    };

    const deleteTable = async (tableId: string) => {
        if (!confirm("Are you sure? All assignments to this table will be removed.")) return;
        try {
            const { error } = await supabase.from('seating_tables').delete().eq('id', tableId);
            if (error) throw error;
            setTables(tables.filter(t => t.id !== tableId));
            setAssignments(assignments.filter(a => a.table_id !== tableId));
            if (selectedTable === tableId) setSelectedTable(null);
        } catch (err) {
            alert("Failed to delete table");
        }
    };

    const assignGuest = async (guest: Guest, tableId: string) => {
        // Check if guest is already assigned
        if (assignments.find(a => a.rsvp_id === guest.id)) {
            alert("Guest is already assigned to a table");
            return;
        }

        // Check capacity
        const tableAssignments = assignments.filter(a => a.table_id === tableId);
        const table = tables.find(t => t.id === tableId);
        if (table && tableAssignments.length >= table.capacity) {
            alert("Table is at full capacity");
            return;
        }

        try {
            const { data, error } = await supabase.from('seating_assignments').insert({
                wedding_id: weddingId,
                table_id: tableId,
                rsvp_id: guest.id,
                guest_name: guest.guest_name
            }).select().single();

            if (error) throw error;
            if (data) setAssignments([...assignments, data]);
        } catch (err) {
            alert("Failed to assign guest");
        }
    };

    const removeAssignment = async (assignmentId: string) => {
        try {
            const { error } = await supabase.from('seating_assignments').delete().eq('id', assignmentId);
            if (error) throw error;
            setAssignments(assignments.filter(a => a.id !== assignmentId));
        } catch (err) {
            alert("Failed to remove assignment");
        }
    };

    const unassignedGuests = guests.filter(g => !assignments.find(a => a.rsvp_id === g.id));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] soft-shadow border border-border">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary font-serif italic">Loading seating arrangements...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 soft-shadow border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Seating Chart Builder</h2>
                        <p className="text-sm text-text-secondary mt-1">Organize your guests into tables and manage the floor plan.</p>
                    </div>
                    <button 
                        onClick={addTable}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" /> Add New Table
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tables Layout */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-neutral/50 rounded-3xl p-6 border border-dashed border-border min-h-[500px] relative overflow-auto">
                            {tables.length === 0 ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary opacity-50">
                                    <Layout className="w-16 h-16 mb-4" />
                                    <p className="font-serif italic">No tables added yet. Click "Add New Table" to start.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {tables.map(table => {
                                        const tableAssignments = assignments.filter(a => a.table_id === table.id);
                                        const isFull = tableAssignments.length >= table.capacity;
                                        const isSelected = selectedTable === table.id;

                                        return (
                                            <div 
                                                key={table.id}
                                                onClick={() => setSelectedTable(table.id)}
                                                className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${
                                                    isSelected ? 'border-primary bg-white shadow-xl scale-[1.02]' : 'border-border bg-white hover:border-primary/30'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-serif font-bold text-lg">{table.table_name}</h3>
                                                        <p className="text-xs text-text-secondary">
                                                            {tableAssignments.length} / {table.capacity} Seats Filled
                                                        </p>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }}
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        {tableAssignments.map(assign => (
                                                            <div key={assign.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral rounded-full text-xs font-medium group">
                                                                <span className="truncate max-w-[100px]">{assign.guest_name}</span>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); removeAssignment(assign.id); }}
                                                                    className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {Array.from({ length: Math.max(0, table.capacity - tableAssignments.length) }).map((_, i) => (
                                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center text-border">
                                                                <Plus className="w-4 h-4" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary">Selected for auto-assignment</div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Unassigned Guests Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-border overflow-hidden flex flex-col h-full max-h-[700px]">
                            <div className="p-6 border-b border-border bg-neutral/30">
                                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    Unassigned Guests
                                </h3>
                                <p className="text-xs text-text-secondary mt-1">
                                    {unassignedGuests.length} guests waiting for a seat
                                </p>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {unassignedGuests.length === 0 ? (
                                    <div className="text-center py-10">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                                        <p className="text-xs text-text-secondary font-serif italic">All confirmed guests have seats!</p>
                                    </div>
                                ) : (
                                    unassignedGuests.map(guest => (
                                        <div 
                                            key={guest.id}
                                            className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">{guest.guest_name}</p>
                                                <p className="text-[10px] text-text-secondary">Party of {guest.num_guests}</p>
                                            </div>
                                            <button 
                                                disabled={!selectedTable}
                                                onClick={() => selectedTable && assignGuest(guest, selectedTable)}
                                                className={`p-2 rounded-xl transition-all ${
                                                    selectedTable 
                                                        ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white' 
                                                        : 'bg-neutral text-border cursor-not-allowed'
                                                }`}
                                                title={selectedTable ? "Assign to selected table" : "Select a table first"}
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Pro Tip</h4>
                            <p className="text-[11px] text-primary/80 leading-relaxed">
                                Click on a table to select it, then click the <UserPlus className="inline w-3 h-3" /> icon next to a guest to assign them instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
