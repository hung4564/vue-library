import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['libs', 'apps', 'docs'];
const EXT = new Set(['.ts', '.tsx', '.mts', '.js', '.jsx', '.vue', '.md']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.nx', 'coverage', '.git']);

const files = [];
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (EXT.has(path.extname(e.name))) files.push(p);
    }
  })(root);
}

const LINE =
  /^([ \t]*)(import|export)( type)? \{ ([^{}]*?) \} from ('|")(@hungpvq\/map-core(?:\/[a-z]+)?)\5(;?)$/;

let touched = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes('@hungpvq/map-core')) continue;
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const lines = src.split(/\r?\n/);
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length <= 80) continue;
    const m = LINE.exec(lines[i]);
    if (!m) continue;
    const [, indent, kw, typeKw, inner, q, spec, semi] = m;
    const names = inner.split(',').map((s) => s.trim()).filter(Boolean);
    lines[i] = [
      `${indent}${kw}${typeKw ?? ''} {`,
      ...names.map((n) => `${indent}  ${n},`),
      `${indent}} from ${q}${spec}${q}${semi}`,
    ].join(eol);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, lines.join(eol));
    touched++;
  }
}
console.log('wrapped in files:', touched);
