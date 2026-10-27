import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Extract TEMPLATES ids and names from template-catalog.ts
const catalogContent = fs.readFileSync('src/lib/template-catalog.ts', 'utf8');
const idMatches = [...catalogContent.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map(m => m[1]);

// Unique list of template ids
const templateIds = Array.from(new Set(idMatches.filter(id => 
    !id.startsWith('reference-') && 
    id !== 'default' && 
    id !== 'all' &&
    id !== 'free' &&
    id !== 'pro'
)));

console.log(`Found ${templateIds.length} templates to screenshot:`, templateIds);

const outDir = path.resolve('public/templates/previews');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
    const browser = await chromium.launch({
        executablePath: '/Users/romie/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell'
    });
    const page = await browser.newPage({ viewport: { width: 800, height: 1000 } });

    for (let i = 0; i < templateIds.length; i++) {
        const id = templateIds[i];
        const outPath = path.join(outDir, `${id}.jpg`);
        try {
            console.log(`[${i + 1}/${templateIds.length}] Capturing ${id}...`);
            await page.goto(`http://127.0.0.1:3000/test-render/${id}`, { waitUntil: 'load', timeout: 15000 });
            await page.waitForTimeout(600);
            const card = page.locator('#phone-mockup-card');
            if (await card.count() > 0) {
                await card.screenshot({ path: outPath, type: 'jpeg', quality: 88 });
                console.log(`  ✓ Saved ${id}.jpg (${fs.statSync(outPath).size} bytes)`);
            } else {
                console.warn(`  ✗ Card not found for ${id}`);
            }
        } catch (err) {
            console.error(`  ✗ Error capturing ${id}:`, err.message);
        }
    }

    await browser.close();
    console.log('Finished capturing all templates!');
}

run().catch(console.error);
