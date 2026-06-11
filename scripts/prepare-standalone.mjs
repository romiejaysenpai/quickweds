import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const standaloneDir = path.join(root, '.next', 'standalone');

const copies = [
  {
    from: path.join(root, 'public'),
    to: path.join(standaloneDir, 'public'),
  },
  {
    from: path.join(root, '.next', 'static'),
    to: path.join(standaloneDir, '.next', 'static'),
  },
];

if (!fs.existsSync(standaloneDir)) {
  console.warn('Standalone output not found. Skipping standalone asset preparation.');
  process.exit(0);
}

for (const { from, to } of copies) {
  if (!fs.existsSync(from)) {
    console.warn(`Missing source asset directory: ${path.relative(root, from)}`);
    continue;
  }

  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
  console.log(`Copied ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}
