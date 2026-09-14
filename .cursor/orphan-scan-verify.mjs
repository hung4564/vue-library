import fs from 'fs';
import path from 'path';

const ROOT = 'g:/code/0-library/vue-library';
const SCAN_DIRS = [
  'libs/ui/core',
  'libs/share',
  'libs/map-core',
  'libs/vue',
  'libs/react',
  'apps/vue/demo-map',
  'apps/react/demo-map',
  'apps/vue/demo-draggable',
  'apps/react/demo-draggable',
];

const SKIP_FILE = [
  /node_modules/,
  /\/deploy\//,
  /\.spec\.(ts|tsx)$/,
  /\.test\.(ts|tsx)$/,
  /public-api\.spec\.ts$/,
  /\/docs\/.*demo\.vue$/,
  /\/style\.css$/,
  /test-setup\.ts$/,
  /vue-shims\.d\.ts$/,
  /shims-vue\.d\.ts$/,
  /vite\.config/,
  /jest\.config/,
];

const norm = (p) => p.replace(/\\/g, '/');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', 'dist'].includes(ent.name)) continue;
      walk(p, out);
    } else if (/\.(ts|tsx|vue|js|jsx|css)$/.test(ent.name)) out.push(norm(p));
  }
  return out;
}

const allTextFiles = [];
function walkAll(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', 'dist', '.nx', 'deploy'].includes(ent.name)) continue;
      walkAll(p);
    } else if (/\.(ts|tsx|vue|js|jsx|css|scss|html|json|md)$/.test(ent.name)) {
      allTextFiles.push(norm(p));
    }
  }
}
walkAll(ROOT);

const corpus = allTextFiles
  .filter((f) => !f.includes('/deploy/') && !f.includes('node_modules'))
  .map((f) => {
    try {
      return fs.readFileSync(f, 'utf8');
    } catch {
      return '';
    }
  })
  .join('\n');

const scanFiles = [];
for (const d of SCAN_DIRS) scanFiles.push(...walk(path.join(ROOT, d)));
const candidates = scanFiles.filter((f) => !SKIP_FILE.some((p) => p.test(f)));

function refCount(file) {
  const rel = file.replace(`${ROOT}/`, '');
  const base = path.basename(file, path.extname(file));
  const dirImport = './' + base;
  const patterns = [
    rel,
    rel.replace(/^libs\//, '@hungpvq/'),
    base,
    dirImport,
    dirImport.replace(/^\.\//, '../' + path.basename(path.dirname(file)) + '/'),
  ];
  // Also check partial path segments commonly used in imports
  const srcIdx = rel.indexOf('/src/');
  if (srcIdx >= 0) {
    patterns.push(rel.slice(srcIdx + 5).replace(/\.(ts|tsx|vue|js|jsx|css)$/, ''));
  }
  let count = 0;
  for (const p of [...new Set(patterns)]) {
    if (!p || p.length < 3) continue;
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (re.test(corpus)) count++;
  }
  return count;
}

const orphans = [];
for (const file of candidates) {
  const base = path.basename(file);
  if (/^(main|index)\.(ts|tsx|js|jsx)$/.test(base)) continue;
  if (file.endsWith('/worker-entry.ts')) continue;
  if (file.endsWith('/vite.ts')) continue;
  // skip package.json referenced css in html
  if (base === 'styles.css' && corpus.includes('/src/styles.css')) continue;

  const refs = refCount(file);
  if (refs === 0) orphans.push({ file, note: 'zero text refs' });
}

console.log('=== HIGH-CONFIDENCE CANDIDATES (zero refs in corpus) ===');
for (const o of orphans.sort((a, b) => a.file.localeCompare(b.file))) {
  console.log(o.file);
}
console.log('TOTAL', orphans.length);
