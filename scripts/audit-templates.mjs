import fs from 'fs';
import path from 'path';

const templatesDir = 'src/components/templates';
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('Template.tsx'));

let markdown = '# Template Audit\n\n';

for (const file of files) {
  const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
  
  // Extract the main div or wrapper class
  const mainWrapperMatch = content.match(/<div className="([^"]+)"/);
  const wrapperClass = mainWrapperMatch ? mainWrapperMatch[1] : 'Not found';

  // Extract Hero Section roughly (from <section to </section>)
  const heroMatch = content.match(/<section[^>]*>([\s\S]*?)<\/section>/);
  const heroContent = heroMatch ? heroMatch[0] : 'No section found';

  markdown += `## ${file}\n`;
  markdown += `**Wrapper Classes:** \`${wrapperClass}\`\n\n`;
  markdown += `**Hero Section:**\n\`\`\`tsx\n${heroContent}\n\`\`\`\n\n`;
}

fs.writeFileSync('audit_results.md', markdown);
console.log('Done');
