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
const SKIP_PATTERNS = [
  /node_modules/,
  /\/deploy\//,
  /\.spec\.(ts|tsx)$/,
  /\.test\.(ts|tsx)$/,
  /jest\.config/,
  /vite\.config/,
  /vue-shims\.d\.ts$/,
  /shims-vue\.d\.ts$/,
];

function norm(p) {
  return p.replace(/\\/g, '/');
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist') continue;
      walk(p, files);
    } else {
      const ext = path.extname(ent.name);
      if (EXT.has(ext)) files.push(norm(p));
    }
  }
  return files;
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('@/')) return null;
  const fromDir = path.dirname(fromFile);
  let target;
  if (spec.startsWith('@/')) {
    const srcRoot = fromFile.split('/src')[0] + '/src';
    target = norm(path.join(srcRoot, spec.slice(2)));
  } else {
    target = norm(path.join(fromDir, spec));
  }
  const exts = ['', '.ts', '.tsx', '.vue', '.js', '.jsx', '.css', '/index.ts', '/index.tsx', '/index.vue', '/index.js'];
  for (const e of exts) {
    const c = target + e;
    if (fs.existsSync(c)) return c;
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
      if (['.ts', '.tsx', '.vue', '.js', '.jsx', '.css', '.json', '.html'].includes(ext)) {
        allFiles.push(norm(p));
      }
    }
  }
}
walkAll(ROOT);

const scanFiles = [];
for (const d of SCAN_DIRS) scanFiles.push(...walk(path.join(ROOT, d)));
const filtered = scanFiles.filter((f) => !SKIP_PATTERNS.some((p) => p.test(f)));

const packageExports = new Map();
function collectPkgExports(pkgPath) {
  const pkgDir = norm(path.dirname(pkgPath));
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const exports = new Set();
  const add = (rel) => {
    if (rel) exports.add(norm(path.join(pkgDir, rel)));
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
  packageExports.set(pkgDir, exports);
}

function findPackageJsonDirs(baseDir) {
  const dirs = [baseDir];
  if (fs.existsSync(baseDir)) {
    for (const sub of fs.readdirSync(baseDir, { withFileTypes: true })) {
      if (sub.isDirectory()) dirs.push(path.join(baseDir, sub.name));
    }
  }
  return dirs;
}

for (const d of SCAN_DIRS) {
  for (const dir of findPackageJsonDirs(path.join(ROOT, d))) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) collectPkgExports(pkgPath);
  }
}

const allExports = new Set();
for (const s of packageExports.values()) for (const e of s) allExports.add(e);

const entryPoints = new Set([
  ...filtered.filter(
    (f) =>
      /\/(main|index)\.(ts|tsx|js|jsx)$/.test(f) &&
      (f.includes('/apps/') || /\/src\/index\.(ts|tsx)$/.test(f)),
  ),
  ...allExports,
]);

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

const importRegexes = [
  /import\s+(?:type\s+)?(?:[\w*\s{},]+\s+from\s+)?['"]([^'"]+)['"]/g,
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /@import\s+['"]([^'"]+)['"]/g,
  /import\s+['"]([^'"]+)['"]/g,
];

for (const file of allFiles) {
  if (!/\.(ts|tsx|vue|js|jsx|css)$/.test(file)) continue;
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  for (const re of importRegexes) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const spec = m[1];
      if (spec.startsWith('.') || spec.startsWith('@/')) {
        addImport(file, resolveImport(file, spec));
      }
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
  for (const re of [/export\s+\*\s+from\s+['"]([^'"]+)['"]/g, /export\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g]) {
    let m;
    while ((m = re.exec(content)) !== null) {
      followBarrels(resolveImport(file, m[1]), visited);
    }
  }
}

for (const exp of allExports) followBarrels(exp);
for (const f of filtered) {
  if (/index\.(ts|tsx)$/.test(path.basename(f))) followBarrels(f);
}

const orphans = [];
for (const file of filtered) {
  if (entryPoints.has(file)) continue;
  if (publicApiFiles.has(file)) continue;
  if (reExported.has(file)) continue;
  const importers = importedBy.get(file);
  if (!importers || importers.size === 0) {
    orphans.push(file);
  }
}

console.log('=== ORPHAN FILES ===');
for (const f of orphans.sort()) console.log(f);
console.log('TOTAL:', orphans.length);
