'use client';

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Loader2, QrCode, X } from 'lucide-react';

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
    detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
};

type GuestQrScannerProps = {
    onClose: () => void;
    onScan: (value: string) => void;
    busy?: boolean;
};

async function openCameraStream() {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not available on this device. Paste the QR link or guest code instead.');
    }

    try {
        return await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
            audio: false,
        });
    } catch (err) {
        const name = err instanceof DOMException ? err.name : '';
        if (name === 'NotAllowedError' || name === 'SecurityError') {
            throw new Error('Camera permission was blocked. Allow camera access in the browser settings, then try again.');
        }

        return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
}

export default function GuestQrScanner({ onClose, onScan, busy = false }: GuestQrScannerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastScanRef = useRef('');
    const lastFrameAtRef = useRef(0);
    const [starting, setStarting] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('Point the camera at the guest QR code.');

    useEffect(() => {
        let cancelled = false;
        const BarcodeDetector = (window as typeof window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
        const detector = BarcodeDetector ? new BarcodeDetector({ formats: ['qr_code'] }) : null;

        const stop = () => {
            if (animationFrameRef.current) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            if (videoRef.current) videoRef.current.srcObject = null;
        };

        const scanFrame = async (now: number) => {
            if (cancelled) return;
            animationFrameRef.current = window.requestAnimationFrame(scanFrame);
            if (busy || now - lastFrameAtRef.current < 350) return;
            lastFrameAtRef.current = now;

            const video = videoRef.current;
            if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) return;

            try {
                if (detector) {
                    const codes = await detector.detect(video);
                    const rawValue = String(codes[0]?.rawValue || '').trim();
                    if (rawValue) {
                        handleDecodedValue(rawValue);
                        return;
                    }
                }
            } catch {
                // Safari does not support BarcodeDetector; canvas decoding below is the cross-browser path.
            }

            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d', { willReadFrequently: true });
            if (!canvas || !context) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' });
            if (code?.data) {
                handleDecodedValue(code.data.trim());
            } else {
                setStatus('Keep the QR code inside the frame.');
            }
        };

        const handleDecodedValue = (rawValue: string) => {
            if (!rawValue || rawValue === lastScanRef.current) return;
            lastScanRef.current = rawValue;
            setStatus('QR detected. Checking in guest...');
            onScan(rawValue);
            stop();
        };

        const start = async () => {
            setStarting(true);
            setError('');
            try {
                const stream = await openCameraStream();
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;
                const video = videoRef.current;
                if (!video) throw new Error('Camera preview is not ready.');
                video.srcObject = stream;
                video.setAttribute('playsinline', 'true');
                video.muted = true;
                await video.play();
                setStatus('Point the camera at the guest QR code.');
                animationFrameRef.current = window.requestAnimationFrame(scanFrame);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to open the camera. Check browser camera permissions.');
            } finally {
                setStarting(false);
            }
        };

        void start();

        return () => {
            cancelled = true;
            stop();
        };
    }, [busy, onScan]);

    return (
        <div className="mt-4 overflow-hidden rounded-3xl border border-primary/20 bg-foreground text-white shadow-xl shadow-primary/10">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-primary" />
                    <p className="text-sm font-black">Guest QR Scanner</p>
                </div>
                <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20" title="Close scanner">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="relative aspect-[4/3] bg-black sm:aspect-video">
                <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-48 w-48 rounded-3xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
                </div>
                {starting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                        <div className="text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                            <p className="mt-3 text-sm font-bold">Opening camera...</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="px-4 py-3">
                {error ? (
                    <p className="text-sm font-semibold leading-6 text-rose-200">{error}</p>
                ) : (
                    <p className="text-sm font-semibold leading-6 text-white/75">{status}</p>
                )}
            </div>
        </div>
    );
}
