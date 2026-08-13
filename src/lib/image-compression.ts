'use client';

import {
    ACCEPTED_IMAGE_TYPES,
    IMAGE_COMPRESSION_THRESHOLD,
    MAX_IMAGE_SOURCE_SIZE,
    MAX_IMAGE_UPLOAD_SIZE,
    fileTooLargeMessage,
} from '@/lib/media-upload';

type CompressionOptions = {
    maxBytes?: number;
    maxEdge?: number;
};

function loadImage(file: File) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('This browser could not read the selected image for compression.'));
        };
        image.src = url;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Compresses only large, browser-decodable still images. Browsers apply EXIF
 * orientation while drawing the image, so the exported file keeps its visual orientation.
 * GIFs are intentionally left alone to avoid flattening animation.
 */
export async function compressImageForUpload(file: File, options: CompressionOptions = {}) {
    const maxBytes = options.maxBytes ?? MAX_IMAGE_UPLOAD_SIZE;
    const maxEdge = options.maxEdge ?? 3840;

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
        throw new Error(`${file.name} is not a supported image format. Use JPEG, PNG, WebP, or GIF.`);
    }
    if (file.size > MAX_IMAGE_SOURCE_SIZE) {
        throw new Error(fileTooLargeMessage(file, MAX_IMAGE_SOURCE_SIZE));
    }
    if (file.type === 'image/gif' || file.size <= IMAGE_COMPRESSION_THRESHOLD) return file;

    const image = await loadImage(file);
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare this image for upload.');
    context.drawImage(image, 0, 0, width, height);

    // PNG preserves transparency. JPEG/WebP are stored as quality-preserving JPEGs.
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const qualities = outputType === 'image/png' ? [undefined] : [0.9, 0.86, 0.82, 0.78];
    let result: Blob | null = null;
    for (const quality of qualities) {
        result = await canvasToBlob(canvas, outputType, quality);
        if (result && result.size <= maxBytes) break;
    }
    if (!result) throw new Error('Image compression failed. Please try a different photo.');

    const extension = outputType === 'image/png' ? 'png' : 'jpg';
    const filename = file.name.replace(/\.[^.]+$/, '') || 'wedding-photo';
    const compressed = new File([result], `${filename}.${extension}`, { type: outputType, lastModified: file.lastModified });
    if (compressed.size > maxBytes) throw new Error(fileTooLargeMessage(compressed, maxBytes));
    return compressed;
}
