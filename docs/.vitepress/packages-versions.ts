import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Read package.json at runtime so Nx does not treat docs as a static
 * dependency of each published library (avoids source ↔ lib cycles).
 */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readPkg(relativePath: string): { name: string; version: string } {
  const raw = readFileSync(join(repoRoot, relativePath), 'utf8');
  const pkg = JSON.parse(raw) as { name: string; version: string };
  return { name: pkg.name, version: pkg.version };
}

const draggable = readPkg('libs/draggable/core/package.json');
const reactDraggable = readPkg('libs/react/draggable/package.json');
const reactMapCore = readPkg('libs/react/map-core/package.json');
const reactMapDataset = readPkg('libs/react/map-dataset/package.json');
const shared = readPkg('libs/share/shared/package.json');
const sharedCore = readPkg('libs/share/core/package.json');
const sharedFile = readPkg('libs/share/file/package.json');
const vueDraggable = readPkg('libs/vue/draggable/package.json');
const vueMapCore = readPkg('libs/vue/map-core/package.json');
const vueMapDataset = readPkg('libs/vue/map-dataset/package.json');
const mapDraw = readPkg('libs/map-core/map-draw/package.json');
const reactMapDraw = readPkg('libs/react/map-draw/package.json');
const vueMapDraw = readPkg('libs/vue/map-draw/package.json');

export type PackageVersion = {
  name: string;
  version: string;
};

export const packageVersions: Record<string, string> = {
  [draggable.name]: draggable.version,
  [vueDraggable.name]: vueDraggable.version,
  [reactDraggable.name]: reactDraggable.version,
  [shared.name]: shared.version,
  [sharedCore.name]: sharedCore.version,
  [sharedFile.name]: sharedFile.version,
  [vueMapCore.name]: vueMapCore.version,
  [vueMapDataset.name]: vueMapDataset.version,
  [vueMapDraw.name]: vueMapDraw.version,
  [mapDraw.name]: mapDraw.version,
  [reactMapDraw.name]: reactMapDraw.version,
  [reactMapCore.name]: reactMapCore.version,
  [reactMapDataset.name]: reactMapDataset.version,
};

const pkgs = (...names: string[]): PackageVersion[] =>
  names.map((name) => ({
    name,
    version: packageVersions[name] ?? 'unknown',
  }));

type DocVersionGroup = {
  id: string;
  match: (path: string, base: string) => boolean;
  packages: PackageVersion[];
};

const draggablePackages = pkgs(
  '@hungpvq/draggable',
  '@hungpvq/vue-draggable',
  '@hungpvq/react-draggable',
);

const mapPackages = pkgs(
  '@hungpvq/vue-map-core',
  '@hungpvq/vue-map-dataset',
  '@hungpvq/vue-map-draw',
  '@hungpvq/map-draw',
  '@hungpvq/react-map-core',
  '@hungpvq/react-map-dataset',
  '@hungpvq/react-map-draw',
);

const isDemoMap = (base: string) => base.includes('demo-map');

const docVersionGroups: DocVersionGroup[] = [
  {
    id: 'draggable',
    match: (path, base) =>
      base.includes('demo-draggable') ||
      path === '/draggable' ||
      path.startsWith('/draggable/'),
    packages: draggablePackages,
  },
  {
    id: 'map-core',
    match: (path, base) =>
      path.startsWith('/map/core') ||
      (isDemoMap(base) && path.startsWith('/core')),
    packages: pkgs('@hungpvq/vue-map-core', '@hungpvq/react-map-core'),
  },
  {
    id: 'map-dataset',
    match: (path, base) =>
      path.startsWith('/map/dataset') ||
      (isDemoMap(base) && path.startsWith('/dataset')),
    packages: pkgs('@hungpvq/vue-map-dataset', '@hungpvq/react-map-dataset'),
  },
  {
    id: 'map-draw',
    match: (path, base) =>
      path.startsWith('/map/draw') ||
      (isDemoMap(base) && path.startsWith('/draw')),
    packages: pkgs(
      '@hungpvq/map-draw',
      '@hungpvq/vue-map-draw',
      '@hungpvq/react-map-draw',
    ),
  },
  {
    id: 'map',
    match: (path, base) =>
      isDemoMap(base) ||
      path === '/map' ||
      path.startsWith('/map/'),
    packages: mapPackages,
  },
  {
    id: 'shared',
    match: (path) =>
      path === '/shared' ||
      path.startsWith('/shared/') ||
      path.startsWith('/shared-core') ||
      path.startsWith('/shared-file'),
    packages: pkgs(
      '@hungpvq/shared',
      '@hungpvq/shared-core',
      '@hungpvq/shared-file',
    ),
  },
];

export function resolveDocPackages(
  path: string,
  base = '/',
): PackageVersion[] | null {
  const normalized =
    path.replace(/\/index\.html?$/, '/').replace(/\/$/, '') || '/';
  const group = docVersionGroups.find((g) => g.match(normalized, base));
  return group?.packages ?? null;
}

export function navLabel(text: string, packageName: string): string {
  const version = packageVersions[packageName];
  return version ? `${text} ${version}` : text;
}
