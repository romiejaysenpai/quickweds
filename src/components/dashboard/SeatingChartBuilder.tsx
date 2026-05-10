'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    CheckCircle2,
    Circle,
    Edit2,
    Layout,
    Loader2,
    Move,
    Plus,
    RectangleHorizontal,
    RotateCcw,
    Search,
    Square,
    Trash2,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
    seat_number?: number | null;
}

type VenueShape = 'rectangle' | 'square' | 'oval';

interface SeatingLayout {
    id?: string;
    wedding_id: string;
    layout_name: string;
    venue_shape: VenueShape;
    venue_width: number;
    venue_height: number;
    grid_enabled: boolean;
}

const DEFAULT_LAYOUT = {
    layout_name: 'Main Reception',
    venue_shape: 'rectangle' as VenueShape,
    venue_width: 100,
    venue_height: 70,
    grid_enabled: true,
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function snapPercent(value: number) {
    return Math.round(value / 5) * 5;
}

function getDefaultTablePosition(index: number) {
    const column = index % 3;
    const row = Math.floor(index / 3);
    return {
        position_x: clamp(18 + column * 32, 8, 92),
        position_y: clamp(18 + row * 24, 10, 90),
    };
}

function getPartySize(guest?: Pick<EnhancedRSVP, 'num_guests' | 'plus_one_allowed' | 'plus_one_name' | 'plus_one_rsvp_status'> | null) {
    const explicitCount = Number(guest?.num_guests || 0);
    if (Number.isFinite(explicitCount) && explicitCount > 1) return Math.floor(explicitCount);

    const plusOneCounts =
        Boolean(guest?.plus_one_allowed && guest?.plus_one_name) &&
        guest?.plus_one_rsvp_status !== 'declined';

    return plusOneCounts ? 2 : 1;
}

export default function SeatingChartBuilder({ weddingId }: { weddingId: string }) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const tablesRef = useRef<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState<EnhancedRSVP[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [layout, setLayout] = useState<SeatingLayout>({ wedding_id: weddingId, ...DEFAULT_LAYOUT });
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [draggingTable, setDraggingTable] = useState<string | null>(null);
    const [positionSaveError, setPositionSaveError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState<'all' | GuestGroup>('all');
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [editingTableId, setEditingTableId] = useState<string | null>(null);
    const [tableFormData, setTableFormData] = useState<{ name: string; shape: 'round' | 'square' | 'rectangular'; capacity: number }>({
        name: '',
        shape: 'round',
        capacity: 8,
    });

    useEffect(() => {
        tablesRef.current = tables;
    }, [tables]);

    const guestMap = useMemo(() => new Map(guests.map((guest) => [guest.id, guest])), [guests]);

    const spreadDefaultPositions = useCallback((loadedTables: Table[]) => {
        return loadedTables.map((table, index) => {
            if (Number(table.position_x) > 0 || Number(table.position_y) > 0) return table;
            return { ...table, ...getDefaultTablePosition(index) };
        });
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [guestsRes, tablesRes, assignmentsRes, layoutRes] = await Promise.all([
                supabase
                    .from('rsvps')
                    .select('id, guest_name, guest_group, guest_email, rsvp_status, attendance, num_guests, table_assignment, plus_one_name, plus_one_allowed')
                    .eq('wedding_id', weddingId)
                    .or('rsvp_status.eq.confirmed,attendance.eq.Yes')
                    .order('created_at', { ascending: true }),
                supabase.from('seating_tables').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: true }),
                supabase.from('seating_assignments').select('*').eq('wedding_id', weddingId),
                supabase.from('seating_layouts').select('*').eq('wedding_id', weddingId).maybeSingle(),
            ]);

            if (guestsRes.error) throw guestsRes.error;
            if (tablesRes.error) throw tablesRes.error;
            if (assignmentsRes.error) throw assignmentsRes.error;

            if (layoutRes.error) {
                console.warn('Seating layout unavailable. Apply the latest supabase-power-features.sql migration.', layoutRes.error.message);
            } else if (layoutRes.data) {
                setLayout({
                    wedding_id: weddingId,
                    layout_name: layoutRes.data.layout_name || DEFAULT_LAYOUT.layout_name,
                    venue_shape: layoutRes.data.venue_shape || DEFAULT_LAYOUT.venue_shape,
                    venue_width: layoutRes.data.venue_width || DEFAULT_LAYOUT.venue_width,
                    venue_height: layoutRes.data.venue_height || DEFAULT_LAYOUT.venue_height,
                    grid_enabled: layoutRes.data.grid_enabled ?? DEFAULT_LAYOUT.grid_enabled,
                    id: layoutRes.data.id,
                });
            }

            setGuests((guestsRes.data || []) as EnhancedRSVP[]);
            setTables(spreadDefaultPositions((tablesRes.data || []) as Table[]));
            setAssignments((assignmentsRes.data || []) as Assignment[]);
        } catch (err) {
            console.error('Error loading seating data:', err);
        } finally {
            setLoading(false);
        }
    }, [spreadDefaultPositions, weddingId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const getSeatsUsed = (tableId: string) =>
        assignments
            .filter((assignment) => assignment.table_id === tableId)
            .reduce((total, assignment) => total + getPartySize(guestMap.get(assignment.rsvp_id)), 0);

    const getNextSeatNumber = (tableId: string) => {
        return assignments
            .filter((assignment) => assignment.table_id === tableId)
            .reduce((nextSeat, assignment) => {
                const guest = guestMap.get(assignment.rsvp_id);
                const startSeat = Number(assignment.seat_number || nextSeat);
                return Math.max(nextSeat, startSeat + getPartySize(guest));
            }, 1);
    };

    const getSeatLabel = (assignment: Assignment) => {
        const startSeat = Number(assignment.seat_number || 1);
        const partySize = getPartySize(guestMap.get(assignment.rsvp_id));
        if (partySize <= 1) return `Seat ${startSeat}`;
        return `Seats ${startSeat}-${startSeat + partySize - 1}`;
    };

    const syncRsvpTableAssignment = async (rsvpId: string, tableName: string | null) => {
        const { error } = await supabase.from('rsvps').update({ table_assignment: tableName }).eq('id', rsvpId);
        if (error) throw error;
    };

    const saveLayout = async (nextLayout: SeatingLayout) => {
        const { error } = await supabase
            .from('seating_layouts')
            .upsert(
                {
                    wedding_id: weddingId,
                    layout_name: nextLayout.layout_name,
                    venue_shape: nextLayout.venue_shape,
                    venue_width: nextLayout.venue_width,
                    venue_height: nextLayout.venue_height,
                    grid_enabled: nextLayout.grid_enabled,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'wedding_id' }
            );

        if (error) {
            console.warn('Unable to save seating layout. Apply the latest supabase-power-features.sql migration.', error.message);
        }
    };

    const updateLayout = (patch: Partial<SeatingLayout>) => {
        const nextLayout = {
            ...layout,
            ...patch,
            venue_width: clamp(Number(patch.venue_width ?? layout.venue_width), 30, 240),
            venue_height: clamp(Number(patch.venue_height ?? layout.venue_height), 30, 240),
        };

        if (nextLayout.venue_shape === 'square') {
            nextLayout.venue_height = nextLayout.venue_width;
        }

        setLayout(nextLayout);
        void saveLayout(nextLayout);
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
                const currentSeatsUsed = getSeatsUsed(editingTableId);
                if (tableFormData.capacity < currentSeatsUsed) {
                    return alert(`This table already has ${currentSeatsUsed} assigned seats. Remove guests before reducing capacity below that number.`);
                }

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
                const nextPosition = getDefaultTablePosition(tables.length);
                const { data, error } = await supabase
                    .from('seating_tables')
                    .insert({
                        wedding_id: weddingId,
                        table_name: tableFormData.name,
                        table_shape: tableFormData.shape,
                        capacity: tableFormData.capacity,
                        position_x: nextPosition.position_x,
                        position_y: nextPosition.position_y,
                    })
                    .select()
                    .single();

                if (error) throw error;
                if (data) {
                    setTables((current) => [...current, data]);
                    setSelectedTable(data.id);
                }
            }

            setIsTableModalOpen(false);
            await loadData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown seating save error';
            alert(`Failed to save table: ${message}`);
        }
    };

    const updateTablePosition = useCallback(async (tableId: string, position_x: number, position_y: number) => {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) {
                setPositionSaveError('Sign in again to save table positions.');
                return;
            }

            const response = await fetch('/api/planner/seating-table-position', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tableId,
                    positionX: position_x,
                    positionY: position_y,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setPositionSaveError(data.error || 'Unable to save table position.');
                return;
            }

            setPositionSaveError('');
        } catch {
            setPositionSaveError('Unable to save table position.');
        }
    }, []);

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
        if (!table) {
            return alert('Select a valid table before assigning guests.');
        }

        const partySize = getPartySize(guest);
        const seatsUsed = getSeatsUsed(tableId);
        const seatsRemaining = table.capacity - seatsUsed;
        if (partySize > seatsRemaining) {
            return alert(`This table only has ${seatsRemaining} open seat${seatsRemaining === 1 ? '' : 's'}, but this party needs ${partySize}.`);
        }

        try {
            const nextSeatNumber = getNextSeatNumber(tableId);
            const { data, error } = await supabase
                .from('seating_assignments')
                .insert({
                    wedding_id: weddingId,
                    table_id: tableId,
                    rsvp_id: guest.id,
                    guest_name: guest.guest_name,
                    guest_email: guest.guest_email || null,
                    seat_number: nextSeatNumber,
                })
                .select()
                .single();

            if (error) throw error;

            await syncRsvpTableAssignment(guest.id, table.table_name);
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

    const getPointerPosition = useCallback((clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        let position_x = ((clientX - rect.left) / rect.width) * 100;
        let position_y = ((clientY - rect.top) / rect.height) * 100;

        if (layout.grid_enabled) {
            position_x = snapPercent(position_x);
            position_y = snapPercent(position_y);
        }

        return {
            position_x: clamp(position_x, 5, 95),
            position_y: clamp(position_y, 7, 93),
        };
    }, [layout.grid_enabled]);

    useEffect(() => {
        if (!draggingTable) return;

        const moveTable = (event: PointerEvent) => {
            const position = getPointerPosition(event.clientX, event.clientY);
            if (!position) return;
            setTables((current) => current.map((table) => (
                table.id === draggingTable ? { ...table, ...position } : table
            )));
        };

        const stopDragging = () => {
            const draggedTable = tablesRef.current.find((table) => table.id === draggingTable);
            setDraggingTable(null);

            if (draggedTable) {
                void updateTablePosition(draggedTable.id, draggedTable.position_x, draggedTable.position_y);
            }
        };

        window.addEventListener('pointermove', moveTable);
        window.addEventListener('pointerup', stopDragging, { once: true });

        return () => {
            window.removeEventListener('pointermove', moveTable);
            window.removeEventListener('pointerup', stopDragging);
        };
    }, [draggingTable, getPointerPosition, updateTablePosition]);

    const startTableDrag = (event: ReactPointerEvent, table: Table) => {
        event.preventDefault();
        setSelectedTable(table.id);
        setDraggingTable(table.id);
    };

    const nudgeSelectedTable = (deltaX: number, deltaY: number) => {
        if (!selectedTable) return;

        let nextPosition: Pick<Table, 'position_x' | 'position_y'> | null = null;
        setTables((current) => current.map((table) => {
            if (table.id !== selectedTable) return table;
            nextPosition = {
                position_x: clamp(table.position_x + deltaX, 5, 95),
                position_y: clamp(table.position_y + deltaY, 7, 93),
            };
            return { ...table, ...nextPosition };
        }));

        if (nextPosition) {
            const { position_x, position_y } = nextPosition;
            void updateTablePosition(selectedTable, position_x, position_y);
        }
    };

    const resetTablePositions = () => {
        const resetTables = tables.map((table, index) => ({ ...table, ...getDefaultTablePosition(index) }));
        setTables(resetTables);
        void Promise.all(resetTables.map((table) => updateTablePosition(table.id, table.position_x, table.position_y)));
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
        const totalGuests = guests.reduce((total, guest) => total + getPartySize(guest), 0);
        const seatedGuests = assignments.reduce((total, assignment) => total + getPartySize(guestMap.get(assignment.rsvp_id)), 0);
        const totalSeats = tables.reduce((total, table) => total + table.capacity, 0);

        return {
            totalGuests,
            seatedGuests,
            unassignedParties: Math.max(0, guests.length - assignments.length),
            totalSeats,
            remainingSeats: totalSeats - seatedGuests,
        };
    }, [assignments, guestMap, guests, tables]);

    const selectedTableData = tables.find((table) => table.id === selectedTable) || null;
    const selectedTableAssignments = selectedTableData
        ? assignments
            .filter((assignment) => assignment.table_id === selectedTableData.id)
            .sort((a, b) => Number(a.seat_number || 0) - Number(b.seat_number || 0))
        : [];

    const getCanvasShapeClass = () => {
        if (layout.venue_shape === 'oval') return 'rounded-[50%]';
        if (layout.venue_shape === 'square') return 'rounded-[2rem]';
        return 'rounded-[2rem]';
    };

    const getTableShapeClass = (shape: Table['table_shape']) => {
        if (shape === 'square') return 'h-28 w-28 rounded-2xl';
        if (shape === 'rectangular') return 'h-24 w-36 rounded-2xl';
        return 'h-28 w-28 rounded-full';
    };

    const canvasAspectRatio = layout.venue_shape === 'square'
        ? '1 / 1'
        : `${layout.venue_width} / ${layout.venue_height}`;

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
                        <p className="text-xs sm:text-sm text-text-secondary mt-1">Design your venue layout, drag tables into place, and assign confirmed guests.</p>
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

                <div className="mb-6 rounded-2xl border border-border bg-neutral/40 p-4">
                    <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto_auto]">
                        <label className="space-y-1">
                            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Layout Name</span>
                            <input value={layout.layout_name} onChange={(event) => updateLayout({ layout_name: event.target.value })} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-primary" />
                        </label>
                        <label className="space-y-1">
                            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Venue Shape</span>
                            <select value={layout.venue_shape} onChange={(event) => updateLayout({ venue_shape: event.target.value as VenueShape })} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-primary">
                                <option value="rectangle">Rectangle</option>
                                <option value="square">Square</option>
                                <option value="oval">Oval</option>
                            </select>
                        </label>
                        <label className="space-y-1">
                            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Width</span>
                            <input type="number" min={30} max={240} value={layout.venue_width} onChange={(event) => updateLayout({ venue_width: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-primary" />
                        </label>
                        <label className="space-y-1">
                            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Height</span>
                            <input type="number" min={30} max={240} value={layout.venue_height} disabled={layout.venue_shape === 'square'} onChange={(event) => updateLayout({ venue_height: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-primary disabled:opacity-50" />
                        </label>
                        <button type="button" onClick={() => updateLayout({ grid_enabled: !layout.grid_enabled })} className={`inline-flex min-h-[44px] items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition ${layout.grid_enabled ? 'border-primary bg-primary text-white' : 'border-border bg-white text-text-secondary hover:text-primary'}`}>
                            {layout.grid_enabled ? 'Grid On' : 'Grid Off'}
                        </button>
                        <button type="button" onClick={resetTablePositions} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                            <RotateCcw className="h-4 w-4" /> Reset
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="rounded-2xl border border-border bg-white p-3 shadow-inner">
                            {positionSaveError && (
                                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                                    {positionSaveError}
                                </div>
                            )}
                            <div
                                ref={canvasRef}
                                className={`relative mx-auto min-h-[420px] w-full max-w-5xl overflow-hidden border-2 border-dashed border-primary/25 bg-[#fffaf7] shadow-inner ${getCanvasShapeClass()}`}
                                style={{
                                    aspectRatio: canvasAspectRatio,
                                    backgroundImage: layout.grid_enabled
                                        ? 'linear-gradient(to right, rgba(209,108,120,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(209,108,120,0.08) 1px, transparent 1px)'
                                        : undefined,
                                    backgroundSize: layout.grid_enabled ? '5% 5%' : undefined,
                                }}
                            >
                                <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary shadow-sm">
                                    {layout.layout_name} - {layout.venue_width} x {layout.venue_height}
                                </div>

                                {tables.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary opacity-50">
                                        <Layout className="w-16 h-16 mb-4" />
                                        <p className="font-serif italic text-lg">No tables defined yet.</p>
                                        <p className="text-sm mt-2">Click &quot;Add Table&quot; to start your floor plan.</p>
                                    </div>
                                ) : (
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
                                                    key={table.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    onPointerDown={(event) => startTableDrag(event, table)}
                                                    className={`group absolute flex -translate-x-1/2 -translate-y-1/2 touch-none select-none flex-col items-center justify-center border-2 bg-white/95 p-3 text-center shadow-lg transition hover:shadow-xl ${getTableShapeClass(table.table_shape)} ${isSelected ? 'z-20 border-primary ring-4 ring-primary/10' : 'z-10 border-border hover:border-primary/40'} ${draggingTable === table.id ? 'cursor-grabbing scale-105' : 'cursor-grab'}`}
                                                    style={{ left: `${table.position_x}%`, top: `${table.position_y}%` }}
                                                >
                                                    <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-1 text-primary shadow-sm">
                                                        <Move className="h-3 w-3" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Drag</span>
                                                    </div>
                                                    <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                                                        <button onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); openEditTableModal(table); }} className="rounded-full border border-border bg-white p-1.5 text-primary shadow-sm transition hover:bg-primary hover:text-white">
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); void deleteTable(table.id); }} className="rounded-full border border-border bg-white p-1.5 text-red-500 shadow-sm transition hover:bg-red-50">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                    <h3 className="max-w-full truncate text-sm font-black text-foreground">{table.table_name}</h3>
                                                    <p className={`mt-1 text-[10px] font-bold ${isOverbooked ? 'text-red-500' : isFull ? 'text-amber-600' : 'text-text-secondary'}`}>{seatsUsed}/{table.capacity} seats</p>
                                                    <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-primary/70">{table.table_shape}</p>
                                                    {tableAssignments.length > 0 && (
                                                        <p className="mt-2 max-w-[96px] truncate text-[9px] text-text-secondary">
                                                            {tableAssignments.slice(0, 2).map((assignment) => assignment.guest_name).join(', ')}
                                                            {tableAssignments.length > 2 ? ` +${tableAssignments.length - 2}` : ''}
                                                        </p>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>

                        {selectedTableData && (
                            <div className="rounded-2xl border border-border bg-neutral/40 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Selected Table</p>
                                        <h3 className="font-serif text-xl font-bold text-foreground">{selectedTableData.table_name}</h3>
                                    </div>
                                    <div className="grid w-full max-w-[180px] grid-cols-3 grid-rows-3 gap-1.5 self-start sm:self-center" aria-label="Move selected table">
                                        <button type="button" onClick={() => nudgeSelectedTable(0, -5)} className="col-start-2 row-start-1 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary/30 hover:text-primary" aria-label="Move table up">
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => nudgeSelectedTable(-5, 0)} className="col-start-1 row-start-2 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary/30 hover:text-primary" aria-label="Move table left">
                                            <ArrowLeft className="h-4 w-4" />
                                        </button>
                                        <div className="col-start-2 row-start-2 flex h-10 items-center justify-center rounded-xl border border-dashed border-primary/20 bg-white/60 text-[9px] font-black uppercase tracking-widest text-primary">
                                            Move
                                        </div>
                                        <button type="button" onClick={() => nudgeSelectedTable(5, 0)} className="col-start-3 row-start-2 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary/30 hover:text-primary" aria-label="Move table right">
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => nudgeSelectedTable(0, 5)} className="col-start-2 row-start-3 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary/30 hover:text-primary" aria-label="Move table down">
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-white/10 rounded-2xl sm:rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col h-full max-h-[700px]">
                            <div className="p-4 sm:p-6 border-b border-border bg-neutral/30 dark:bg-neutral/10">
                                <h3 className="font-serif font-bold text-xl flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-primary" />
                                    Guest Assignment
                                </h3>
                                {selectedTableData ? (
                                    <div className="mb-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                                        <p className="font-bold text-foreground">{selectedTableData.table_name}</p>
                                        <p className="mt-1 text-xs text-text-secondary">{getSeatsUsed(selectedTableData.id)} of {selectedTableData.capacity} seats used</p>
                                        <div className="mt-3 space-y-2">
                                            {selectedTableAssignments.length === 0 ? (
                                                <p className="text-xs italic text-text-secondary">No guests assigned yet.</p>
                                            ) : selectedTableAssignments.map((assignment) => {
                                                const guest = guestMap.get(assignment.rsvp_id);
                                                return (
                                                    <div key={assignment.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-xs">
                                                        <span className="min-w-0">
                                                            <span className="block truncate font-bold text-foreground">{assignment.guest_name}</span>
                                                            <span className="block text-[10px] font-semibold text-text-secondary">{getSeatLabel(assignment)} - party of {getPartySize(guest)}</span>
                                                        </span>
                                                        <button type="button" onClick={() => void removeAssignment(assignment)} className="text-red-500 hover:underline">Remove</button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-center">
                                        <p className="text-xs font-bold text-primary">Select a table on the canvas to assign guests.</p>
                                    </div>
                                )}
                                <div className="relative mb-3">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                                    <input type="text" placeholder="Search guests..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="icon-field-left w-full bg-white border border-border rounded-xl pl-14 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
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
                                                    <p className="text-[11px] text-text-secondary mt-0.5">Party of {getPartySize(guest)} - {getGuestGroupLabel(guest.guest_group)}</p>
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
                                            <button key={shape.id} type="button" onClick={() => setTableFormData({ ...tableFormData, shape: shape.id as 'round' | 'square' | 'rectangular' })} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${tableFormData.shape === shape.id ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30 text-text-secondary hover:bg-neutral'}`}>
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
