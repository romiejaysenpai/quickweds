'use client';

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Some browsers begin a blob download on the following event loop turn.
    // Keep the URL alive long enough for that handoff before releasing memory.
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

async function svgToCanvas(svg: SVGSVGElement, background: string | null) {
    await document.fonts?.ready;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', '1080');
    clone.setAttribute('height', '1080');
    clone.setAttribute('viewBox', '0 0 240 240');
    clone.querySelectorAll('style').forEach((style) => style.remove());

    const source = new XMLSerializer().serializeToString(clone);
    const image = new Image();
    const sourceUrl = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Unable to prepare the monogram export.'));
        image.src = sourceUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser cannot create an image export.');
    if (background) {
        context.fillStyle = background;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(sourceUrl);
    return canvas;
}

export async function downloadMonogramImage(svg: SVGSVGElement, format: 'png' | 'jpg', filenameBase: string) {
    const canvas = await svgToCanvas(svg, format === 'jpg' ? '#ffffff' : null);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format === 'png' ? 'image/png' : 'image/jpeg', 0.96));
    if (!blob) throw new Error('Unable to create the image export.');
    downloadBlob(blob, `${filenameBase}.${format}`);
}

export async function createMonogramWebm(svg: SVGSVGElement, animation: string, durationMs = 3000) {
    const source = await svgToCanvas(svg, '#ffffff');
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser cannot create a video export.');
    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
    };
    const completed = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
        recorder.onerror = () => reject(new Error('Unable to record the monogram animation.'));
    });
    const startedAt = performance.now();
    const drawFrame = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / Math.min(durationMs, 1250));
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.save();
        if (animation === 'draw') {
            context.beginPath();
            context.rect(0, 0, canvas.width * progress, canvas.height);
            context.clip();
        } else if (animation === 'bloom') {
            const scale = 0.72 + (0.28 * progress);
            context.translate(canvas.width / 2, canvas.height / 2);
            context.scale(scale, scale);
            context.translate(-canvas.width / 2, -canvas.height / 2);
            context.globalAlpha = progress;
        } else if (animation === 'float') {
            context.translate(0, 26 * (1 - progress));
        } else if (animation === 'reveal') {
            context.translate(0, 52 * (1 - progress));
            context.globalAlpha = progress;
        }
        context.drawImage(source, 0, 0);
        context.restore();
        if (animation === 'shimmer') {
            const x = -canvas.width + (canvas.width * 2.5 * progress);
            const gradient = context.createLinearGradient(x, 0, x + canvas.width * 0.38, 0);
            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.52)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (now - startedAt < durationMs) requestAnimationFrame(drawFrame);
    };
    recorder.start();
    requestAnimationFrame(drawFrame);
    await new Promise((resolve) => window.setTimeout(resolve, durationMs));
    recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
    return completed;
}

export async function requestMonogramMp4(video: Blob, accessToken: string, filenameBase: string) {
    const body = new FormData();
    body.append('video', video, `${filenameBase}.webm`);
    const response = await fetch('/api/monogram/export', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.url) throw new Error(payload.error || 'Unable to create the MP4 export.');
    const anchor = document.createElement('a');
    anchor.href = payload.url;
    anchor.download = `${filenameBase}.mp4`;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}
