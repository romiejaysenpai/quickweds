'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Camera, Check, CheckCircle2, Copy, Download, ExternalLink, ImageIcon,
    Key, Loader2, LockKeyhole, Plus, RefreshCw, Save, Trash2, X
} from 'lucide-react';
import UpgradeButton from '@/components/UpgradeButton';
import { getCachedSession } from '@/lib/session-cache';
import { copyToClipboard } from '@/lib/client-clipboard';
import { openExternalUrl } from '@/lib/native-actions';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), { ssr: false });
const QRCodeCanvas = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeCanvas), { ssr: false });

type PhotoStatus = 'pending' | 'approved' | 'rejected';
type FilterKey = 'all' | PhotoStatus;

type Photo = {
    id: string;
    cloudinary_url: string;
    uploader_name: string | null;
    caption: string | null;
    message?: string | null;
    is_approved: boolean;
    status?: PhotoStatus | null;
    upload_source?: string | null;
    created_at: string;
};

type SharingCode = {
    id: string;
    code: string;
    is_active: boolean;
    expires_at: string | null;
    max_uploads?: number | null;
    current_uploads?: number | null;
};

type PortalSettings = {
    disposable_camera_enabled: boolean;
    reveal_datetime: string | null;
    guest_name_required: boolean;
    allow_anonymous_uploads: boolean;
    require_approval: boolean;
    photo_limit_per_guest: number;
    film_frame_enabled: boolean;
    nostalgic_ui_enabled: boolean;
    date_stamp_enabled: boolean;
    enabled_filter_ids: string[];
};

const PHOTO_FILTER_CHOICES = [
    { id: 'none', label: 'Original' },
    { id: 'soft-film', label: 'Soft Film' },
    { id: 'warm-vintage', label: 'Warm Vintage' },
    { id: 'black-white', label: 'B&W' },
    { id: 'romantic-glow', label: 'Romantic Glow' },
    { id: 'polaroid-fade', label: 'Polaroid Fade' },
    { id: 'golden-hour', label: 'Golden Hour' },
    { id: 'classic-disposable', label: 'Disposable' },
];

const DEFAULT_SETTINGS: PortalSettings = {
    disposable_camera_enabled: false,
    reveal_datetime: null,
    guest_name_required: false,
    allow_anonymous_uploads: true,
    require_approval: true,
    photo_limit_per_guest: 3,
    film_frame_enabled: false,
    nostalgic_ui_enabled: false,
    date_stamp_enabled: false,
    enabled_filter_ids: PHOTO_FILTER_CHOICES.map((filter) => filter.id),
};

function getPhotoStatus(photo: Photo): PhotoStatus {
    if (photo.status === 'approved' || photo.is_approved) return 'approved';
    if (photo.status === 'rejected') return 'rejected';
    return 'pending';
}

function toDateTimeLocal(value: string | null) {
    if (!value) return '';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

async function getAuthHeaders() {
    const { data: { session } } = await getCachedSession();
    if (!session?.access_token) throw new Error('Please sign in again.');
    return {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
    };
}

export default function PhotoSharingManager({ weddingId, hasPlannerPro = true }: { weddingId: string; hasPlannerPro?: boolean }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actingId, setActingId] = useState<string | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [codes, setCodes] = useState<SharingCode[]>([]);
    const [settings, setSettings] = useState<PortalSettings>(DEFAULT_SETTINGS);
    const [hasPro, setHasPro] = useState(hasPlannerPro);
    const [filter, setFilter] = useState<FilterKey>('all');
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [error, setError] = useState('');
    const [qrStatus, setQrStatus] = useState('');

    const uploadUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/w/${weddingId}/photos`;
    const activeCode = codes.find((code) => code.is_active) || codes[0] || null;
    const uploadUrlWithCode = activeCode ? `${uploadUrl}?code=${encodeURIComponent(activeCode.code)}` : uploadUrl;

    useEffect(() => {
        void loadData();
    }, [weddingId]);

    async function loadData() {
        setLoading(true);
        setError('');
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`/api/photos/portal?weddingId=${encodeURIComponent(weddingId)}`, {
                headers,
                cache: 'no-store',
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to load photo portal.');

            setPhotos(data.photos || []);
            setCodes(data.codes || []);
            setSettings({ ...DEFAULT_SETTINGS, ...(data.settings || {}) });
            setHasPro(Boolean(data.hasPro));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load photo portal.');
        } finally {
            setLoading(false);
        }
    }

    async function saveSettings() {
        setSaving(true);
        setError('');
        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/photos/portal', {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ weddingId, settings }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to save settings.');
            setSettings({ ...DEFAULT_SETTINGS, ...(data.settings || {}) });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save settings.');
        } finally {
            setSaving(false);
        }
    }

    async function generateCode() {
        setActingId('new-code');
        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/photos/sharing-codes', {
                method: 'POST',
                headers,
                body: JSON.stringify({ action: 'create', weddingId, maxUploads: settings.photo_limit_per_guest }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to generate code.');
            setCodes((current) => [data.code, ...current]);
        } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to generate code.');
        } finally {
            setActingId(null);
        }
    }

    async function toggleCode(code: SharingCode) {
        setActingId(code.id);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/photos/sharing-codes', {
                method: 'POST',
                headers,
                body: JSON.stringify({ action: 'toggle', weddingId, id: code.id, isActive: !code.is_active }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to update sharing code.');
            setCodes((current) => current.map((item) => item.id === code.id ? data.code : item));
        } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to update sharing code.');
        } finally {
            setActingId(null);
        }
    }

    async function deleteCode(codeId: string) {
        if (!window.confirm("Guests using this code won't be able to upload anymore. Delete it?")) return;
        setActingId(codeId);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/photos/sharing-codes', {
                method: 'DELETE',
                headers,
                body: JSON.stringify({ weddingId, id: codeId }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to delete sharing code.');
            setCodes((current) => current.filter((code) => code.id !== codeId));
        } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to delete sharing code.');
        } finally {
            setActingId(null);
        }
    }

    async function moderatePhoto(photoId: string, action: 'approve' | 'reject' | 'delete') {
        if (action === 'delete' && !window.confirm('Delete this photo permanently?')) return;
        setActingId(photoId);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch('/api/photos/moderate', {
                method: 'POST',
                headers,
                body: JSON.stringify({ weddingId, photoId, action }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to update photo.');

            if (action === 'delete') {
                setPhotos((current) => current.filter((photo) => photo.id !== photoId));
                if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
            } else if (data.photo) {
                setPhotos((current) => current.map((photo) => photo.id === photoId ? data.photo : photo));
                if (selectedPhoto?.id === photoId) setSelectedPhoto(data.photo);
            }
        } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Unable to update photo.');
        } finally {
            setActingId(null);
        }
    }

    function downloadApprovedPhotos() {
        const approvedPhotos = photos.filter((photo) => getPhotoStatus(photo) === 'approved');
        if (approvedPhotos.length === 0) {
            window.alert('There are no approved photos to download yet.');
            return;
        }

        approvedPhotos.forEach((photo, index) => {
            window.setTimeout(() => {
                const link = document.createElement('a');
                link.href = photo.cloudinary_url;
                link.download = `quickweds-photo-${index + 1}.jpg`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 250);
        });
    }

    function downloadQrCode() {
        const canvas = document.getElementById('photo-sharing-qr-canvas') as HTMLCanvasElement | null;
        if (!canvas) {
            setQrStatus('QR code is still loading. Try again in a moment.');
            return;
        }

        try {
            const dataUrl = canvas.toDataURL('image/png');
            const fileName = `${activeCode?.code?.toLowerCase() || 'photo-sharing'}-photo-upload-qr.png`;
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileName;
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setQrStatus('QR code downloaded.');
        } catch {
            setQrStatus('Unable to prepare QR download. Please try again.');
        }
    }

    function toggleFilter(filterId: string) {
        setSettings((current) => {
            const currentFilters = new Set(current.enabled_filter_ids.length > 0 ? current.enabled_filter_ids : DEFAULT_SETTINGS.enabled_filter_ids);
            if (currentFilters.has(filterId)) {
                currentFilters.delete(filterId);
            } else {
                currentFilters.add(filterId);
            }

            if (currentFilters.size === 0) currentFilters.add('none');
            return { ...current, enabled_filter_ids: Array.from(currentFilters) };
        });
    }

    const counts = useMemo(() => {
        return photos.reduce<Record<FilterKey, number>>((acc, photo) => {
            const status = getPhotoStatus(photo);
            acc.all += 1;
            acc[status] += 1;
            return acc;
        }, { all: 0, pending: 0, approved: 0, rejected: 0 });
    }, [photos]);

    const visiblePhotos = filter === 'all' ? photos : photos.filter((photo) => getPhotoStatus(photo) === filter);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white py-12 soft-shadow dark:bg-white/5 sm:rounded-2xl sm:py-16">
                <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary sm:h-12 sm:w-12" />
                <p className="font-serif text-xs italic text-text-secondary sm:text-sm">Loading photo portal...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-border bg-white p-3 soft-shadow dark:bg-white/5 sm:rounded-2xl sm:p-4">
                <div className="mb-3 flex flex-col items-start gap-2 sm:mb-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Photo Portal</h2>
                        <p className="mt-1 text-xs leading-5 text-text-secondary sm:text-sm">Manage uploads, sharing codes, approval, and reveal timing.</p>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                        <button type="button" onClick={() => void openExternalUrl(uploadUrl)} className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-neutral px-3 py-2 text-xs font-bold text-foreground transition-all hover:bg-neutral/80 sm:flex-none">
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" /> Open
                        </button>
                        <button type="button" onClick={() => void loadData()} className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-neutral px-3 py-2 text-xs font-bold text-foreground transition-all hover:bg-neutral/80 sm:flex-none">
                            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" /> Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Metric label="Total" value={counts.all} />
                    <Metric label="Pending" value={counts.pending} />
                    <Metric label="Approved" value={counts.approved} />
                    <Metric label="Rejected" value={counts.rejected} />
                </div>
            </div>

            <section className="rounded-xl border border-border bg-white p-4 soft-shadow dark:bg-white/5 sm:rounded-2xl sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Photo Sharing Portal &gt; Settings</p>
                        <h3 className="mt-2 font-serif text-xl font-bold text-foreground">Disposable Camera Mode</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                            Let guests capture candid wedding moments and reveal the album later like a real disposable camera.
                        </p>
                    </div>
                    {!hasPro && (
                        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                            <div className="flex items-start gap-3">
                                <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-primary" />
                                <div>
                                    <h4 className="font-serif text-lg font-bold text-foreground">Disposable Camera Mode</h4>
                                    <p className="mt-1 max-w-md text-sm leading-6 text-text-secondary">Upgrade to Pro to unlock nostalgic guest photo collection, reveal dates, approval tools, and private QR uploads.</p>
                                    <UpgradeButton weddingId={weddingId} label="Upgrade to Pro" className="mt-4 justify-center" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {hasPro && (
                    <div className="mt-5 space-y-4">
                        <Toggle
                            label="Enable Disposable Camera Mode"
                            description="Photos stay hidden from guests until your reveal date."
                            checked={settings.disposable_camera_enabled}
                            onChange={(checked) => setSettings((current) => ({ ...current, disposable_camera_enabled: checked }))}
                            prominent
                        />

                        {settings.disposable_camera_enabled && (
                            <div className="grid gap-3 md:grid-cols-2">
                                <Field label="Reveal date/time">
                                    <input type="datetime-local" value={toDateTimeLocal(settings.reveal_datetime)} onChange={(e) => setSettings((current) => ({ ...current, reveal_datetime: fromDateTimeLocal(e.target.value) }))} className="min-h-[44px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
                                </Field>
                                <Field label="Photo limit per guest">
                                    <input type="number" min={1} max={50} value={settings.photo_limit_per_guest} onChange={(e) => setSettings((current) => ({ ...current, photo_limit_per_guest: Math.min(50, Math.max(1, Number(e.target.value || 1))) }))} className="min-h-[44px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
                                </Field>
                                <Toggle label="Guest name required" description="Guests must enter their name before uploading." checked={settings.guest_name_required} onChange={(checked) => setSettings((current) => ({ ...current, guest_name_required: checked, allow_anonymous_uploads: checked ? false : current.allow_anonymous_uploads }))} />
                                <Toggle label="Allow anonymous uploads" description="Guests may upload without adding a name." checked={settings.allow_anonymous_uploads} onChange={(checked) => setSettings((current) => ({ ...current, allow_anonymous_uploads: checked, guest_name_required: checked ? false : current.guest_name_required }))} />
                                <Toggle label="Approval before display" description="New uploads wait for couple approval." checked={settings.require_approval} onChange={(checked) => setSettings((current) => ({ ...current, require_approval: checked }))} />
                                <Toggle label="Film-style photo frame" description="Show a clean instant-film frame on previews." checked={settings.film_frame_enabled} onChange={(checked) => setSettings((current) => ({ ...current, film_frame_enabled: checked }))} />
                                <Toggle label="Nostalgic camera UI" description="Use warmer disposable-camera styling for guests." checked={settings.nostalgic_ui_enabled} onChange={(checked) => setSettings((current) => ({ ...current, nostalgic_ui_enabled: checked }))} />
                                <Toggle label="Date stamp on edited photos" description="Add the couple names and upload date to edited memories." checked={settings.date_stamp_enabled} onChange={(checked) => setSettings((current) => ({ ...current, date_stamp_enabled: checked }))} />
                                <div className="rounded-2xl border border-border bg-neutral/30 p-4 md:col-span-2">
                                    <p className="text-sm font-bold text-foreground">Guest filter presets</p>
                                    <p className="mt-1 text-xs leading-5 text-text-secondary">Choose which wedding filters guests can apply before uploading.</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {PHOTO_FILTER_CHOICES.map((filter) => {
                                            const enabled = (settings.enabled_filter_ids.length > 0 ? settings.enabled_filter_ids : DEFAULT_SETTINGS.enabled_filter_ids).includes(filter.id);
                                            return (
                                                <button
                                                    key={filter.id}
                                                    type="button"
                                                    onClick={() => toggleFilter(filter.id)}
                                                    className={`min-h-[38px] rounded-xl border px-3 py-2 text-xs font-bold transition ${
                                                        enabled
                                                            ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                                                            : 'border-border bg-white text-text-secondary hover:text-foreground'
                                                    }`}
                                                >
                                                    {filter.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="button" onClick={saveSettings} disabled={saving} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-60 sm:w-auto">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Settings
                        </button>
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-border bg-white p-4 soft-shadow dark:bg-white/5 sm:rounded-2xl sm:p-5">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-foreground"><Key className="h-4 w-4 text-primary" /> Private QR Upload Link</h3>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">Guests use an active sharing code to add photos to this wedding roll.</p>
                    </div>
                    <button type="button" onClick={generateCode} disabled={actingId === 'new-code'} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                        {actingId === 'new-code' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        New Code
                    </button>
                </div>

                {activeCode && (
                    <div className="mb-4 grid gap-4 rounded-2xl border border-border bg-neutral/30 p-4 md:grid-cols-[auto,1fr] md:items-center">
                        <div className="mx-auto rounded-2xl bg-white p-3 shadow-sm">
                            <QRCodeSVG value={uploadUrlWithCode} size={132} />
                            <QRCodeCanvas
                                id="photo-sharing-qr-canvas"
                                value={uploadUrlWithCode}
                                size={720}
                                includeMargin
                                className="hidden"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Current guest link</p>
                            <p className="mt-2 break-all rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground">{uploadUrlWithCode}</p>
                            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                <button type="button" onClick={() => void copyToClipboard(uploadUrlWithCode)} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-foreground">
                                    <Copy className="h-4 w-4" /> Copy Link
                                </button>
                                <button type="button" onClick={() => void openExternalUrl(uploadUrlWithCode)} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-foreground">
                                    <ExternalLink className="h-4 w-4" /> Preview
                                </button>
                                <button type="button" onClick={downloadQrCode} className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-foreground">
                                    <Download className="h-4 w-4" /> Download QR
                                </button>
                            </div>
                            {qrStatus && <p className="mt-2 text-xs font-semibold text-text-secondary">{qrStatus}</p>}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {codes.map((code) => {
                        const maxUploads = Number(code.max_uploads ?? settings.photo_limit_per_guest);
                        const currentUploads = Number(code.current_uploads ?? 0);
                        return (
                            <div key={code.id} className="rounded-xl border border-border bg-white p-3 shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-mono text-sm font-bold text-foreground">{code.code}</p>
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${code.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{code.is_active ? 'Active' : 'Paused'}</span>
                                </div>
                                <p className="mt-2 text-xs text-text-secondary">{currentUploads}/{maxUploads} uploads used</p>
                                <div className="mt-3 flex justify-end gap-1">
                                    <button type="button" onClick={() => toggleCode(code)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-neutral" title={code.is_active ? 'Pause code' : 'Activate code'}>
                                        {actingId === code.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </button>
                                    <button type="button" onClick={() => deleteCode(code.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-rose-50 hover:text-rose-600" title="Delete code">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-xl border border-border bg-white soft-shadow dark:bg-white/5 sm:rounded-2xl">
                <div className="border-b border-border/60 p-3 sm:p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <h3 className="font-serif text-lg font-bold text-foreground">Uploaded Photos</h3>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <button type="button" onClick={downloadApprovedPhotos} className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-foreground hover:border-primary/40">
                                <Download className="h-4 w-4" /> Download Approved
                            </button>
                            <div className="grid grid-cols-4 gap-1 rounded-xl bg-neutral p-1">
                                {(['all', 'pending', 'approved', 'rejected'] as FilterKey[]).map((item) => (
                                    <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-lg px-2 py-2 text-[11px] font-bold capitalize transition ${filter === item ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-foreground'}`}>
                                        {item} ({counts[item]})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {visiblePhotos.length === 0 ? (
                    <div className="p-10 text-center">
                        <ImageIcon className="mx-auto mb-3 h-10 w-10 text-text-secondary opacity-35" />
                        <p className="font-bold text-foreground">No photos in this view.</p>
                        <p className="mt-1 text-sm text-text-secondary">New guest uploads will appear here for review.</p>
                    </div>
                ) : (
                    <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
                        {visiblePhotos.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                acting={actingId === photo.id}
                                onOpen={() => setSelectedPhoto(photo)}
                                onApprove={() => moderatePhoto(photo.id, 'approve')}
                                onReject={() => moderatePhoto(photo.id, 'reject')}
                                onDelete={() => moderatePhoto(photo.id, 'delete')}
                            />
                        ))}
                    </div>
                )}
            </section>

            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 p-3 backdrop-blur-md">
                        <div className="relative flex max-h-full w-full max-w-5xl flex-col items-center justify-center">
                            <div className="absolute right-2 top-2 z-10 flex gap-2">
                                <button type="button" onClick={() => moderatePhoto(selectedPhoto.id, 'delete')} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/20 text-red-400 backdrop-blur-md hover:bg-red-500/40" title="Delete"><Trash2 className="h-5 w-5" /></button>
                                <button type="button" onClick={() => setSelectedPhoto(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20" title="Close"><X className="h-5 w-5" /></button>
                            </div>
                            <img src={selectedPhoto.cloudinary_url} alt="Gallery" className="max-h-[68vh] max-w-full rounded-lg object-contain shadow-2xl" />
                            <div className="mt-3 max-w-xl text-center text-white">
                                <p className="font-bold">{selectedPhoto.uploader_name || 'Guest'}</p>
                                {(selectedPhoto.message || selectedPhoto.caption) && <p className="mt-1 text-sm italic text-white/75">{selectedPhoto.message || selectedPhoto.caption}</p>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-border bg-neutral/40 p-2.5 sm:p-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{label}</p>
            <p className="mt-1 text-lg font-bold text-foreground sm:text-xl">{value}</p>
        </div>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-text-secondary">{label}</span>
            {children}
        </label>
    );
}

function Toggle({
    label,
    description,
    checked,
    onChange,
    prominent = false,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    prominent?: boolean;
}) {
    return (
        <div className={`flex min-h-[64px] items-center justify-between gap-4 rounded-2xl border p-4 transition-colors ${
            checked
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-neutral/30'
        } ${prominent ? 'md:col-span-2' : ''}`}>
            <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{label}</p>
                {description && <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={`grid h-9 w-[78px] shrink-0 grid-cols-2 rounded-lg border p-0.5 text-[9px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                    checked ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-white text-text-secondary'
                }`}
            >
                <span className={`flex items-center justify-center rounded-md transition ${!checked ? 'bg-neutral text-foreground shadow-sm' : ''}`}>
                    Off
                </span>
                <span className={`flex items-center justify-center rounded-md transition ${checked ? 'bg-primary text-white shadow-sm' : ''}`}>
                    On
                </span>
            </button>
        </div>
    );
}

function PhotoCard({
    photo,
    acting,
    onOpen,
    onApprove,
    onReject,
    onDelete,
}: {
    photo: Photo;
    acting: boolean;
    onOpen: () => void;
    onApprove: () => void;
    onReject: () => void;
    onDelete: () => void;
}) {
    const status = getPhotoStatus(photo);
    const statusClass = status === 'approved'
        ? 'bg-emerald-100 text-emerald-700'
        : status === 'rejected'
            ? 'bg-rose-100 text-rose-700'
            : 'bg-amber-100 text-amber-700';

    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <button type="button" onClick={onOpen} className="relative block aspect-[4/3] w-full overflow-hidden bg-neutral">
                <img src={photo.cloudinary_url} alt={photo.caption || 'Uploaded wedding photo'} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                <span className={`absolute left-3 top-3 rounded-full px-2 py-1 text-[10px] font-black uppercase ${statusClass}`}>{status}</span>
            </button>
            <div className="space-y-3 p-3">
                <div>
                    <p className="truncate text-sm font-bold text-foreground">{photo.uploader_name || 'Guest'}</p>
                    <p className="text-xs text-text-secondary">{new Date(photo.created_at).toLocaleString()}</p>
                </div>
                {(photo.message || photo.caption) && <p className="line-clamp-2 text-sm leading-5 text-text-secondary">{photo.message || photo.caption}</p>}
                <div className="grid grid-cols-4 gap-1">
                    <IconButton label="Approve" onClick={onApprove} disabled={acting}><CheckCircle2 className="h-4 w-4" /></IconButton>
                    <IconButton label="Reject" onClick={onReject} disabled={acting}><X className="h-4 w-4" /></IconButton>
                    <IconButton label="Delete" onClick={onDelete} disabled={acting}><Trash2 className="h-4 w-4" /></IconButton>
                    <a href={photo.cloudinary_url} download className="flex min-h-[36px] items-center justify-center rounded-lg border border-border bg-neutral text-text-secondary hover:text-primary" title="Download">
                        <Download className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </article>
    );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
    return (
        <button type="button" onClick={onClick} disabled={disabled} className="flex min-h-[36px] items-center justify-center rounded-lg border border-border bg-neutral text-text-secondary transition hover:text-primary disabled:opacity-50" title={label}>
            {children}
        </button>
    );
}
