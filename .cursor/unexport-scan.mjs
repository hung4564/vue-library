import fs from 'fs';
import path from 'path';

const ROOT = 'g:/code/0-library/vue-library';
const APP_DIRS = [
  'apps/vue/demo-map/src',
  'apps/react/demo-map/src',
  'apps/vue/demo-draggable/src',
  'apps/react/demo-draggable/src',
];
const norm = (p) => p.replace(/\\/g, '/');
const SKIP = /(\.spec\.|\.test\.|test-setup|demo\.vue$|styles\.(css|scss)$|vue-shims|shims-vue)/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|vue)$/.test(ent.name)) out.push(norm(p));
  }
  return out;
}

function extractExports(content, file) {
  const syms = [];
  const patterns = [
    /export\s+(?:type\s+)?(?:declare\s+)?(?:const|function|class|interface|type|enum|async function)\s+(\w+)/g,
    /export\s+\{([^}]+)\}/g,
  ];
  for (const re of patterns) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(content))) {
      if (re.source.includes('\\{')) {
        for (const part of m[1].split(',')) {
          const name = part.trim().split(/\s+as\s+/).pop()?.trim();
          if (name && name !== 'default') syms.push(name);
        }
      } else syms.push(m[1]);
    }
  }
  if (file.endsWith('.vue')) {
    for (const m of content.matchAll(/defineOptions\s*\(\s*\{[^}]*name:\s*['"](\w+)['"]/g)) syms.push(m[1]);
  }
  return [...new Set(syms)];
}

const results = [];
for (const d of APP_DIRS) {
  const dir = path.join(ROOT, d);
  const files = walk(dir).filter((f) => !SKIP.test(f));
  const corpus = files.map((f) => ({ f, c: fs.readFileSync(f, 'utf8') }));
  for (const { f, c } of corpus) {
    if (!/\.(ts|tsx|vue)$/.test(f)) continue;
    for (const sym of extractExports(c, f)) {
      let cross = 0;
      for (const { f: other, c: oc } of corpus) {
        if (other === f) continue;
        if (new RegExp(`\\b${sym}\\b`).test(oc)) {
          cross++;
          break;
        }
      }
      if (cross === 0) {
        const localUses = (c.replace(/export\s+/g, '').match(new RegExp(`\\b${sym}\\b`, 'g')) || []).length;
        if (localUses > 1) results.push({ file: f, sym, localUses });
      }
    }
  }
}

console.log('=== SAFE_TO_UNEXPORT ===');
for (const r of results.sort((a, b) => a.file.localeCompare(b.file))) {
  console.log(`${r.file} :: ${r.sym}`);
}
console.log('TOTAL', results.length);
