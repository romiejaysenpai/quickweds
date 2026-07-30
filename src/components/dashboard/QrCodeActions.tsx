'use client';

import { useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Download, ExternalLink, Eye, Share2, X } from 'lucide-react';
import { copyToClipboard } from '@/lib/client-clipboard';
import { openExternalUrl } from '@/lib/native-actions';

type QrCodeActionsProps = {
    value: string;
    title: string;
    fileName: string;
    description?: string;
    previewSize?: number;
    canvasSize?: number;
    showUrl?: boolean;
    openUrl?: string;
    compact?: boolean;
    fgColor?: string;
    level?: 'L' | 'M' | 'Q' | 'H';
    className?: string;
    qrClassName?: string;
    actionsClassName?: string;
    onStatus?: (message: string) => void;
};

function dataUrlToFile(dataUrl: string, fileName: string) {
    const [header, encoded] = dataUrl.split(',');
    const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/png';
    const binary = atob(encoded || '');
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return new File([bytes], fileName, { type: mime });
}

function downloadDataUrl(dataUrl: string, fileName: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
}

export default function QrCodeActions({
    value,
    title,
    fileName,
    description,
    previewSize = 132,
    canvasSize = 900,
    showUrl = false,
    openUrl,
    compact = false,
    fgColor,
    level,
    className = '',
    qrClassName = '',
    actionsClassName = '',
    onStatus,
}: QrCodeActionsProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const getDataUrl = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            onStatus?.('QR code is still loading. Try again in a moment.');
            return '';
        }

        try {
            return canvas.toDataURL('image/png');
        } catch {
            onStatus?.('Unable to prepare QR image. Please try again.');
            return '';
        }
    };

    const previewQr = () => {
        const dataUrl = getDataUrl();
        if (!dataUrl) return;
        setPreviewUrl(dataUrl);
        onStatus?.('QR preview opened.');
    };

    const downloadQr = async () => {
        const dataUrl = getDataUrl();
        if (!dataUrl) return;

        setPreviewUrl(dataUrl);

        try {
            const file = dataUrlToFile(dataUrl, fileName);
            const shareData = { files: [file], title };
            if (navigator.share && navigator.canShare?.(shareData)) {
                await navigator.share(shareData);
                onStatus?.('QR ready to save or share.');
                return;
            }
        } catch {
            // Fall through to browser download.
        }

        try {
            downloadDataUrl(dataUrl, fileName);
            onStatus?.('QR download started. If Safari does not save it automatically, use Preview and long-press the image.');
        } catch {
            onStatus?.('Unable to start the download. Use Preview and save the QR image.');
        }
    };

    const copyValue = async () => {
        try {
            await copyToClipboard(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
            onStatus?.('QR link copied.');
        } catch {
            onStatus?.(value);
        }
    };

    const openValue = async () => {
        await openExternalUrl(openUrl || value);
    };

    const openPreviewImage = () => {
        if (!previewUrl) return;
        const opened = window.open(previewUrl, '_blank', 'noopener,noreferrer');
        if (opened) opened.opener = null;
    };

    const actionButtonClass = compact
        ? 'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-black text-text-secondary transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
        : 'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary';

    return (
        <>
            <div className={className}>
                <div className={qrClassName || 'mx-auto rounded-2xl bg-white p-3 shadow-sm'}>
                    <QRCodeSVG value={value} size={previewSize} fgColor={fgColor} level={level} />
                    <QRCodeCanvas
                        value={value}
                        size={canvasSize}
                        includeMargin
                        fgColor={fgColor}
                        level={level}
                        className="pointer-events-none absolute -left-[9999px] top-0 h-[900px] w-[900px]"
                        ref={canvasRef}
                    />
                </div>
                {showUrl && (
                    <p className="mt-3 break-all rounded-xl border border-border bg-neutral/40 p-3 text-xs font-semibold text-text-secondary">{openUrl || value}</p>
                )}
                <div className={actionsClassName ? (/\bm[ty]?-/.test(actionsClassName) ? actionsClassName : `mt-4 ${actionsClassName}`) : 'mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap'}>
                    <button type="button" onClick={copyValue} className={actionButtonClass} title="Copy QR link">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button type="button" onClick={previewQr} className={actionButtonClass} title="Preview QR image">
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                    </button>
                    <button type="button" onClick={() => void downloadQr()} className={actionButtonClass} title="Download QR PNG">
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                    </button>
                    {(openUrl || /^https?:\/\//i.test(value)) && (
                        <button type="button" onClick={() => void openValue()} className={actionButtonClass} title="Open QR URL">
                            <ExternalLink className="h-4 w-4" />
                            <span>Open</span>
                        </button>
                    )}
                </div>
            </div>

            {previewUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${title} QR preview`}>
                    <button type="button" className="absolute inset-0 cursor-default" onClick={() => setPreviewUrl('')} aria-label="Close QR preview" />
                    <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-white p-6 text-center shadow-2xl">
                        <button type="button" onClick={() => setPreviewUrl('')} className="absolute right-4 top-4 rounded-full p-2 text-text-secondary transition hover:bg-neutral" aria-label="Close QR preview">
                            <X className="h-5 w-5" />
                        </button>
                        <QrPreviewHeader title={title} description={description} />
                        <img src={previewUrl} alt={`${title} QR code`} className="mx-auto mt-5 h-56 w-56 rounded-2xl border border-border bg-white p-3" />
                        <div className="mt-5 grid gap-2 sm:grid-cols-2">
                            <button type="button" onClick={() => void downloadQr()} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">
                                <Download className="h-4 w-4" />
                                Save QR
                            </button>
                            <button type="button" onClick={openPreviewImage} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary">
                                <Share2 className="h-4 w-4" />
                                Open Image
                            </button>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-text-secondary">
                            On Safari or iPhone, use Open Image, then long-press the QR and save it to Photos if the download button is blocked.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

function QrPreviewHeader({ title, description }: { title: string; description?: string }) {
    return (
        <>
            <h3 className="pr-8 font-serif text-2xl font-bold text-foreground">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
                {description || 'Preview this QR code before printing, saving, or sharing it.'}
            </p>
        </>
    );
}
