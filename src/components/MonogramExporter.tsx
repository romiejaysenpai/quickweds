'use client';

import React, { useState, useRef } from 'react';
import { Download, Video, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { MonogramMark } from './MonogramMark';

interface MonogramExporterProps {
    initials?: string;
    brideName?: string;
    groomName?: string;
    shape?: string;
    animation?: string;
    color?: string;
    motifColor?: string;
    fontFamily?: string;
    fontClassName?: string;
    isPro?: boolean;
    onRequirePro?: () => void;
}

export function MonogramExporter({
    initials,
    brideName,
    groomName,
    shape = 'minimal',
    animation = 'none',
    color,
    motifColor,
    fontFamily,
    fontClassName = 'font-serif',
    isPro = false,
    onRequirePro,
}: MonogramExporterProps) {
    const [isExportingVideo, setIsExportingVideo] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const previewRef = useRef<HTMLDivElement>(null);

    // Get final initials string
    const markText = (initials?.trim())
        ? initials.trim()
        : `${brideName?.trim()?.[0] || 'A'} & ${groomName?.trim()?.[0] || 'B'}`;

    const accentColor = color || motifColor || '#C08081';

    // Helper: Draw Monogram onto Canvas
    const drawMonogramToCanvas = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        options: { transparent: boolean; frameProgress?: number }
    ) => {
        const { transparent, frameProgress = 0 } = options;

        ctx.clearRect(0, 0, width, height);

        // Background
        if (!transparent) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
        }

        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.38;

        // Apply pulse or bounce offsets if animated
        let animScale = 1;
        let animY = 0;
        let animRotation = 0;

        if (animation === 'pulse') {
            animScale = 1 + Math.sin(frameProgress * Math.PI * 2) * 0.04;
        } else if (animation === 'bounce') {
            animY = Math.sin(frameProgress * Math.PI * 2) * 15;
        } else if (animation === 'spin') {
            animRotation = frameProgress * Math.PI * 2;
        }

        ctx.save();
        ctx.translate(cx, cy + animY);
        ctx.scale(animScale, animScale);

        // Draw Outer Shape Frame
        ctx.lineWidth = width * 0.015;
        ctx.strokeStyle = accentColor;

        if (shape === 'circle' || shape === 'double-ring' || shape === 'laurel' || shape === 'vintage-wreath' || shape === 'wax-seal') {
            ctx.save();
            ctx.rotate(animRotation);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            if (shape === 'double-ring' || shape === 'wax-seal') {
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
                ctx.strokeStyle = accentColor + '80';
                ctx.stroke();
            }
            ctx.restore();
        } else if (shape === 'square' || shape === 'art-deco') {
            const side = radius * 1.8;
            ctx.beginPath();
            ctx.roundRect(-side / 2, -side / 2, side, side, side * 0.15);
            ctx.stroke();
            if (shape === 'art-deco') {
                ctx.strokeRect(-side * 0.42, -side * 0.42, side * 0.84, side * 0.84);
            }
        } else if (shape === 'diamond') {
            ctx.save();
            ctx.rotate(Math.PI / 4);
            const side = radius * 1.6;
            ctx.strokeRect(-side / 2, -side / 2, side, side);
            ctx.restore();
        } else if (shape === 'oval' || shape === 'romantic-heart') {
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * 1.1, radius * 0.85, 0, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Minimal or default lines
            ctx.beginPath();
            ctx.moveTo(-radius * 1.2, -radius * 0.7);
            ctx.lineTo(radius * 1.2, -radius * 0.7);
            ctx.moveTo(-radius * 1.2, radius * 0.7);
            ctx.lineTo(radius * 1.2, radius * 0.7);
            ctx.stroke();
        }

        // Draw Initials Text
        ctx.fillStyle = accentColor;
        const fontSize = Math.round(width * (markText.length > 4 ? 0.14 : 0.22));
        ctx.font = `bold ${fontSize}px Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shimmer effect overlay
        if (animation === 'shimmer') {
            const grad = ctx.createLinearGradient(-radius, 0, radius, 0);
            const shift = (frameProgress * 2) % 1;
            grad.addColorStop(Math.max(0, shift - 0.2), accentColor);
            grad.addColorStop(Math.min(1, shift), '#FFF8DC');
            grad.addColorStop(Math.min(1, shift + 0.2), accentColor);
            ctx.fillStyle = grad;
        }

        ctx.fillText(markText.toUpperCase(), 0, 0);
        ctx.restore();
    };

    // Download PNG (Transparent)
    const handleDownloadPng = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawMonogramToCanvas(ctx, 1200, 1200, { transparent: true });

        const link = document.createElement('a');
        link.download = `wedding-monogram-${markText.replace(/[^a-z0-9]/gi, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // Download JPG (White BG)
    const handleDownloadJpg = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawMonogramToCanvas(ctx, 1200, 1200, { transparent: false });

        const link = document.createElement('a');
        link.download = `wedding-monogram-${markText.replace(/[^a-z0-9]/gi, '_')}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
    };

    // Download Animated Video (MP4 / WebM)
    const handleDownloadVideo = async () => {
        if (!isPro) {
            onRequirePro?.();
            return;
        }

        setIsExportingVideo(true);
        setVideoProgress(0);

        try {
            const canvas = document.createElement('canvas');
            canvas.width = 720;
            canvas.height = 720;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context failed');

            const stream = canvas.captureStream(30);
            const mimeType = MediaRecorder.isTypeSupported('video/mp4')
                ? 'video/mp4'
                : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                    ? 'video/webm;codecs=vp9'
                    : 'video/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `animated-monogram-${markText.replace(/[^a-z0-9]/gi, '_')}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
                a.click();
                URL.revokeObjectURL(url);
                setIsExportingVideo(false);
                setVideoProgress(100);
            };

            mediaRecorder.start();

            const totalFrames = 90; // 3 seconds at 30 fps
            let currentFrame = 0;

            const renderLoop = () => {
                if (currentFrame < totalFrames) {
                    const progress = currentFrame / totalFrames;
                    drawMonogramToCanvas(ctx, 720, 720, { transparent: false, frameProgress: progress });
                    setVideoProgress(Math.round(progress * 100));
                    currentFrame++;
                    requestAnimationFrame(renderLoop);
                } else {
                    mediaRecorder.stop();
                }
            };

            renderLoop();
        } catch (err) {
            console.error('Video export error:', err);
            setIsExportingVideo(false);
            alert('Failed to generate video export. Downloading high-res PNG instead.');
            handleDownloadPng();
        }
    };

    return (
        <div className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-lg backdrop-blur-sm sm:p-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row mb-6">
                <div>
                    <h4 className="font-serif text-xl font-bold text-foreground">Download Your Monogram</h4>
                    <p className="text-xs text-text-secondary">Export high-definition assets for paper invitations, stationery, or wedding video edits.</p>
                </div>
                {!isPro && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        <Sparkles className="h-3.5 w-3.5" />
                        Pro Plan unlocks Animated Video Export
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* PNG Download */}
                <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="flex items-center justify-center gap-2.5 rounded-2xl border border-primary/20 bg-neutral/60 px-4 py-3.5 text-xs font-bold text-foreground transition-all hover:border-primary hover:bg-white hover:shadow-md"
                >
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span>Download PNG (Transparent)</span>
                </button>

                {/* JPG Download */}
                <button
                    type="button"
                    onClick={handleDownloadJpg}
                    className="flex items-center justify-center gap-2.5 rounded-2xl border border-primary/20 bg-neutral/60 px-4 py-3.5 text-xs font-bold text-foreground transition-all hover:border-primary hover:bg-white hover:shadow-md"
                >
                    <Download className="h-4 w-4 text-primary" />
                    <span>Download JPG (Solid)</span>
                </button>

                {/* Video MP4/WebM Download */}
                <button
                    type="button"
                    onClick={handleDownloadVideo}
                    disabled={isExportingVideo}
                    className={`relative flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3.5 text-xs font-bold text-white transition-all shadow-md ${
                        isExportingVideo
                            ? 'bg-neutral-400 cursor-wait'
                            : isPro
                                ? 'bg-gradient-to-r from-primary via-rose-500 to-amber-500 hover:opacity-95 hover:shadow-lg'
                                : 'bg-neutral-800 hover:bg-black'
                    }`}
                >
                    {isExportingVideo ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Exporting Video ({videoProgress}%)...</span>
                        </>
                    ) : (
                        <>
                            <Video className="h-4 w-4 text-amber-300" />
                            <span>Animated Video (MP4/WebM)</span>
                            {!isPro && (
                                <span className="ml-1 rounded-md bg-amber-400 px-1.5 py-0.5 text-[9px] font-black uppercase text-neutral-900">
                                    PRO
                                </span>
                            )}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
