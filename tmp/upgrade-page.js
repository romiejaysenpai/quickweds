const fs = require('fs');

const FILE_PATH = 'src/app/w/[id]/page.tsx';
let str = fs.readFileSync(FILE_PATH, 'utf8');

// 1. Inject PremiumBackgroundLayer Import
if (!str.includes('PremiumBackgroundLayer')) {
    str = str.replace(
        "import HeroEnhancer from '@/components/wedding/HeroEnhancer';",
        "import HeroEnhancer from '@/components/wedding/HeroEnhancer';\nimport PremiumBackgroundLayer from '@/components/wedding/PremiumBackgroundLayer';"
    );
}

// 2. Replace the static animated background Orbs block with PremiumBackgroundLayer
const oldBgOrbsStart = str.indexOf('{/* Animated Background Orbs */}');
const nextSuspenseStart = str.indexOf('{/* Premium Global Hero Upgrades */}');
if (oldBgOrbsStart !== -1 && nextSuspenseStart !== -1) {
    const stringToReplace = str.substring(oldBgOrbsStart, nextSuspenseStart);
    str = str.replace(stringToReplace, `{/* Premium Video/Gradient Global Background */}\n            <PremiumBackgroundLayer wedding={wedding} />\n\n            `);
}

// 3. Typographic Fluidity Refactoring (Mobile First strictness)
// We only target naked text sizes, not ones prefixed with sm:, md:, or lg:
const r = (find, replace) => {
    str = str.replace(new RegExp(`(?<!\\w:)${find.replace('\\[', '\\[').replace('\\]', '\\]')}`, 'g'), replace);
};

r('text-6xl', 'text-4xl md:text-6xl');
r('text-7xl', 'text-5xl md:text-7xl');
r('text-8xl', 'text-5xl md:text-7xl lg:text-8xl');
// Use manual array instead of tricky regex escaping for custom vars to be safe 
str = str.replace(/(?<!\w:)text-\[12vw\]/g, 'text-6xl md:text-[12vw]');
str = str.replace(/(?<!\w:)text-\[15vw\]/g, 'text-5xl md:text-[12vw] lg:text-[15vw]');
str = str.replace(/(?<!\w:)text-\[18vw\]/g, 'text-6xl md:text-[14vw] lg:text-[18vw]');

fs.writeFileSync(FILE_PATH, str);
console.log('Typography and Background injection complete!');
