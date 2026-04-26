const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src/components/templates');

const files = fs.readdirSync(dir).filter(f => f.endsWith('Template.tsx'));

const tags = ['VideoSection', 'BioSection', 'DetailsSection', 'CountdownTimer', 'TimelineSection', 'GallerySection', 'GiftSection', 'SharedNewSections'];

files.forEach(file => {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');

    tags.forEach(tag => {
        const regex = new RegExp(`<${tag}\\b([^>]*?)(\\/?)>`, 'g');
        content = content.replace(regex, (m, p1, p2) => {
            if (!p1.includes('id=')) {
                let idVal = tag.toLowerCase().replace('section', '');
                if (tag === 'SharedNewSections') idVal = 'additional';
                if (tag === 'CountdownTimer') idVal = 'countdown';
                return `<${tag} id="${idVal}"${p1}${p2}>`;
            }
            return m;
        });
    });

    fs.writeFileSync(p, content);
});
console.log('Fixed IDs in templates again');
