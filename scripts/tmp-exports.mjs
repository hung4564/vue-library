import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('libs/map-core/core/src');
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith('.ts') && !p.endsWith('.spec.ts')) files.push(p);
  }
})(root);

const out = {};
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const names = new Set();
  const re =
    /^export\s+(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(?:function\s*\*|const|let|var|function|class|interface|type|enum)\s+([A-Za-z0-9_$]+)/gm;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  const re2 = /^export\s*\{([^}]*)\}(?:\s*from\s*['"]([^'"]+)['"])?/gms;
  while ((m = re2.exec(src))) {
    for (const part of m[1].split(',')) {
      const t = part.trim().replace(/^type\s+/, '');
      if (!t) continue;
      const as = t.split(/\s+as\s+/);
      names.add((as[1] ?? as[0]).trim());
    }
  }
  const rel = path.relative(root, f).replace(/\\/g, '/');
  out[rel] = [...names].sort();
}
fs.writeFileSync('scripts/tmp-exports.json', JSON.stringify(out, null, 2));
console.log('files:', files.length);
