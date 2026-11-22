/**
 * Pack built dist packages into .tgz files for copying into another project.
 *
 * Usage:
 *   node scripts/pack-dist.js draggable-vue
 *   node scripts/pack-dist.js draggable-react
 *   node scripts/pack-dist.js draggable
 *   node scripts/pack-dist.js map-vue
 *   node scripts/pack-dist.js map-react
 *   node scripts/pack-dist.js map
 *   node scripts/pack-dist.js share
 *
 * Output: dist/packs/*.tgz
 *
 * Install in another project:
 *   npm i ./hungpvq-shared-0.3.0.tgz ./hungpvq-map-core-1.0.1.tgz ...
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'dist', 'packs');

const SHARE = [
  'libs/share/shared',
  'libs/share/store',
  'libs/shared-log/core',
  'libs/share/file',
  'libs/share/core',
];

const DRAGGABLE_CORE = ['libs/draggable/core'];
const DRAGGABLE_VUE = [...DRAGGABLE_CORE, 'libs/draggable/vue'];
const DRAGGABLE_REACT = [...DRAGGABLE_CORE, 'libs/draggable/react'];

const MAP_CORE = [
  'libs/map-core/core',
  'libs/map-dataset/core',
  'libs/map-draw/core',
  'libs/map-devtools/core',
];

const MAP_VUE = [
  'libs/map-core/vue',
  'libs/map-dataset/vue',
  'libs/map-draw/vue',
  'libs/map-devtools/vue',
  'libs/map/vue',
];

const MAP_REACT = [
  'libs/map-core/react',
  'libs/map-dataset/react',
  'libs/map-draw/react',
  'libs/map-devtools/react',
  'libs/map/react',
];

/** @type {Record<string, string[]>} relative to dist/ */
const PRESETS = {
  share: SHARE,
  'draggable-vue': [...SHARE.slice(0, 2), ...DRAGGABLE_VUE],
  'draggable-react': [...SHARE.slice(0, 2), ...DRAGGABLE_REACT],
  draggable: [
    ...SHARE.slice(0, 2),
    ...DRAGGABLE_CORE,
    'libs/draggable/vue',
    'libs/draggable/react',
  ],
  'map-vue': [...SHARE, ...DRAGGABLE_VUE, ...MAP_CORE, ...MAP_VUE],
  'map-react': [...SHARE, ...DRAGGABLE_REACT, ...MAP_CORE, ...MAP_REACT],
  map: [
    ...SHARE,
    ...DRAGGABLE_CORE,
    'libs/draggable/vue',
    'libs/draggable/react',
    ...MAP_CORE,
    ...MAP_VUE,
    ...MAP_REACT,
  ],
};

function usage() {
  console.error(
    `Usage: node scripts/pack-dist.js <${Object.keys(PRESETS).join('|')}>\n` +
      `Output: ${path.relative(root, outDir)}${path.sep}*.tgz`,
  );
  process.exit(1);
}

function packOne(relDist) {
  const pkgDir = path.join(root, 'dist', relDist);
  const pkgJson = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJson)) {
    throw new Error(
      `Missing ${path.relative(root, pkgJson)}. Build first ` +
        `(e.g. npm run share:build && npm run draggable:build && npm run map:build).`,
    );
  }
  const meta = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
  console.log(`\n> npm pack ${meta.name}@${meta.version} (${relDist})`);
  const before = new Set(
    fs.readdirSync(outDir).filter((f) => f.endsWith('.tgz')),
  );
  execSync(`npm pack --pack-destination "${outDir}"`, {
    cwd: pkgDir,
    stdio: 'inherit',
    shell: true,
  });
  const after = fs.readdirSync(outDir).filter((f) => f.endsWith('.tgz'));
  const created = after.filter((f) => !before.has(f));
  if (created.length === 1) return created[0];
  // overwrite same name: match by package filename convention
  const expected = `${meta.name.replace('@', '').replace('/', '-')}-${meta.version}.tgz`;
  if (after.includes(expected)) return expected;
  throw new Error(`Could not detect tarball for ${meta.name}`);
}

function main() {
  const preset = process.argv[2];
  if (!preset || !PRESETS[preset]) usage();

  fs.mkdirSync(outDir, { recursive: true });
  const packed = [];
  for (const rel of PRESETS[preset]) {
    packed.push(packOne(rel));
  }

  console.log(`\nPacked ${packed.length} tarball(s) → ${outDir}`);
  for (const f of packed) console.log(`  ${f}`);
  console.log(
    `\nConsumer example:\n  npm i ${packed.map((f) => `./libs/${f}`).join(' ')}`,
  );
}

main();
