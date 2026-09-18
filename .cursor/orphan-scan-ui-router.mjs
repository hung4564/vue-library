import fs from 'fs';
import path from 'path';

const ROOT = 'g:/code/0-library/vue-library';
const SCAN_DIRS = [
  'libs/ui/core',
  'libs/router',
  'libs/share/shared',
  'libs/share/store',
  'libs/share/file',
  'libs/share/log',
  'libs/map-core/map-draw/src',
  'libs/vue/map-draw',
  'libs/react/map-draw',
  'libs/vue/map-devtools',
  'libs/react/map-devtools',
  'apps/vue/demo-map-e2e',
  'apps/react/demo-map-e2e',
];

const EXT = new Set(['.ts', '.tsx', '.vue', '.js', '.jsx', '.css', '.scss']);
const SKIP = [
  /node_modules/,
  /\/deploy\//,
  /\.spec\.(ts|tsx)$/,
  /\.test\.(ts|tsx)$/,
  /jest\.config/,
  /vite\.config/,
  /vue-shims\.d\.ts$/,
  /shims-vue\.d\.ts$/,
  /public-api\.spec\.ts$/,
  /\/demo\.vue$/,
  /test-setup\.ts$/,
  /playwright\.config/,
];

const norm = (p) => p.replace(/\\/g, '/');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', 'dist', '.nx'].includes(ent.name)) continue;
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
  for (const e of [
    '',
    '.ts',
    '.tsx',
    '.vue',
    '.js',
    '.jsx',
    '.css',
    '.scss',
    '/index.ts',
    '/index.tsx',
    '/index.vue',
    '/index.js',
  ]) {
    const c = target + e;
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function resolveJsImport(fromFile, spec) {
  const resolved = resolveImport(fromFile, spec);
  if (resolved) return resolved;
  if (spec.startsWith('.') && spec.endsWith('.js')) {
    return resolveImport(fromFile, spec.slice(0, -3));
  }
  return null;
}

const allFiles = [];
function walkAll(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', 'dist', '.nx', 'deploy'].includes(ent.name)) continue;
      walkAll(p);
    } else {
      const ext = path.extname(ent.name);
      if (['.ts', '.tsx', '.vue', '.js', '.jsx', '.css', '.scss', '.json', '.html'].includes(ext)) {
        allFiles.push(norm(p));
      }
    }
  }
}
walkAll(ROOT);

const scanFiles = [];
for (const d of SCAN_DIRS) scanFiles.push(...walk(path.join(ROOT, d)));
const filtered = scanFiles.filter((f) => !SKIP.some((p) => p.test(f)));

const packageExports = new Map();
const pkgExportFiles = new Set();
function collectPkgExports(pkgPath) {
  const pkgDir = norm(path.dirname(pkgPath));
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const ex = new Set();
  const add = (rel) => {
    if (!rel) return;
    const full = norm(path.join(pkgDir, rel));
    ex.add(full);
    pkgExportFiles.add(full);
    const srcAlt = full.replace(/\/index\.(js|d\.ts)$/, '/src/index.ts').replace(/\.css$/, '/src/style.css');
    if (fs.existsSync(srcAlt)) pkgExportFiles.add(srcAlt);
  };
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
  packageExports.set(pkgDir, ex);
}

function findPkgDirs(baseDir) {
  const dirs = [baseDir];
  if (fs.existsSync(baseDir)) {
    for (const sub of fs.readdirSync(baseDir, { withFileTypes: true })) {
      if (sub.isDirectory()) dirs.push(path.join(baseDir, sub.name));
    }
  }
  return dirs;
}

for (const d of SCAN_DIRS) {
  for (const dir of findPkgDirs(path.join(ROOT, d))) {
    const pp = path.join(dir, 'package.json');
    if (fs.existsSync(pp)) collectPkgExports(pp);
  }
}

const publicApiFiles = new Set();
for (const f of allFiles) {
  if (!f.endsWith('public-api.spec.ts')) continue;
  const content = fs.readFileSync(f, 'utf8');
  for (const m of content.matchAll(/['"](\.\.?\/[^'"]+)['"]/g)) {
    const resolved = resolveImport(f, m[1]);
    if (resolved) publicApiFiles.add(resolved);
  }
  publicApiFiles.add(f);
}

const importedBy = new Map();
function addImport(importer, target) {
  if (!target) return;
  if (!importedBy.has(target)) importedBy.set(target, new Set());
  importedBy.get(target).add(importer);
}

const importRes = [
  /import\s+(?:type\s+)?(?:[\w*\s{},]+\s+from\s+)?['"]([^'"]+)['"]/g,
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /@import\s+['"]([^'"]+)['"]/g,
  /import\s+['"]([^'"]+)['"]/g,
];

for (const file of allFiles) {
  if (!/\.(ts|tsx|vue|js|jsx|css|scss)$/.test(file)) continue;
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
      if (spec.startsWith('.') || spec.startsWith('@/')) addImport(file, resolveJsImport(file, spec));
    }
  }
}

const pkgNameToDir = {};
for (const [pkgDir] of packageExports) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
    if (pkg.name) pkgNameToDir[pkg.name] = pkgDir;
  } catch {
    /* ignore */
  }
}

for (const file of allFiles) {
  if (!/\.(ts|tsx|vue|js|jsx)$/.test(file)) continue;
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  for (const [name, pkgDir] of Object.entries(pkgNameToDir)) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`from\\s+['"]${escaped}(?:/([^'"]+))?['"]`, 'g');
    let m;
    while ((m = re.exec(content)) !== null) {
      const sub = m[1];
      if (sub) {
        for (const base of [path.join(pkgDir, 'src', sub), path.join(pkgDir, sub)]) {
          for (const e of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
            const full = norm(base + e);
            if (fs.existsSync(full)) addImport(file, full);
          }
        }
      } else {
        for (const exp of packageExports.get(pkgDir) || []) addImport(file, exp);
      }
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
  for (const re of [
    /export\s+\*\s+from\s+['"]([^'"]+)['"]/g,
    /export\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g,
  ]) {
    let m;
    while ((m = re.exec(content)) !== null) followBarrels(resolveJsImport(file, m[1]), visited);
  }
}
for (const f of pkgExportFiles) followBarrels(f);
for (const f of filtered) {
  if (/index\.(ts|tsx)$/.test(path.basename(f))) followBarrels(f);
}

const entryPoints = new Set([
  ...filtered.filter(
    (f) =>
      /\/(main|index)\.(ts|tsx|js|jsx)$/.test(f) &&
      (f.includes('/apps/') || /\/src\/index\.(ts|tsx)$/.test(f)),
  ),
  ...pkgExportFiles,
]);

const orphans = [];
for (const file of filtered) {
  if (entryPoints.has(file)) continue;
  if (publicApiFiles.has(file)) continue;
  if (reExported.has(file)) continue;
  const importers = importedBy.get(file);
  if (!importers || importers.size === 0) orphans.push(file);
}

console.log('=== ORPHANS ===');
for (const f of orphans.sort()) console.log(f);
console.log('TOTAL', orphans.length);
