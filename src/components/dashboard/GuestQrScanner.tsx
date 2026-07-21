'use client';

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { CheckCircle2, Info, Loader2, QrCode, X } from 'lucide-react';

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
    detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
};

type GuestQrScannerProps = {
    onClose: () => void;
    onScan: (value: string) => Promise<GuestQrScanResult>;
    busy?: boolean;
};

export type GuestQrScanResult = {
    ok: boolean;
    state?: string;
    message: string;
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
    const closeTimerRef = useRef<number | null>(null);
    const busyRef = useRef(busy);
    const processingRef = useRef(false);
    const lastScanRef = useRef('');
    const lastFrameAtRef = useRef(0);
    const [starting, setStarting] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('Point the camera at the guest QR code.');
    const [tone, setTone] = useState<'idle' | 'processing' | 'success' | 'info' | 'error'>('idle');

    useEffect(() => {
        busyRef.current = busy;
    }, [busy]);

    useEffect(() => {
        let cancelled = false;
        const BarcodeDetector = (window as typeof window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
        const detector = BarcodeDetector ? new BarcodeDetector({ formats: ['qr_code'] }) : null;

        const stop = () => {
            if (closeTimerRef.current) {
                window.clearTimeout(closeTimerRef.current);
                closeTimerRef.current = null;
            }
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
            if (busyRef.current || processingRef.current || now - lastFrameAtRef.current < 350) return;
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
            if (code?.data) handleDecodedValue(code.data.trim());
        };

        const handleDecodedValue = (rawValue: string) => {
            if (!rawValue || rawValue === lastScanRef.current) return;
            lastScanRef.current = rawValue;
            processingRef.current = true;
            setTone('processing');
            setError('');
            setStatus('QR detected. Checking in guest...');
            void onScan(rawValue).then((result) => {
                if (cancelled) return;

                const alreadyCheckedIn = result.state === 'already_checked_in';
                const successful = result.ok && (result.state === 'checked_in_success' || alreadyCheckedIn);

                setStatus(result.message);

                if (successful) {
                    setTone(alreadyCheckedIn ? 'info' : 'success');
                    streamRef.current?.getTracks().forEach((track) => track.stop());
                    streamRef.current = null;
                    closeTimerRef.current = window.setTimeout(onClose, alreadyCheckedIn ? 1800 : 1200);
                    return;
                }

                setTone('error');
                setError(result.message);
                lastScanRef.current = '';
                processingRef.current = false;
            }).catch((err) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : 'Unable to check in guest. Try scanning again.';
                setTone('error');
                setError(message);
                setStatus(message);
                lastScanRef.current = '';
                processingRef.current = false;
            });
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
                setTone('idle');
                setStatus('Point the camera at the guest QR code.');
                animationFrameRef.current = window.requestAnimationFrame(scanFrame);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unable to open the camera. Check browser camera permissions.';
                setTone('error');
                setError(message);
                setStatus(message);
            } finally {
                setStarting(false);
            }
        };

        void start();

        return () => {
            cancelled = true;
            stop();
        };
    }, [onClose, onScan]);

    const statusClass = tone === 'success'
        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
        : tone === 'info'
            ? 'border-amber-300/40 bg-amber-400/15 text-amber-100'
            : tone === 'error'
                ? 'border-rose-300/40 bg-rose-500/15 text-rose-100'
                : 'border-white/15 bg-white/10 text-white/80';

    return (
        <div className="fixed inset-0 z-[100] flex h-dvh flex-col overflow-hidden bg-black text-white">
            <div className="relative z-10 flex min-h-[64px] items-center justify-between gap-3 border-b border-white/10 bg-black/75 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-primary" />
                    <p className="text-sm font-black">Guest QR Scanner</p>
                </div>
                <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20" title="Close scanner">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="relative min-h-0 flex-1 bg-black">
                <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-64 w-64 max-w-[76vw] rounded-[2rem] border-2 border-white/85 shadow-[0_0_0_999px_rgba(0,0,0,0.34)] sm:h-80 sm:w-80" />
                </div>
                {(starting || tone === 'processing') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                        <div className="text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                            <p className="mt-3 text-sm font-bold">{starting ? 'Opening camera...' : 'Checking in guest...'}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="relative z-10 border-t border-white/10 bg-black/80 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
                <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${statusClass}`}>
                    {tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : tone === 'info' || tone === 'error' ? <Info className="mt-0.5 h-5 w-5 shrink-0" /> : <QrCode className="mt-0.5 h-5 w-5 shrink-0" />}
                    <div>
                        <p className="text-sm font-black leading-6">{error || status}</p>
                        <p className="mt-1 text-xs leading-5 opacity-80">
                            {tone === 'error' ? 'Keep this scanner open and try another QR code, or close it and search manually.' : 'Hold the QR code inside the frame.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
