const fs = require('fs');

// Fix page.tsx
let pageStr = fs.readFileSync('src/app/w/[id]/page.tsx', 'utf8');

// Find EXACTLY the top-level import to avoid matching comments at EOF
const firstImportTarget = `import HeaderNav from '@/components/wedding/HeaderNav';`;
pageStr = pageStr.replace(
    firstImportTarget,
    `import HeaderNav from '@/components/wedding/HeaderNav';\nimport HeroEnhancer from '@/components/wedding/HeroEnhancer';`
);

// Inject component before Suspense
const suspenseTarget = `<Suspense fallback={<div className="h-screen flex items-center justify-center font-serif italic text-primary">Refining layout...</div>}>`;
pageStr = pageStr.replace(
    suspenseTarget,
    `{/* Premium Global Hero Upgrades */}\n            {!wedding.is_thank_you_mode && <HeroEnhancer wedding={wedding} />}\n\n            ` + suspenseTarget
);

fs.writeFileSync('src/app/w/[id]/page.tsx', pageStr);

// Fix CountdownTimer.tsx
let timerStr = fs.readFileSync('src/components/wedding/CountdownTimer.tsx', 'utf8');

timerStr = timerStr.replace(
    `        const target = new Date(weddingDate);
        if (weddingTime) {
            const [h, m] = weddingTime.split(':').map(Number);
            target.setHours(h || 0, m || 0);
        }

        const update = () => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();`,
    `        const targetStr = \`\${weddingDate}T\${weddingTime || '00:00'}\`;
        const target = new Date(targetStr);
        // Fallback safely if date is bad
        if (isNaN(target.getTime())) return;

        const update = () => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();`
);

timerStr = timerStr.replace(
    `    if (!isMounted) return null;`,
    `    // Suppress Hydration issue by displaying generic zeros/empty until mounted, allowing the DOM to match the server output
    if (!isMounted) return <div className="sr-only">Loading timer...</div>;`
);

timerStr = timerStr.replace(
    `            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "-100px", once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-5xl w-full"
            >`,
    `            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-5xl w-full"
            >`
);

fs.writeFileSync('src/components/wedding/CountdownTimer.tsx', timerStr);
console.log('Success!');
