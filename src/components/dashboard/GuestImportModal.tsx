'use client';

import { useMemo, useState } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';
import {
    buildImportedGuestRows,
    inferGuestImportMapping,
    type ImportedGuestRow,
    parseCsv,
} from '@/lib/guest-list';

type GuestImportModalProps = {
    open: boolean;
    onClose: () => void;
    onImport: (rows: ImportedGuestRow[]) => Promise<void>;
};

const fieldOptions = [
    { value: 'guest_name', label: 'Guest Name' },
    { value: 'guest_email', label: 'Guest Email' },
    { value: 'rsvp_status', label: 'RSVP Status' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'num_guests', label: 'Number of Guests' },
    { value: 'guest_group', label: 'Guest Group' },
    { value: 'table_assignment', label: 'Table Assignment' },
    { value: 'invitation_sent', label: 'Invitation Sent' },
    { value: 'invitation_sent_at', label: 'Invitation Sent At' },
    { value: 'plus_one_allowed', label: 'Plus-One Allowed' },
    { value: 'plus_one_name', label: 'Plus-One Name' },
    { value: 'plus_one_email', label: 'Plus-One Email' },
    { value: 'plus_one_rsvp_status', label: 'Plus-One Status' },
] as const;

export default function GuestImportModal({ open, onClose, onImport }: GuestImportModalProps) {
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

    if (!open) return null;

    const reset = () => {
        setHeaders([]);
        setRows([]);
        setMapping({});
        setError(null);
        setImporting(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parsed = parseCsv(text);
            if (parsed.length < 2) {
                throw new Error('The CSV needs a header row and at least one guest row.');
            }

            const [headerRow, ...dataRows] = parsed;
            setHeaders(headerRow);
            setRows(dataRows);
            let inferred = inferGuestImportMapping(headerRow);
            try {
                const saved = JSON.parse(localStorage.getItem('quickweds-import-mapping-v1') || 'null');
                if(saved && Array.isArray(saved.headers) && JSON.stringify(saved.headers) === JSON.stringify(headerRow)) inferred = saved.mapping;
            } catch { /* A mapping preference is optional. */ }
            setMapping(inferred);
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to read the CSV file.';
            setError(message);
        }
    };

    const handleImport = async () => {
        try {
            setImporting(true);
            setError(null);

            if (!mapping.guest_name) {
                throw new Error('Map a column to Guest Name before importing.');
            }

            const importedRows = buildImportedGuestRows(headers, rows, mapping);
            if (importedRows.length === 0) {
                throw new Error('No guest rows were detected in the CSV.');
            }

            const identities = importedRows.map(row=>`${row.guest_name.trim().toLowerCase()}|${String(row.guest_email||'').trim().toLowerCase()}`);
            if(new Set(identities).size !== identities.length) throw new Error('This file repeats the same name and email. Review those rows before importing; QuickWeds will not merge people by name.');
            await onImport(importedRows);
            try { localStorage.setItem('quickweds-import-mapping-v1',JSON.stringify({headers,mapping})); } catch { /* The import succeeded even without preference storage. */ }
            handleClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to import guests.';
            setError(message);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-foreground/55 backdrop-blur-sm">
            <div className="bg-white rounded-lg sm:rounded-[2.5rem] p-4 sm:p-8 md:p-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl sm:text-3xl font-serif font-bold text-foreground">Import Guest List</h2>
                        <p className="text-sm text-text-secondary mt-1">
                            Upload a CSV exported from Excel or Google Sheets, map the columns once, and import your guests in bulk.
                        </p>
                    </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-neutral dark:bg-neutral/50 text-text-secondary flex items-center justify-center hover:bg-neutral/80 transition-colors min-h-[44px] min-w-[44px]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
                    <div className="space-y-5">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-[2rem] p-8 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                            <FileSpreadsheet className="w-10 h-10 text-primary mb-3" />
                            <span className="font-bold text-foreground">Choose a CSV file</span>
                            <span className="text-sm text-text-secondary mt-1">Supports exported CSV files from Excel, Sheets, and Numbers.</span>
                            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
                        </label>

                        {headers.length > 0 && (
                            <div className="border border-border rounded-[2rem] p-5 bg-neutral/20">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <h3 className="font-serif font-bold text-lg text-foreground">Column Mapping</h3>
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                                        {rows.length} rows detected
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fieldOptions.map((field) => (
                                        <div key={field.value}>
                                            <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">
                                                {field.label}
                                            </label>
                                            <select
                                                value={mapping[field.value] || ''}
                                                onChange={(event) =>
                                                    setMapping((current) => ({
                                                        ...current,
                                                        [field.value]: event.target.value,
                                                    }))
                                                }
                                                className="w-full bg-white dark:bg-neutral/30 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-sm min-h-[44px]"
                                            >
                                                <option value="">Skip this field</option>
                                                {headers.map((header) => (
                                                    <option key={`${field.value}-${header}`} value={header}>
                                                        {header}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border border-border rounded-[2rem] p-5 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h3 className="font-serif font-bold text-lg text-foreground">Preview</h3>
                            {previewRows.length > 0 && (
                                <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                                    First {previewRows.length} rows
                                </span>
                            )}
                        </div>

                        {previewRows.length === 0 ? (
                            <div className="h-full min-h-[280px] rounded-[1.5rem] bg-neutral/30 dark:bg-neutral/20 border border-dashed border-border flex items-center justify-center text-center px-6">
                                <div>
                                    <Upload className="w-8 h-8 text-text-secondary/40 mx-auto mb-3" />
                                    <p className="text-sm text-text-secondary">Upload a CSV to preview your guest data before importing.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-[1.5rem] border border-border">
                                <table className="w-full text-left text-xs sm:text-sm">
                                    <thead className="bg-neutral/40 dark:bg-neutral/50">
                                        <tr>
                                            {headers.map((header) => (
                                                <th key={header} className="px-3 py-2 font-bold text-text-secondary whitespace-nowrap">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {previewRows.map((row, index) => (
                                            <tr key={`preview-${index}`}>
                                                {headers.map((header, headerIndex) => (
                                                    <td key={`${header}-${index}`} className="px-3 py-2 whitespace-nowrap">
                                                        {row[headerIndex] || ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                                {error}
                            </div>
                        )}

                        <div className="mt-5 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleImport}
                                disabled={importing || headers.length === 0}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white rounded-2xl px-6 py-4 font-bold disabled:opacity-50 min-h-[44px]"
                            >
                                <Upload className="w-4 h-4" />
                                {importing ? 'Importing Guests...' : 'Import Guests'}
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-6 py-4 rounded-2xl border border-border text-text-secondary font-bold hover:bg-neutral/40 min-h-[44px]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
