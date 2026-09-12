/**
 * Sync hardcoded SemVer strings in draggable docs to match package.json.
 *
 * Markers (replace inner text only):
 *   <!-- docs-ver:draggable.line -->1.1.x<!-- /docs-ver:draggable.line -->
 *   <!-- docs-ver:draggable.peer -->^1.0.0<!-- /docs-ver:draggable.peer -->
 *   <!-- docs-ver:draggable.exact -->1.1.0<!-- /docs-ver:draggable.exact -->
 *
 * Usage:
 *   node scripts/sync-draggable-docs-version.js
 *   node scripts/sync-draggable-docs-version.js --dry-run
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

const pkgPath = path.join(root, 'libs/draggable/core/package.json');
const { version } = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const [major, minor] = version.split('.');
if (major == null || minor == null) {
  throw new Error(`Unexpected version in ${pkgPath}: ${version}`);
}

const values = {
  line: `${major}.x.x`,
  peer: `^${major}.0.0`,
  exact: version,
};

/** @type {string[]} */
const files = [
  'libs/draggable/README.md',
  'libs/draggable/core/docs/index.md',
  'libs/draggable/core/docs/stable-api.md',
  'libs/draggable/core/docs/testing.md',
  'libs/draggable/core/docs/releases/index.md',
  'libs/vue/draggable/README.md',
  'libs/react/draggable/README.md',
  'libs/draggable/core/src/public-api.spec.ts',
  '.cursor/skills/draggable-semver-api/SKILL.md',
  '.cursor/skills/vue-library-overview/SKILL.md',
];

const kinds = Object.keys(values);

function syncFile(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.warn(`skip (missing): ${rel}`);
    return false;
  }
  let text = fs.readFileSync(abs, 'utf8');
  let changed = false;
  for (const kind of kinds) {
    const open = `<!-- docs-ver:draggable.${kind} -->`;
    const close = `<!-- /docs-ver:draggable.${kind} -->`;
    const re = new RegExp(
      `${escapeReg(open)}[\\s\\S]*?${escapeReg(close)}`,
      'g',
    );
    const next = `${open}${values[kind]}${close}`;
    const updated = text.replace(re, next);
    if (updated !== text) {
      text = updated;
      changed = true;
    }
  }
  if (!changed) {
    console.log(`unchanged: ${rel}`);
    return false;
  }
  if (dryRun) {
    console.log(`dry-run would update: ${rel}`);
    return true;
  }
  fs.writeFileSync(abs, text);
  console.log(`updated: ${rel}`);
  return true;
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

console.log(
  `sync-draggable-docs-version → line=${values.line} peer=${values.peer} exact=${values.exact}`,
);
let n = 0;
for (const f of files) {
  if (syncFile(f)) n += 1;
}
console.log(dryRun ? `dry-run: ${n} file(s)` : `done: ${n} file(s) updated`);
