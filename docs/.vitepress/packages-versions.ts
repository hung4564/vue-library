import draggable from '../../libs/draggable/core/package.json';
import reactDraggable from '../../libs/react/draggable/package.json';
import reactMapCore from '../../libs/react/map-core/package.json';
import reactMapDataset from '../../libs/react/map-dataset/package.json';
import shared from '../../libs/share/shared/package.json';
import sharedCore from '../../libs/share/core/package.json';
import sharedFile from '../../libs/share/file/package.json';
import vueDraggable from '../../libs/vue/draggable/package.json';
import vueMapCore from '../../libs/vue/map-core/package.json';
import vueMapDataset from '../../libs/vue/map-dataset/package.json';
import vueMapDraw from '../../libs/vue/map-draw/package.json';

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
    match: (path) => path.startsWith('/map/core'),
    packages: pkgs('@hungpvq/vue-map-core', '@hungpvq/react-map-core'),
  },
  {
    id: 'map-dataset',
    match: (path) => path.startsWith('/map/dataset'),
    packages: pkgs('@hungpvq/vue-map-dataset', '@hungpvq/react-map-dataset'),
  },
  {
    id: 'map-draw',
    match: (path) => path.startsWith('/map/draw'),
    packages: pkgs('@hungpvq/vue-map-draw'),
  },
  {
    id: 'map',
    match: (path) => path === '/map' || path.startsWith('/map/'),
    packages: pkgs(
      '@hungpvq/vue-map-core',
      '@hungpvq/vue-map-dataset',
      '@hungpvq/vue-map-draw',
      '@hungpvq/react-map-core',
      '@hungpvq/react-map-dataset',
    ),
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
