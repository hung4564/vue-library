/**
 * After a fixed-group version bump, rewrite workspace consumers' dep ranges
 * to match the new line (Nx does not update peerDependencies across groups).
 *
 * Range style matches nx.json versionPrefix "^" → ^MAJOR.0.0 (accept MAJOR.x.x)
 *
 * Usage:
 *   node scripts/sync-workspace-peers.js draggable
 *   node scripts/sync-workspace-peers.js map
 *   node scripts/sync-workspace-peers.js draggable --dry-run
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const group = args.find((a) => !a.startsWith('-'));

const GROUPS = {
  draggable: {
    packages: [
      '@hungpvq/draggable',
      '@hungpvq/vue-draggable',
      '@hungpvq/react-draggable',
    ],
    leadPkg: 'libs/draggable/core/package.json',
  },
  map: {
    packages: [
      '@hungpvq/map-core',
      '@hungpvq/map-dataset',
      '@hungpvq/map-draw',
      '@hungpvq/vue-map-core',
      '@hungpvq/vue-map-dataset',
      '@hungpvq/vue-map-draw',
      '@hungpvq/vue-map-devtools',
      '@hungpvq/react-map-core',
      '@hungpvq/react-map-dataset',
      '@hungpvq/react-map-draw',
      '@hungpvq/react-map-devtools',
    ],
    leadPkg: 'libs/map-core/core/package.json',
  },
};

const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

if (!group || !GROUPS[group]) {
  console.error(
    'Usage: node scripts/sync-workspace-peers.js <draggable|map> [--dry-run]',
  );
  process.exit(1);
}

const cfg = GROUPS[group];
const { version } = JSON.parse(
  fs.readFileSync(path.join(root, cfg.leadPkg), 'utf8'),
);
const [major] = version.split('.');
if (major == null) {
  throw new Error(`Unexpected version in ${cfg.leadPkg}: ${version}`);
}
const range = `^${major}.0.0`;
const names = new Set(cfg.packages);

function walkPackageJson(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      ent.name === 'node_modules' ||
      ent.name === '.git' ||
      ent.name === 'dist'
    ) {
      continue;
    }
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walkPackageJson(abs, out);
    else if (ent.name === 'package.json') out.push(abs);
  }
  return out;
}

function syncFile(abs) {
  const raw = fs.readFileSync(abs, 'utf8');
  let pkg;
  try {
    pkg = JSON.parse(raw);
  } catch {
    return false;
  }

  // Do not rewrite the package's own name entry (N/A in dep fields)
  let changed = false;
  for (const field of DEP_FIELDS) {
    const block = pkg[field];
    if (!block || typeof block !== 'object') continue;
    for (const name of Object.keys(block)) {
      if (!names.has(name)) continue;
      if (block[name] === range) continue;
      block[name] = range;
      changed = true;
    }
  }
  if (!changed) return false;

  const next = `${JSON.stringify(pkg, null, 2)}\n`;
  const rel = path.relative(root, abs).replace(/\\/g, '/');
  if (dryRun) {
    console.log(`dry-run would update: ${rel} → ${range}`);
  } else {
    fs.writeFileSync(abs, next);
    console.log(`updated: ${rel} → ${range}`);
  }
  return true;
}

const files = [
  ...walkPackageJson(path.join(root, 'libs')),
  ...walkPackageJson(path.join(root, 'apps')),
];

let n = 0;
for (const f of files) {
  if (syncFile(f)) n++;
}

console.log(
  `sync-workspace-peers (${group}): version=${version} range=${range} files=${n}${dryRun ? ' (dry-run)' : ''}`,
);
