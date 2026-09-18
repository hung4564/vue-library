import fs from 'fs';
import path from 'path';

const ROOT = 'g:/code/0-library/vue-library';
const SCAN_DIRS = [
  'libs/share',
  'libs/draggable',
  'libs/vue/draggable',
  'libs/react/draggable',
  'apps/vue/demo-draggable',
  'apps/react/demo-draggable',
];

const EXT = new Set(['.ts', '.tsx', '.vue', '.js', '.jsx', '.css']);
const SKIP = [
  /node_modules/,
  /\/deploy\//,
  /\.spec\.(ts|tsx)$/,
  /\.test\.(ts|tsx)$/,
  /jest\.config/,
  /vite\.config/,
  /vue-shims\.d\.ts$/,
  /shims-vue\.d\.ts$/,
];

const norm = (p) => p.replace(/\\/g, '/');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', 'dist'].includes(ent.name)) continue;
      walk(p, out);
    } else if (EXT.has(path.extname(ent.name))) out.push(norm(p));
  }
  return out;
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('@/')) return null;
  const fromDir = path.dirname(fromFile);
  const target = spec.startsWith('@/')
    ? norm(path.join(fromFile.split('/src')[0] + '/src', spec.slice(2)))
    : norm(path.join(fromDir, spec));
  for (const e of ['', '.ts', '.tsx', '.vue', '.js', '.jsx', '.css', '/index.ts', '/index.tsx', '/index.vue']) {
    const c = target + e;
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const allFiles = [];
(function walkAll(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', 'dist', '.nx', 'deploy'].includes(ent.name)) continue;
      walkAll(p);
    } else {
      const ext = path.extname(ent.name);
      if (['.ts', '.tsx', '.vue', '.js', '.jsx', '.css', '.md', '.scss', '.html', '.json'].includes(ext)) {
        allFiles.push(norm(p));
      }
    }
  }
})(ROOT);

const scanFiles = [];
for (const d of SCAN_DIRS) scanFiles.push(...walk(path.join(ROOT, d)));
const filtered = scanFiles.filter((f) => !SKIP.some((p) => p.test(f)));

const pkgExportFiles = new Set();
const packageExports = new Map();
function collectPkgExports(pkgPath) {
  const pkgDir = norm(path.dirname(pkgPath));
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const ex = new Set();
  const add = (rel) => rel && ex.add(norm(path.join(pkgDir, rel)));
  add(pkg.main);
  add(pkg.module);
  add(pkg.types);
  const walkExp = (obj) => {
    if (typeof obj === 'string') add(obj);
    else if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        if (['types', 'import', 'require', 'default'].includes(k) && typeof v === 'string') add(v);
        else walkExp(v);
      }
    }
  };
  if (pkg.exports) walkExp(pkg.exports);
  // source-side export entry files
  for (const rel of ex) {
    pkgExportFiles.add(rel);
    const srcAlt = rel.replace(/\/index\.(js|d\.ts)$/, '/src/index.ts').replace(/\.css$/, '/src/style.css');
    if (fs.existsSync(srcAlt)) pkgExportFiles.add(srcAlt);
  }
  packageExports.set(pkgDir, ex);
}

for (const d of SCAN_DIRS) {
  const bases = [path.join(ROOT, d)];
  if (fs.existsSync(path.join(ROOT, d))) {
    for (const sub of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
      if (sub.isDirectory()) bases.push(path.join(ROOT, d, sub.name));
    }
  }
  for (const b of bases) {
    const pp = path.join(b, 'package.json');
    if (fs.existsSync(pp)) collectPkgExports(pp);
  }
}

const importedBy = new Map();
const addImport = (importer, target) => {
  if (!target) return;
  if (!importedBy.has(target)) importedBy.set(target, new Set());
  importedBy.get(target).add(importer);
};

const importRes = [
  /import\s+(?:type\s+)?(?:[\w*\s{},]+\s+from\s+)?['"]([^'"]+)['"]/g,
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /@import\s+['"]([^'"]+)['"]/g,
  /import\s+['"]([^'"]+)['"]/g,
];

for (const file of allFiles) {
  if (!/\.(ts|tsx|vue|js|jsx|css|md|scss)$/.test(file)) continue;
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  for (const re of importRes) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const spec = m[1];
      if (spec.startsWith('.') || spec.startsWith('@/')) addImport(file, resolveImport(file, spec));
    }
  }
}

const reExported = new Set();
function followBarrels(file, visited = new Set()) {
  if (!file || visited.has(file) || !fs.existsSync(file)) return;
  visited.add(file);
  reExported.add(file);
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    return;
  }
  for (const re of [/export\s+\*\s+from\s+['"]([^'"]+)['"]/g, /export\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g]) {
    let m;
    while ((m = re.exec(content)) !== null) followBarrels(resolveImport(file, m[1]), visited);
  }
}
for (const f of filtered) {
  if (/index\.(ts|tsx)$/.test(path.basename(f))) followBarrels(f);
}

const entryPoints = new Set(
  filtered.filter(
    (f) =>
      /\/(main|index)\.(ts|tsx|js|jsx)$/.test(f) &&
      (f.includes('/apps/') || /\/src\/index\.(ts|tsx)$/.test(f)),
  ),
);

const orphans = [];
for (const file of filtered) {
  if (entryPoints.has(file)) continue;
  if (pkgExportFiles.has(file)) continue;
  if (reExported.has(file)) continue;
  const importers = importedBy.get(file);
  if (!importers || importers.size === 0) orphans.push(file);
}

console.log('=== ORPHANS (md/scss imports, excl pkg exports) ===');
orphans.sort().forEach((f) => console.log(f));
console.log('TOTAL', orphans.length);

// Unused exports in demo apps
const demoDirs = [
  'apps/vue/demo-draggable/src',
  'apps/react/demo-draggable/src',
];
const exportRe = /export\s+(?:type\s+)?(?:declare\s+)?(?:const|function|class|interface|type|enum)\s+(\w+)/g;
const unusedExports = [];
for (const d of demoDirs) {
  const dir = path.join(ROOT, d);
  const files = walk(dir).filter((f) => /\.(ts|tsx)$/.test(f) && !SKIP.some((p) => p.test(f)));
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const base = path.basename(file, path.extname(file));
    const exports = [];
    let m;
    exportRe.lastIndex = 0;
    while ((m = exportRe.exec(content)) !== null) exports.push(m[1]);
    // also export { X }
    for (const em of content.matchAll(/export\s+\{([^}]+)\}/g)) {
      for (const part of em[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name) exports.push(name);
      }
    }
    for (const sym of [...new Set(exports)]) {
      if (sym === 'default') continue;
      let refs = 0;
      for (const other of files) {
        if (other === file) continue;
        const oc = fs.readFileSync(other, 'utf8');
        if (new RegExp(`\\b${sym}\\b`).test(oc)) refs++;
      }
      // also check vue files
      for (const other of walk(dir).filter((f) => f.endsWith('.vue'))) {
        const oc = fs.readFileSync(other, 'utf8');
        if (new RegExp(`\\b${sym}\\b`).test(oc)) refs++;
      }
      if (refs === 0) {
        unusedExports.push({ file, sym });
      }
    }
  }
}

console.log('\n=== UNUSED DEMO EXPORTS ===');
for (const u of unusedExports) console.log(`${u.file} :: ${u.sym}`);
