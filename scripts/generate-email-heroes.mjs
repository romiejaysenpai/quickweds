/**
 * Generate elegant hero banner images for QuickWeds email templates.
 * Creates simple gradient PNG banners with subtle patterns.
 * 
 * Usage: node scripts/generate-email-heroes.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { deflateSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'emails');

mkdirSync(OUTPUT_DIR, { recursive: true });

// Minimal PNG generator (no dependencies needed)
function createPng(width, height, pixels) {
    // PNG signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR chunk
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // color type (RGB)
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    // Raw image data with filter bytes
    const rawData = Buffer.alloc(height * (1 + width * 3));
    for (let y = 0; y < height; y++) {
        rawData[y * (1 + width * 3)] = 0; // no filter
        for (let x = 0; x < width; x++) {
            const srcIdx = (y * width + x) * 3;
            const dstIdx = y * (1 + width * 3) + 1 + x * 3;
            rawData[dstIdx] = pixels[srcIdx] || 0;
            rawData[dstIdx + 1] = pixels[srcIdx + 1] || 0;
            rawData[dstIdx + 2] = pixels[srcIdx + 2] || 0;
        }
    }

    // Compress with zlib
    const compressed = deflateSync(rawData);

    // Build chunks
    function makeChunk(type, data) {
        const typeBuffer = Buffer.from(type);
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length, 0);
        const combined = Buffer.concat([typeBuffer, data]);
        const crc = crc32(combined);
        const crcBuffer = Buffer.alloc(4);
        crcBuffer.writeUInt32BE(crc, 0);
        return Buffer.concat([length, combined, crcBuffer]);
    }

    const ihdrChunk = makeChunk('IHDR', ihdr);
    const idatChunk = makeChunk('IDAT', compressed);
    const iendChunk = makeChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 for PNG chunks
function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc ^= buf[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

// Color helpers
function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
}

function gradientPixel(x, y, w, h, colors) {
    const t = y / h;
    const tx = x / w;
    // Diagonal gradient with radial glow
    const diagT = (t * 0.7 + tx * 0.3);
    const r = lerp(colors[0][0], colors[1][0], diagT);
    const g = lerp(colors[0][1], colors[1][1], diagT);
    const b = lerp(colors[0][2], colors[1][2], diagT);
    return [r, g, b];
}

function addNoise(r, g, b, amount) {
    const noise = (Math.random() - 0.5) * amount;
    return [
        Math.max(0, Math.min(255, r + noise)),
        Math.max(0, Math.min(255, g + noise)),
        Math.max(0, Math.min(255, b + noise))
    ];
}

// Generate a hero banner
function generateHero(filename, width, height, colors, pattern = 'gradient') {
    console.log(`Generating ${filename} (${width}x${height})...`);
    const pixels = Buffer.alloc(width * height * 3);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let [r, g, b] = gradientPixel(x, y, width, height, colors);

            // Add subtle pattern overlays
            if (pattern === 'dots') {
                const dotSpacing = 24;
                const dx = x % dotSpacing;
                const dy = y % dotSpacing;
                const dist = Math.sqrt((dx - dotSpacing / 2) ** 2 + (dy - dotSpacing / 2) ** 2);
                if (dist < 2) {
                    r = lerp(r, 255, 0.08);
                    g = lerp(g, 255, 0.08);
                    b = lerp(b, 255, 0.08);
                }
            } else if (pattern === 'lines') {
                if ((x + y) % 48 < 1) {
                    r = lerp(r, 255, 0.06);
                    g = lerp(g, 255, 0.06);
                    b = lerp(b, 255, 0.06);
                }
            } else if (pattern === 'radial') {
                const cx = width * 0.5;
                const cy = height * 0.4;
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
                const glow = 1 - Math.min(dist / maxDist, 1);
                r = lerp(r, Math.min(255, r + 30), glow * 0.3);
                g = lerp(g, Math.min(255, g + 20), glow * 0.3);
                b = lerp(b, Math.min(255, b + 20), glow * 0.3);
            }

            // Subtle grain
            [r, g, b] = addNoise(r, g, b, 4);

            const idx = (y * width + x) * 3;
            pixels[idx] = r;
            pixels[idx + 1] = g;
            pixels[idx + 2] = b;
        }
    }

    const png = createPng(width, height, pixels);
    writeFileSync(join(OUTPUT_DIR, filename), png);
    console.log(`  ✓ Saved ${filename} (${(png.length / 1024).toFixed(1)} KB)`);
}

// QuickWeds brand colors
const ROSE = [209, 108, 120];        // #D16C78
const DEEP_ROSE = [168, 78, 90];     // #A84E5A
const BLUSH = [255, 248, 244];       // #FFF8F4
const WARM_WHITE = [255, 253, 251];  // #FFFDFF
const GOLD = [198, 168, 132];        // #C6A884
const SAGE = [168, 186, 164];        // #A8BAA4
const CHARCOAL = [58, 42, 45];       // #3A2A2D
const DUSTY_PINK = [220, 180, 185];  // #DCB4B9

console.log('🎨 Generating QuickWeds email hero banners...\n');

// Hero banners for each email type
generateHero('hero-welcome.jpg', 600, 280, [ROSE, DEEP_ROSE], 'radial');
generateHero('hero-rsvp.jpg', 600, 260, [ROSE, CHARCOAL], 'radial');
generateHero('hero-reminder.jpg', 600, 240, [DEEP_ROSE, ROSE], 'lines');
generateHero('hero-nurture-1.jpg', 600, 260, [ROSE, WARM_WHITE], 'dots');
generateHero('hero-nurture-2.jpg', 600, 260, [SAGE, BLUSH], 'dots');
generateHero('hero-nurture-3.jpg', 600, 260, [GOLD, BLUSH], 'radial');
generateHero('hero-nurture-4.jpg', 600, 260, [DUSTY_PINK, BLUSH], 'lines');
generateHero('hero-nurture-5.jpg', 600, 260, [ROSE, DUSTY_PINK], 'dots');
generateHero('hero-nurture-6.jpg', 600, 260, [DEEP_ROSE, CHARCOAL], 'radial');
generateHero('hero-thankyou.jpg', 600, 220, [BLUSH, ROSE], 'radial');
generateHero('hero-collab.jpg', 600, 240, [ROSE, GOLD], 'lines');

// Decorative divider
generateHero('divider.jpg', 600, 4, [ROSE, ROSE], 'gradient');

console.log('\n✅ All email hero images generated!');