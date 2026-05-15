'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    BookOpen,
    Camera,
    CheckCircle2,
    Circle,
    Copy,
    Download,
    Edit2,
    ExternalLink,
    Layout,
    Loader2,
    Mail,
    Maximize2,
    Minimize2,
    Move,
    Plus,
    QrCode,
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
import UpgradeButton from '@/components/UpgradeButton';
import { FREE_PLAN_LIMITS } from '@/lib/planner-limits';

interface Table {
    id: string;
    table_name: string;
    table_shape: 'round' | 'square' | 'rectangular';
    capacity: number;
    position_x: number;
    position_y: number;
    custom_style?: {
        width?: number;
        height?: number;
        rotation?: number;
    } | null;
}

interface Assignment {
    id: string;
    table_id: string;
    rsvp_id: string;
    guest_name: string;
    seat_number?: number | null;
}

type VenueShape = 'rectangle' | 'square' | 'oval';
type VenueObjectType = 'dance_floor' | 'stage' | 'bar' | 'buffet' | 'dj' | 'photo_booth' | 'gift_table' | 'entrance' | 'custom';

interface VenueObject {
    id: string;
    type: VenueObjectType;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

interface SeatingLayoutData {
    showMeasurements?: boolean;
    objects?: VenueObject[];
}

interface SeatingLayout {
    id?: string;
    wedding_id: string;
    layout_name: string;
    venue_shape: VenueShape;
    venue_width: number;
    venue_height: number;
    grid_enabled: boolean;
    layout_data?: SeatingLayoutData;
}

const DEFAULT_LAYOUT = {
    layout_name: 'Main Reception',
    venue_shape: 'rectangle' as VenueShape,
    venue_width: 100,
    venue_height: 70,
    grid_enabled: true,
    layout_data: {
        showMeasurements: true,
        objects: [
            { id: 'dance-floor-default', type: 'dance_floor' as VenueObjectType, label: 'Dance Floor', x: 50, y: 52, width: 28, height: 22, rotation: 0 },
            { id: 'entrance-default', type: 'entrance' as VenueObjectType, label: 'Entrance', x: 50, y: 96, width: 12, height: 8, rotation: 0 },
        ],
    },
};

const VENUE_OBJECT_PRESETS: Record<VenueObjectType, { label: string; width: number; height: number }> = {
    dance_floor: { label: 'Dance Floor', width: 28, height: 22 },
    stage: { label: 'Stage', width: 20, height: 10 },
    bar: { label: 'Bar', width: 16, height: 8 },
    buffet: { label: 'Buffet', width: 18, height: 8 },
    dj: { label: 'DJ Booth', width: 12, height: 8 },
    photo_booth: { label: 'Photo Booth', width: 12, height: 12 },
    gift_table: { label: 'Gift Table', width: 14, height: 8 },
    entrance: { label: 'Entrance', width: 12, height: 8 },
    custom: { label: 'Custom Block', width: 14, height: 10 },
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

function getTableSize(table: Table) {
    const fallback = table.table_shape === 'rectangular'
        ? { width: 15, height: 9 }
        : table.table_shape === 'square'
            ? { width: 11, height: 11 }
            : { width: 12, height: 12 };

    return {
        width: clamp(Number(table.custom_style?.width || fallback.width), 7, 28),
        height: clamp(Number(table.custom_style?.height || fallback.height), 6, 24),
        rotation: Number(table.custom_style?.rotation || 0),
    };
}

function getChairPositions(table: Table) {
    const { width, height } = getTableSize(table);
    const capacity = Math.max(1, Number(table.capacity || 1));
    const chairs: { x: number; y: number; rotation: number }[] = [];

    if (table.table_shape === 'round') {
        const radiusX = width / 2 + 1.8;
        const radiusY = height / 2 + 1.8;
        for (let index = 0; index < capacity; index += 1) {
            const angle = (Math.PI * 2 * index) / capacity - Math.PI / 2;
            chairs.push({
                x: Math.cos(angle) * radiusX,
                y: Math.sin(angle) * radiusY,
                rotation: (angle * 180) / Math.PI + 90,
            });
        }
        return chairs;
    }

    const topCount = Math.ceil(capacity / 2);
    const bottomCount = capacity - topCount;
    for (let index = 0; index < topCount; index += 1) {
        const x = ((index + 1) / (topCount + 1) - 0.5) * width;
        chairs.push({ x, y: -height / 2 - 1.6, rotation: 0 });
    }
    for (let index = 0; index < bottomCount; index += 1) {
        const x = ((index + 1) / (bottomCount + 1) - 0.5) * width;
        chairs.push({ x, y: height / 2 + 1.6, rotation: 180 });
    }

    return chairs;
}

function getPartySize(guest?: Pick<EnhancedRSVP, 'num_guests' | 'plus_one_allowed' | 'plus_one_name' | 'plus_one_rsvp_status'> | null) {
    const explicitCount = Number(guest?.num_guests || 0);
    if (Number.isFinite(explicitCount) && explicitCount > 1) return Math.floor(explicitCount);

    const plusOneCounts =
        Boolean(guest?.plus_one_allowed && guest?.plus_one_name) &&
        guest?.plus_one_rsvp_status !== 'declined';

    return plusOneCounts ? 2 : 1;
}

function drawRoundedRectPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    const safeRadius = Math.min(radius, width / 2, height / 2);

    if (typeof context.roundRect === 'function') {
        context.roundRect(x, y, width, height, safeRadius);
        return;
    }

    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    context.lineTo(x + width, y + height - safeRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    context.lineTo(x + safeRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    context.lineTo(x, y + safeRadius);
    context.quadraticCurveTo(x, y, x + safeRadius, y);
}

export default function SeatingChartBuilder({
    weddingId,
    hasPlannerPro = true,
    initialPublicSeatFinderToken = '',
    initialSeatFinderEnabled = false,
}: {
    weddingId: string;
    hasPlannerPro?: boolean;
    initialPublicSeatFinderToken?: string | null;
    initialSeatFinderEnabled?: boolean;
}) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const chartShellRef = useRef<HTMLDivElement>(null);
    const tablesRef = useRef<Table[]>([]);
    const objectsRef = useRef<VenueObject[]>([]);
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState<EnhancedRSVP[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [layout, setLayout] = useState<SeatingLayout>({ wedding_id: weddingId, ...DEFAULT_LAYOUT });
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [draggingTable, setDraggingTable] = useState<string | null>(null);
    const [draggingObject, setDraggingObject] = useState<string | null>(null);
    const [positionSaveError, setPositionSaveError] = useState('');
    const [seatFinderLoading, setSeatFinderLoading] = useState<'generate' | 'send' | 'resend' | null>(null);
    const [seatFinderStatus, setSeatFinderStatus] = useState('');
    const [chartStatus, setChartStatus] = useState('');
    const [isChartFullscreen, setIsChartFullscreen] = useState(false);
    const [publicSeatFinderUrl, setPublicSeatFinderUrl] = useState('');
    const [publicSeatFinderToken, setPublicSeatFinderToken] = useState(initialSeatFinderEnabled ? (initialPublicSeatFinderToken || '') : '');
    const [qrPreviewUrl, setQrPreviewUrl] = useState('');
    const [seatFinderSummary, setSeatFinderSummary] = useState<{
        attendingCount?: number;
        assignedCount?: number;
        sentCount?: number;
        checkedInCount?: number;
    }>({});
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

    useEffect(() => {
        objectsRef.current = layout.layout_data?.objects || [];
    }, [layout.layout_data?.objects]);

    const guestMap = useMemo(() => new Map(guests.map((guest) => [guest.id, guest])), [guests]);
    const assignmentsByTable = useMemo(() => {
        const grouped = new Map<string, Assignment[]>();
        assignments.forEach((assignment) => {
            const current = grouped.get(assignment.table_id) || [];
            current.push(assignment);
            grouped.set(assignment.table_id, current);
        });
        return grouped;
    }, [assignments]);
    const assignedGuestIds = useMemo(() => new Set(assignments.map((assignment) => assignment.rsvp_id)), [assignments]);
    const seatsUsedByTable = useMemo(() => {
        const counts = new Map<string, number>();
        assignmentsByTable.forEach((tableAssignments, tableId) => {
            counts.set(
                tableId,
                tableAssignments.reduce((total, assignment) => total + getPartySize(guestMap.get(assignment.rsvp_id)), 0)
            );
        });
        return counts;
    }, [assignmentsByTable, guestMap]);

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
                console.warn(
                    'Seating layout unavailable. Run supabase-power-features.sql migration in Supabase SQL Editor or via npm run migrate:power-features.',
                    layoutRes.error.message
                );
                setLayout({ wedding_id: weddingId, ...DEFAULT_LAYOUT });
            } else if (layoutRes.data) {
                const loadedLayoutData = (layoutRes.data.layout_data || {}) as SeatingLayoutData;
                setLayout({
                    wedding_id: weddingId,
                    layout_name: layoutRes.data.layout_name || DEFAULT_LAYOUT.layout_name,
                    venue_shape: layoutRes.data.venue_shape || DEFAULT_LAYOUT.venue_shape,
                    venue_width: layoutRes.data.venue_width || DEFAULT_LAYOUT.venue_width,
                    venue_height: layoutRes.data.venue_height || DEFAULT_LAYOUT.venue_height,
                    grid_enabled: layoutRes.data.grid_enabled ?? DEFAULT_LAYOUT.grid_enabled,
                    layout_data: {
                        ...DEFAULT_LAYOUT.layout_data,
                        ...loadedLayoutData,
                        objects: Array.isArray(loadedLayoutData.objects) ? loadedLayoutData.objects : DEFAULT_LAYOUT.layout_data.objects,
                    },
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

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsChartFullscreen(false);
            } else if (document.fullscreenElement === chartShellRef.current) {
                setIsChartFullscreen(true);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        if (!isChartFullscreen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setIsChartFullscreen(false);
            if (document.fullscreenElement === chartShellRef.current) {
                void document.exitFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isChartFullscreen]);

    const getSeatsUsed = useCallback((tableId: string) => seatsUsedByTable.get(tableId) || 0, [seatsUsedByTable]);

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
        const payload = {
            wedding_id: weddingId,
            layout_name: nextLayout.layout_name,
            venue_shape: nextLayout.venue_shape,
            venue_width: nextLayout.venue_width,
            venue_height: nextLayout.venue_height,
            grid_enabled: nextLayout.grid_enabled,
            layout_data: nextLayout.layout_data || {},
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('seating_layouts')
            .upsert(payload, { onConflict: 'wedding_id' });

        if (error) {
            const message = String(error.message || '').toLowerCase();
            const missingLayoutData = message.includes('layout_data') || message.includes('schema cache') || message.includes('column');
            if (missingLayoutData) {
                const fallbackPayload = {
                    wedding_id: payload.wedding_id,
                    layout_name: payload.layout_name,
                    venue_shape: payload.venue_shape,
                    venue_width: payload.venue_width,
                    venue_height: payload.venue_height,
                    grid_enabled: payload.grid_enabled,
                    updated_at: payload.updated_at,
                };
                const fallback = await supabase
                    .from('seating_layouts')
                    .upsert(fallbackPayload, { onConflict: 'wedding_id' });
                if (!fallback.error) {
                    console.warn('Seating floor-plan objects require the latest supabase-power-features.sql layout_data migration.');
                    return;
                }
            }
            console.warn(
                'Unable to save seating layout. Run supabase-power-features.sql migration in Supabase SQL Editor or via npm run migrate:power-features.',
                error.message
            );
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

    const updateLayoutData = (patch: Partial<SeatingLayoutData>) => {
        const nextLayout = {
            ...layout,
            layout_data: {
                ...(layout.layout_data || {}),
                ...patch,
            },
        };
        setLayout(nextLayout);
        void saveLayout(nextLayout);
    };

    const addVenueObject = (type: VenueObjectType) => {
        const preset = VENUE_OBJECT_PRESETS[type];
        const currentObjects = layout.layout_data?.objects || [];
        const newObject: VenueObject = {
            id: `${type}-${Date.now()}`,
            type,
            label: preset.label,
            x: clamp(18 + (currentObjects.length % 4) * 18, 8, 92),
            y: clamp(18 + Math.floor(currentObjects.length / 4) * 16, 8, 92),
            width: preset.width,
            height: preset.height,
            rotation: 0,
        };
        updateLayoutData({ objects: [...currentObjects, newObject] });
        setSelectedTable(null);
        setSelectedObject(newObject.id);
    };

    const updateVenueObject = (objectId: string, patch: Partial<VenueObject>) => {
        const currentObjects = layout.layout_data?.objects || [];
        const nextObjects = currentObjects.map((object) => (
            object.id === objectId
                ? {
                    ...object,
                    ...patch,
                    x: clamp(Number(patch.x ?? object.x), 4, 96),
                    y: clamp(Number(patch.y ?? object.y), 4, 96),
                    width: clamp(Number(patch.width ?? object.width), 5, 50),
                    height: clamp(Number(patch.height ?? object.height), 4, 40),
                    rotation: Number(patch.rotation ?? object.rotation),
                }
                : object
        ));
        updateLayoutData({ objects: nextObjects });
    };

    const deleteVenueObject = (objectId: string) => {
        updateLayoutData({ objects: (layout.layout_data?.objects || []).filter((object) => object.id !== objectId) });
        if (selectedObject === objectId) setSelectedObject(null);
    };

    const openAddTableModal = () => {
        if (!hasPlannerPro && tables.length >= FREE_PLAN_LIMITS.seatingTables) {
            alert(`Free seating includes ${FREE_PLAN_LIMITS.seatingTables} tables. Upgrade to Planner Pro for the full seating chart, guest check-in, and seat-link sending.`);
            return;
        }
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
            const guidance = /permission denied|rls|row level security|could not find|blocked by database permissions/i.test(message)
                ? ' Please run the seating RLS migration SQL in Supabase or verify the seating table policies.'
                : '';
            alert(`Failed to save table: ${message}.${guidance}`);
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

    const updateTableStyle = async (tableId: string, patch: NonNullable<Table['custom_style']>) => {
        const existing = tables.find((table) => table.id === tableId);
        if (!existing) return;
        const currentStyle = getTableSize(existing);
        const nextStyle = {
            ...currentStyle,
            ...patch,
            width: clamp(Number(patch.width ?? currentStyle.width), 7, 28),
            height: clamp(Number(patch.height ?? currentStyle.height), 6, 24),
            rotation: Number(patch.rotation ?? currentStyle.rotation),
        };

        setTables((current) => current.map((table) => (
            table.id === tableId ? { ...table, custom_style: nextStyle } : table
        )));

        const { error } = await supabase
            .from('seating_tables')
            .update({ custom_style: nextStyle, updated_at: new Date().toISOString() })
            .eq('id', tableId);

        if (error) {
            setPositionSaveError('Unable to save table style. Apply the latest seating migration.');
        } else {
            setPositionSaveError('');
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
        if (assignedGuestIds.has(guest.id)) {
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

    const callSeatFinderApi = async (path: string, body: Record<string, unknown>) => {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error('Please sign in again before using QR Seat Finder.');

        const response = await fetch(path, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'QR Seat Finder request failed.');
        return data;
    };

    const getClientSeatFinderUrl = useCallback((token?: string | null, fallbackUrl?: string | null) => {
        let resolvedToken = token || '';
        if (!resolvedToken && fallbackUrl) {
            try {
                resolvedToken = new URL(fallbackUrl).searchParams.get('token') || '';
            } catch {
                resolvedToken = '';
            }
        }

        if (!resolvedToken) return fallbackUrl || '';
        const path = `/w/${encodeURIComponent(weddingId)}/seat-finder?token=${encodeURIComponent(resolvedToken)}`;
        if (typeof window === 'undefined') return path;
        return `${window.location.origin}${path}`;
    }, [weddingId]);

    useEffect(() => {
        if (!initialSeatFinderEnabled || !initialPublicSeatFinderToken) return;
        setPublicSeatFinderToken(initialPublicSeatFinderToken);
        setPublicSeatFinderUrl(getClientSeatFinderUrl(initialPublicSeatFinderToken));
    }, [getClientSeatFinderUrl, initialPublicSeatFinderToken, initialSeatFinderEnabled]);

    const generateSeatLinks = async () => {
        if (!hasPlannerPro) {
            alert('Guest seat links and check-in are part of Planner Pro.');
            return;
        }
        setSeatFinderLoading('generate');
        setSeatFinderStatus('');
        try {
            const data = await callSeatFinderApi('/api/seating/generate-seat-links', { weddingId });
            const token = data.publicSeatFinderToken || '';
            setPublicSeatFinderToken(token);
            setPublicSeatFinderUrl(getClientSeatFinderUrl(token, data.publicSeatFinderUrl));
            setSeatFinderSummary({
                attendingCount: data.attendingCount,
                assignedCount: data.assignedCount,
                sentCount: data.sentCount,
                checkedInCount: data.checkedInCount,
            });
            setSeatFinderStatus(`Guest codes ready. ${data.generated || 0} new code${data.generated === 1 ? '' : 's'} generated.`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to generate guest codes.';
            setSeatFinderStatus(message);
            alert(message);
        } finally {
            setSeatFinderLoading(null);
        }
    };

    const sendSeatLinks = async (resendAll = false) => {
        if (!hasPlannerPro) {
            alert('Seat-link email sending is part of Planner Pro.');
            return;
        }
        setSeatFinderLoading(resendAll ? 'resend' : 'send');
        setSeatFinderStatus('');
        try {
            const data = await callSeatFinderApi('/api/seating/send-seat-links', { weddingId, resendAll });
            setSeatFinderStatus(`Seat links sent: ${data.sent || 0}. No email: ${data.skippedNoEmail || 0}. Unassigned: ${data.skippedUnassigned || 0}.${data.emailErrorCount ? ` Email errors: ${data.emailErrorCount}.` : ''}`);
            if (!publicSeatFinderUrl) {
                void generateSeatLinks();
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to send seat links.';
            setSeatFinderStatus(message);
            alert(message);
        } finally {
            setSeatFinderLoading(null);
        }
    };

    const getSeatFinderQrDataUrl = () => {
        const canvas = document.getElementById('public-seat-finder-qr-canvas') as HTMLCanvasElement | null;
        if (!canvas) {
            setSeatFinderStatus('Generate the venue QR first, then download it.');
            return null;
        }

        try {
            return canvas.toDataURL('image/png');
        } catch {
            setSeatFinderStatus('Unable to prepare QR download. Please try again.');
            return null;
        }
    };

    const dataUrlToFile = (dataUrl: string, fileName: string) => {
        const [header, encoded] = dataUrl.split(',');
        const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/png';
        const binary = atob(encoded || '');
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }
        return new File([bytes], fileName, { type: mime });
    };

    const downloadPublicSeatFinderQr = async () => {
        const dataUrl = getSeatFinderQrDataUrl();
        if (!dataUrl) {
            return;
        }
        const fileName = `${layout.layout_name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'venue'}-seat-finder-qr.png`;

        try {
            const file = dataUrlToFile(dataUrl, fileName);
            const shareData = { files: [file], title: 'QuickWeds Venue QR' };
            if (navigator.share && navigator.canShare?.(shareData)) {
                await navigator.share(shareData);
                setSeatFinderStatus('Venue QR ready to save or share.');
                return;
            }
        } catch {
            // Continue to browser download fallback.
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();

        setQrPreviewUrl(dataUrl);
        const isPhoneBrowser = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
        if (isPhoneBrowser) {
            window.setTimeout(() => {
                const opened = window.open(dataUrl, '_blank');
                if (opened) opened.opener = null;
            }, 250);
            setSeatFinderStatus('If the QR did not download, use the opened QR image and save it to your phone.');
        } else {
            setSeatFinderStatus('Venue QR downloaded.');
        }
    };

    const openPublicSeatFinder = () => {
        const url = publicSeatFinderUrl || getClientSeatFinderUrl(publicSeatFinderToken);
        if (!url) {
            setSeatFinderStatus('Generate the venue QR first, then open the finder.');
            return;
        }
        const openUrl = new URL(url, window.location.origin);
        openUrl.searchParams.set('returnTo', `/dashboard/${weddingId}/planner?tab=seating`);
        const opened = window.open(openUrl.toString(), '_blank');
        if (opened) {
            opened.opener = null;
        } else {
            window.location.href = url;
        }
    };

    const copyPublicSeatFinderUrl = async () => {
        const url = publicSeatFinderUrl || getClientSeatFinderUrl(publicSeatFinderToken);
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            setSeatFinderStatus('Venue QR link copied.');
        } catch {
            setSeatFinderStatus(url);
        }
    };

    const getLayoutFileName = (suffix: string) => {
        const safeName = layout.layout_name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
        return `${safeName || 'seating-layout'}-${suffix}`;
    };

    const toggleChartFullscreen = async () => {
        const shell = chartShellRef.current;
        if (!shell) return;

        if (isChartFullscreen) {
            setIsChartFullscreen(false);
            if (document.fullscreenElement === shell) {
                await document.exitFullscreen().catch(() => undefined);
            }
            return;
        }

        setIsChartFullscreen(true);
        setChartStatus('Fullscreen chart view opened.');

        if (document.fullscreenEnabled) {
            try {
                await shell.requestFullscreen();
            } catch {
                // Keep the app-level fullscreen overlay active when native fullscreen is blocked.
            }
        }
    };

    const downloadSeatingLayoutImage = async () => {
        const canvasElement = canvasRef.current;
        const svgElement = canvasElement?.querySelector('svg');
        if (!canvasElement || !svgElement) {
            setChartStatus('Unable to prepare the seating layout image.');
            return;
        }

        setChartStatus('Preparing layout image...');

        try {
            const ratio = layout.venue_shape === 'square'
                ? 1
                : Math.max(0.35, layout.venue_width / Math.max(1, layout.venue_height));
            const exportWidth = 1800;
            const exportHeight = Math.round(exportWidth / ratio);
            const padding = 72;
            const imageWidth = exportWidth - padding * 2;
            const imageHeight = exportHeight - padding * 2;
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = exportWidth;
            exportCanvas.height = exportHeight;
            const context = exportCanvas.getContext('2d');
            if (!context) throw new Error('Canvas export is not supported.');

            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, exportWidth, exportHeight);
            context.save();
            context.beginPath();
            if (layout.venue_shape === 'oval') {
                context.ellipse(exportWidth / 2, exportHeight / 2, imageWidth / 2, imageHeight / 2, 0, 0, Math.PI * 2);
            } else {
                const radius = layout.venue_shape === 'square' ? 56 : 44;
                drawRoundedRectPath(context, padding, padding, imageWidth, imageHeight, radius);
            }
            context.clip();
            context.fillStyle = '#f7f7f5';
            context.fillRect(padding, padding, imageWidth, imageHeight);

            if (layout.grid_enabled) {
                context.strokeStyle = 'rgba(0,0,0,0.08)';
                context.lineWidth = 1;
                for (let index = 1; index < 20; index += 1) {
                    const x = padding + (imageWidth * index) / 20;
                    const y = padding + (imageHeight * index) / 20;
                    context.beginPath();
                    context.moveTo(x, padding);
                    context.lineTo(x, padding + imageHeight);
                    context.stroke();
                    context.beginPath();
                    context.moveTo(padding, y);
                    context.lineTo(padding + imageWidth, y);
                    context.stroke();
                }
            }

            const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
            svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svgClone.setAttribute('width', String(imageWidth));
            svgClone.setAttribute('height', String(imageHeight));
            const serializedSvg = new XMLSerializer().serializeToString(svgClone);
            const svgUrl = URL.createObjectURL(new Blob([serializedSvg], { type: 'image/svg+xml;charset=utf-8' }));
            const image = new Image();
            image.decoding = 'async';
            const loaded = new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () => reject(new Error('Unable to render the layout image.'));
            });
            image.src = svgUrl;
            await loaded;
            context.drawImage(image, padding, padding, imageWidth, imageHeight);
            URL.revokeObjectURL(svgUrl);
            context.restore();

            context.strokeStyle = '#111111';
            context.lineWidth = 8;
            context.beginPath();
            if (layout.venue_shape === 'oval') {
                context.ellipse(exportWidth / 2, exportHeight / 2, imageWidth / 2, imageHeight / 2, 0, 0, Math.PI * 2);
            } else {
                const radius = layout.venue_shape === 'square' ? 56 : 44;
                drawRoundedRectPath(context, padding, padding, imageWidth, imageHeight, radius);
            }
            context.stroke();

            const dataUrl = exportCanvas.toDataURL('image/png');
            const fileName = getLayoutFileName('final-layout.png');

            try {
                const file = dataUrlToFile(dataUrl, fileName);
                const shareData = { files: [file], title: 'QuickWeds Seating Layout' };
                if (navigator.share && navigator.canShare?.(shareData)) {
                    await navigator.share(shareData);
                    setChartStatus('Seating layout image ready to save or share.');
                    return;
                }
            } catch {
                // Continue to browser download fallback.
            }

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileName;
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            link.remove();

            const isPhoneBrowser = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
            if (isPhoneBrowser) {
                window.setTimeout(() => {
                    const opened = window.open(dataUrl, '_blank');
                    if (opened) opened.opener = null;
                }, 250);
                setChartStatus('If the layout did not download, use the opened image and save it to your phone.');
            } else {
                setChartStatus('Seating layout image downloaded.');
            }
        } catch (err) {
            setChartStatus(err instanceof Error ? err.message : 'Unable to download the seating layout image.');
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

    useEffect(() => {
        if (!draggingObject) return;

        const moveObject = (event: PointerEvent) => {
            const position = getPointerPosition(event.clientX, event.clientY);
            if (!position) return;
            setLayout((current) => ({
                ...current,
                layout_data: {
                    ...(current.layout_data || {}),
                    objects: (current.layout_data?.objects || []).map((object) => (
                        object.id === draggingObject
                            ? { ...object, x: position.position_x, y: position.position_y }
                            : object
                    )),
                },
            }));
        };

        const stopDragging = () => {
            const draggedObject = objectsRef.current.find((object) => object.id === draggingObject);
            setDraggingObject(null);
            if (draggedObject) {
                updateVenueObject(draggedObject.id, { x: draggedObject.x, y: draggedObject.y });
            }
        };

        window.addEventListener('pointermove', moveObject);
        window.addEventListener('pointerup', stopDragging, { once: true });

        return () => {
            window.removeEventListener('pointermove', moveObject);
            window.removeEventListener('pointerup', stopDragging);
        };
    }, [draggingObject, getPointerPosition]);

    const startTableDrag = (event: ReactPointerEvent, table: Table) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedTable(table.id);
        setSelectedObject(null);
        setDraggingTable(table.id);
    };

    const startObjectDrag = (event: ReactPointerEvent, object: VenueObject) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedTable(null);
        setSelectedObject(object.id);
        setDraggingObject(object.id);
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

    const nudgeSelectedObject = (deltaX: number, deltaY: number) => {
        if (!selectedObjectData) return;
        updateVenueObject(selectedObjectData.id, {
            x: selectedObjectData.x + deltaX,
            y: selectedObjectData.y + deltaY,
        });
    };

    const resetTablePositions = () => {
        const resetTables = tables.map((table, index) => ({ ...table, ...getDefaultTablePosition(index) }));
        setTables(resetTables);
        void Promise.all(resetTables.map((table) => updateTablePosition(table.id, table.position_x, table.position_y)));
    };

    const unassignedGuests = useMemo(() => {
        return guests
            .filter((guest) => !assignedGuestIds.has(guest.id))
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
    }, [assignedGuestIds, guests, groupFilter, searchQuery]);

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
    const selectedObjectData = (layout.layout_data?.objects || []).find((object) => object.id === selectedObject) || null;
    const selectedTableSize = selectedTableData ? getTableSize(selectedTableData) : null;
    const selectedTableAssignments = selectedTableData
        ? (assignmentsByTable.get(selectedTableData.id) || [])
            .slice()
            .sort((a, b) => Number(a.seat_number || 0) - Number(b.seat_number || 0))
        : [];
    const displayedSeatFinderUrl = publicSeatFinderUrl || getClientSeatFinderUrl(publicSeatFinderToken);

    const getCanvasShapeClass = () => {
        if (layout.venue_shape === 'oval') return 'rounded-[50%]';
        if (layout.venue_shape === 'square') return 'rounded-[2rem]';
        return 'rounded-[2rem]';
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

                {!hasPlannerPro && (
                    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-bold text-foreground">Free seating sample: {Math.min(tables.length, FREE_PLAN_LIMITS.seatingTables)} / {FREE_PLAN_LIMITS.seatingTables} tables</p>
                            <p className="mt-1 text-xs text-text-secondary">Upgrade for unlimited tables, guest check-in, seat links, and bulk seat emails.</p>
                        </div>
                        <UpgradeButton weddingId={weddingId} className="justify-center text-sm" />
                    </div>
                )}

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
                    <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto_auto_auto]">
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
                        <button type="button" onClick={() => updateLayoutData({ showMeasurements: !layout.layout_data?.showMeasurements })} className={`inline-flex min-h-[44px] items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition ${layout.layout_data?.showMeasurements ? 'border-primary bg-primary text-white' : 'border-border bg-white text-text-secondary hover:text-primary'}`}>
                            {layout.layout_data?.showMeasurements ? 'Measure On' : 'Measure Off'}
                        </button>
                        <button type="button" onClick={resetTablePositions} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                            <RotateCcw className="h-4 w-4" /> Reset
                        </button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:gap-2 sm:overflow-x-auto sm:pb-1">
                        {([
                            'dance_floor',
                            'stage',
                            'bar',
                            'buffet',
                            'dj',
                            'photo_booth',
                            'gift_table',
                            'entrance',
                            'custom',
                        ] as VenueObjectType[]).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => addVenueObject(type)}
                                className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-xl border border-border bg-white px-2 py-2 text-[10px] font-bold leading-tight text-text-secondary transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:px-3 sm:text-xs"
                            >
                                {VENUE_OBJECT_PRESETS[type].label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                <div className="order-2 mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4 lg:order-1 lg:mb-6 lg:mt-0">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">QR Seat Finder</p>
                            <h3 className="mt-1 font-serif text-xl font-bold text-foreground">Guest seat links and venue check-in</h3>
                            <p className="mt-1 text-xs leading-5 text-text-secondary">Generate guest codes, email QR seat links, or print one venue QR for guests to find their seats.</p>
                            {(seatFinderSummary.attendingCount !== undefined || seatFinderStatus) && (
                                <p className="mt-2 text-xs font-semibold text-text-secondary">
                                    {seatFinderSummary.attendingCount !== undefined && (
                                        <>
                                            Guests: {seatFinderSummary.attendingCount || 0} - Assigned: {seatFinderSummary.assignedCount || 0} - Sent: {seatFinderSummary.sentCount || 0} - Checked in: {seatFinderSummary.checkedInCount || 0}
                                        </>
                                    )}
                                    {seatFinderStatus && <span className="block text-primary">{seatFinderStatus}</span>}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            {displayedSeatFinderUrl && (
                                <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3">
                                    <QRCodeSVG id="public-seat-finder-qr" value={displayedSeatFinderUrl} size={72} />
                                    <QRCodeCanvas
                                        id="public-seat-finder-qr-canvas"
                                        value={displayedSeatFinderUrl}
                                        size={720}
                                        includeMargin
                                        className="pointer-events-none absolute -left-[9999px] top-0 h-[720px] w-[720px]"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Venue QR</p>
                                        <p className="mt-1 max-w-[180px] truncate text-xs font-bold text-foreground">{displayedSeatFinderUrl}</p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                                <button type="button" onClick={() => void generateSeatLinks()} disabled={seatFinderLoading !== null} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50">
                                    {seatFinderLoading === 'generate' ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                                    Generate
                                </button>
                                <button type="button" onClick={() => void sendSeatLinks(false)} disabled={seatFinderLoading !== null} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50">
                                    {seatFinderLoading === 'send' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                    Send Links
                                </button>
                                <button type="button" onClick={() => void sendSeatLinks(true)} disabled={seatFinderLoading !== null} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary disabled:opacity-50">
                                    {seatFinderLoading === 'resend' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                    Resend All
                                </button>
                                <a href={`/dashboard/${weddingId}/planner/check-in`} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Check-In
                                </a>
                                {displayedSeatFinderUrl && (
                                    <>
                                        <button type="button" onClick={() => void copyPublicSeatFinderUrl()} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                                            <Copy className="h-4 w-4" />
                                            Copy QR Link
                                        </button>
                                        <button type="button" onClick={downloadPublicSeatFinderQr} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                                            <Download className="h-4 w-4" />
                                            Download QR
                                        </button>
                                        <button type="button" onClick={openPublicSeatFinder} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                                            <ExternalLink className="h-4 w-4" />
                                            Open Finder
                                        </button>
                                    </>
                                )}
                                <a href={`/user-guide/seating-planner?returnTo=${encodeURIComponent(`/dashboard/${weddingId}/planner?tab=seating`)}`} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white">
                                    <BookOpen className="h-4 w-4" />
                                    Seating Guide
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-1 grid grid-cols-1 gap-6 sm:gap-10 lg:order-2 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-5">
                        <div
                            ref={chartShellRef}
                            className={`${isChartFullscreen ? 'fixed inset-0 z-[9999] flex h-dvh flex-col overflow-auto rounded-none border-0 bg-white p-3 shadow-none sm:p-6' : 'rounded-2xl border border-border bg-white p-3 shadow-inner'}`}
                        >
                            <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-border bg-neutral/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Interactive Seating Chart</p>
                                    <p className="mt-1 text-xs font-semibold text-text-secondary">
                                        {chartStatus || 'Open the chart fullscreen or download the final floor plan as a PNG.'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                                    <button type="button" onClick={() => void downloadSeatingLayoutImage()} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                                        <Download className="h-4 w-4" />
                                        Download Image
                                    </button>
                                    <button type="button" onClick={() => void toggleChartFullscreen()} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-hover">
                                        {isChartFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                        {isChartFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                    </button>
                                </div>
                            </div>
                            {positionSaveError && (
                                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                                    {positionSaveError}
                                </div>
                            )}
                            <div
                                ref={canvasRef}
                                className={`relative mx-auto w-full overflow-hidden border-[3px] border-black bg-[#f7f7f5] shadow-inner ${isChartFullscreen ? 'h-[calc(100dvh-150px)] min-h-[520px] max-w-none flex-1' : 'min-h-[420px] max-w-5xl'} ${getCanvasShapeClass()}`}
                                style={{
                                    aspectRatio: canvasAspectRatio,
                                    backgroundImage: layout.grid_enabled
                                        ? 'linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)'
                                        : undefined,
                                    backgroundSize: layout.grid_enabled ? '5% 5%' : undefined,
                                }}
                            >
                                <svg className="absolute inset-0 h-full w-full touch-none select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <filter id="floor-shadow" x="-30%" y="-30%" width="160%" height="160%">
                                            <feDropShadow dx="0.8" dy="1.2" stdDeviation="0.7" floodColor="#000000" floodOpacity="0.22" />
                                        </filter>
                                        <pattern id="hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                            <line x1="0" y1="0" x2="0" y2="2" stroke="#b8b8b8" strokeWidth="0.25" />
                                        </pattern>
                                    </defs>

                                    {layout.layout_data?.showMeasurements && (
                                        <g className="pointer-events-none" stroke="#5bb7ff" strokeWidth="0.25" fill="#3aa4f5" fontSize="2.2" fontFamily="Arial" fontWeight="700">
                                            <line x1="3" y1="1.8" x2="97" y2="1.8" />
                                            <line x1="3" y1="1" x2="3" y2="2.8" />
                                            <line x1="97" y1="1" x2="97" y2="2.8" />
                                            <text x="50" y="1.4" textAnchor="middle">{layout.venue_width}&apos;</text>
                                            <line x1="98.2" y1="5" x2="98.2" y2="95" />
                                            <line x1="97.2" y1="5" x2="99.2" y2="5" />
                                            <line x1="97.2" y1="95" x2="99.2" y2="95" />
                                            <text x="99.4" y="51" transform="rotate(90 99.4 51)" textAnchor="middle">{layout.venue_height}&apos;</text>
                                        </g>
                                    )}

                                    {(layout.layout_data?.objects || []).map((object) => {
                                        const isSelected = selectedObject === object.id;
                                        const isEntrance = object.type === 'entrance';
                                        const fill = object.type === 'dance_floor' ? 'url(#hatch)' : object.type === 'stage' ? '#ffffff' : '#fdfdfd';
                                        return (
                                            <g
                                                key={object.id}
                                                transform={`translate(${object.x} ${object.y}) rotate(${object.rotation})`}
                                                onPointerDown={(event) => startObjectDrag(event, object)}
                                                className="cursor-grab"
                                            >
                                                {isEntrance ? (
                                                    <g>
                                                        <path d="M 0 3 L -4 -5 L 4 -5 Z" fill="#000" filter="url(#floor-shadow)" />
                                                        <text y="-7" textAnchor="middle" fontSize="2.6" fontWeight="800" fill="#333">{object.label}</text>
                                                    </g>
                                                ) : (
                                                    <g>
                                                        <rect x={-object.width / 2} y={-object.height / 2} width={object.width} height={object.height} rx="0.8" fill={fill} stroke={isSelected ? '#D16C78' : '#777'} strokeWidth={isSelected ? 0.75 : 0.35} filter="url(#floor-shadow)" />
                                                        <text textAnchor="middle" dominantBaseline="middle" fontSize="2.6" fontWeight="800" fill="#4d4d4d">{object.label}</text>
                                                        {layout.layout_data?.showMeasurements && (
                                                            <text x={object.width / 2 + 2} y="0" fontSize="2.1" fontWeight="800" fill="#4aaaf5" transform={`rotate(${object.rotation * -1} ${object.width / 2 + 2} 0)`}>{object.width.toFixed(0)}&apos;</text>
                                                        )}
                                                    </g>
                                                )}
                                            </g>
                                        );
                                    })}

                                    {tables.map((table) => {
                                        const tableAssignments = assignmentsByTable.get(table.id) || [];
                                        const seatsUsed = seatsUsedByTable.get(table.id) || 0;
                                        const isSelected = selectedTable === table.id;
                                        const seatsRemaining = table.capacity - seatsUsed;
                                        const isFull = seatsRemaining === 0;
                                        const isOverbooked = seatsRemaining < 0;
                                        const size = getTableSize(table);
                                        const chairs = getChairPositions(table);

                                        return (
                                            <g
                                                key={table.id}
                                                transform={`translate(${table.position_x} ${table.position_y}) rotate(${size.rotation})`}
                                                onPointerDown={(event) => startTableDrag(event, table)}
                                                className="cursor-grab"
                                            >
                                                {chairs.map((chair, index) => (
                                                    <rect key={index} x={chair.x - 1.05} y={chair.y - 1.15} width="2.1" height="2.3" rx="0.25" fill="#fff" stroke="#555" strokeWidth="0.22" transform={`rotate(${chair.rotation} ${chair.x} ${chair.y})`} filter="url(#floor-shadow)" />
                                                ))}
                                                {table.table_shape === 'round' ? (
                                                    <ellipse cx="0" cy="0" rx={size.width / 2} ry={size.height / 2} fill="#fff" stroke={isSelected ? '#D16C78' : '#999'} strokeWidth={isSelected ? 0.75 : 0.35} filter="url(#floor-shadow)" />
                                                ) : (
                                                    <rect x={-size.width / 2} y={-size.height / 2} width={size.width} height={size.height} rx="1.1" fill="#fff" stroke={isSelected ? '#D16C78' : '#999'} strokeWidth={isSelected ? 0.75 : 0.35} filter="url(#floor-shadow)" />
                                                )}
                                                <text y="-0.7" textAnchor="middle" fontSize="2.5" fontWeight="900" fill="#3A2A2D">{table.table_name}</text>
                                                <text y="2.4" textAnchor="middle" fontSize="2" fontWeight="800" fill={isOverbooked ? '#ef4444' : isFull ? '#d97706' : '#7A5A61'}>{seatsUsed}/{table.capacity}</text>
                                                {tableAssignments.length > 0 && (
                                                    <text y="5.3" textAnchor="middle" fontSize="1.7" fill="#7A5A61">{tableAssignments.length} parties</text>
                                                )}
                                            </g>
                                        );
                                    })}
                                </svg>

                                {tables.length === 0 && (
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-text-secondary opacity-50">
                                        <Layout className="w-16 h-16 mb-4" />
                                        <p className="font-serif italic text-lg">No tables defined yet.</p>
                                        <p className="text-sm mt-2">Click &quot;Add Table&quot; to start your floor plan.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-border bg-neutral/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Current Layout</p>
                                    <p className="mt-1 text-sm font-bold text-foreground">{layout.layout_name} - {layout.venue_width}&apos; x {layout.venue_height}&apos;</p>
                                    {(selectedTableData || selectedObjectData) && (
                                        <p className="mt-1 text-xs text-text-secondary">
                                            Moving {selectedTableData?.table_name || selectedObjectData?.label}
                                        </p>
                                    )}
                                </div>
                                {selectedTableData && (
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
                                )}
                                {selectedObjectData && (
                                    <div className="grid w-full max-w-[180px] grid-cols-3 grid-rows-3 gap-1.5 self-start sm:self-center" aria-label="Move selected venue item">
                                        <button type="button" onClick={() => nudgeSelectedObject(0, -5)} className="col-start-2 row-start-1 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary/30 hover:text-primary" aria-label="Move item up">
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => nudgeSelectedObject(-5, 0)} className="col-start-1 row-start-2 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary/30 hover:text-primary" aria-label="Move item left">
                                            <ArrowLeft className="h-4 w-4" />
                                        </button>
                                        <div className="col-start-2 row-start-2 flex h-10 items-center justify-center rounded-xl border border-dashed border-primary/20 bg-white/60 text-primary">
                                            <Move className="h-4 w-4" />
                                        </div>
                                        <button type="button" onClick={() => nudgeSelectedObject(5, 0)} className="col-start-3 row-start-2 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary/30 hover:text-primary" aria-label="Move item right">
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => nudgeSelectedObject(0, 5)} className="col-start-2 row-start-3 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition hover:border-primary/30 hover:text-primary" aria-label="Move item down">
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedTableData && selectedTableSize && (
                            <div className="rounded-2xl border border-border bg-neutral/40 p-4">
                                <div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Selected Table</p>
                                        <h3 className="font-serif text-xl font-bold text-foreground">{selectedTableData.table_name}</h3>
                                        <p className="mt-1 text-xs font-semibold text-text-secondary">{getSeatsUsed(selectedTableData.id)} of {selectedTableData.capacity} seats used</p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button type="button" onClick={() => openEditTableModal(selectedTableData)} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary">
                                                <Edit2 className="h-4 w-4" /> Edit
                                            </button>
                                            <button type="button" onClick={() => void deleteTable(selectedTableData.id)} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" /> Delete
                                            </button>
                                        </div>
                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            <label className="space-y-1">
                                                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-text-secondary">Width</span>
                                                <input type="number" min={7} max={28} value={selectedTableSize.width} onChange={(event) => void updateTableStyle(selectedTableData.id, { width: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold outline-none focus:border-primary" />
                                            </label>
                                            <label className="space-y-1">
                                                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-text-secondary">Height</span>
                                                <input type="number" min={6} max={24} value={selectedTableSize.height} onChange={(event) => void updateTableStyle(selectedTableData.id, { height: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold outline-none focus:border-primary" />
                                            </label>
                                            <label className="space-y-1">
                                                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-text-secondary">Rotate</span>
                                                <input type="number" step={15} value={selectedTableSize.rotation} onChange={(event) => void updateTableStyle(selectedTableData.id, { rotation: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold outline-none focus:border-primary" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedObjectData && (
                            <div className="rounded-2xl border border-border bg-neutral/40 p-4">
                                <div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Selected Venue Item</p>
                                        <input value={selectedObjectData.label} onChange={(event) => updateVenueObject(selectedObjectData.id, { label: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary" />
                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            <label className="space-y-1">
                                                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-text-secondary">Width</span>
                                                <input type="number" min={5} max={50} value={selectedObjectData.width} onChange={(event) => updateVenueObject(selectedObjectData.id, { width: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold outline-none focus:border-primary" />
                                            </label>
                                            <label className="space-y-1">
                                                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-text-secondary">Height</span>
                                                <input type="number" min={4} max={40} value={selectedObjectData.height} onChange={(event) => updateVenueObject(selectedObjectData.id, { height: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold outline-none focus:border-primary" />
                                            </label>
                                            <label className="space-y-1">
                                                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-text-secondary">Rotate</span>
                                                <input type="number" step={15} value={selectedObjectData.rotation} onChange={(event) => updateVenueObject(selectedObjectData.id, { rotation: Number(event.target.value) })} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold outline-none focus:border-primary" />
                                            </label>
                                        </div>
                                        <button type="button" onClick={() => deleteVenueObject(selectedObjectData.id)} className="mt-4 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" /> Delete Item
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
            </div>

            <AnimatePresence>
                {qrPreviewUrl && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setQrPreviewUrl('')} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 z-[60] w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-6 text-center shadow-2xl">
                            <button type="button" onClick={() => setQrPreviewUrl('')} className="absolute right-4 top-4 rounded-full p-2 text-text-secondary transition hover:bg-neutral">
                                <X className="h-5 w-5" />
                            </button>
                            <Camera className="mx-auto h-8 w-8 text-primary" />
                            <h3 className="mt-3 font-serif text-2xl font-bold text-foreground">Venue QR</h3>
                            <p className="mt-2 text-xs leading-5 text-text-secondary">If your phone did not download automatically, long-press this QR image and save it to your photos.</p>
                            <img src={qrPreviewUrl} alt="Venue seat finder QR code" className="mx-auto mt-5 h-56 w-56 rounded-2xl border border-border bg-white p-3" />
                            <a href={qrPreviewUrl} download={`${layout.layout_name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'venue'}-seat-finder-qr.png`} className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">
                                <Download className="h-4 w-4" />
                                Save QR
                            </a>
                        </motion.div>
                    </>
                )}
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
