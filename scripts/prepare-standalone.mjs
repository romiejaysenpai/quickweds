import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const standaloneDir = path.join(root, '.next', 'standalone');

function findStandaloneServerDir() {
  const rootServer = path.join(standaloneDir, 'server.js');
  if (fs.existsSync(rootServer)) return standaloneDir;

  const entries = fs.readdirSync(standaloneDir, { withFileTypes: true });
  const appEntry = entries.find((entry) => {
    return entry.isDirectory() && fs.existsSync(path.join(standaloneDir, entry.name, 'server.js'));
  });

  return appEntry ? path.join(standaloneDir, appEntry.name) : standaloneDir;
}

if (!fs.existsSync(standaloneDir)) {
  console.warn('Standalone output not found. Skipping standalone asset preparation.');
  process.exit(0);
}

const serverDir = findStandaloneServerDir();
const publicDir = path.join(root, 'public');

const copies = [
  {
    from: publicDir,
    to: path.join(serverDir, 'public'),
    // Historical local uploads are intentionally not deployable. User media
    // is served from Supabase Storage and this avoids copying almost 1 GB of
    // ignored development files into a standalone artifact.
    filter: (source) => {
      const [topLevel] = path.relative(publicDir, source).split(path.sep);
      return topLevel !== 'uploads';
    },
  },
  {
    from: path.join(root, '.next', 'static'),
    to: path.join(serverDir, '.next', 'static'),
  },
];

for (const { from, to, filter } of copies) {
  if (!fs.existsSync(from)) {
    console.warn(`Missing source asset directory: ${path.relative(root, from)}`);
    continue;
  }

  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true, filter });
  console.log(`Copied ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}
