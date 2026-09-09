/**
 * Browser-safe package version helpers for VitePress theme / markdown.
 * Versions are injected by config via `vite.define` (`__VP_PACKAGE_VERSIONS__`).
 * Node `fs` loading lives in `packages-versions.load.ts` (config only).
 */

declare const __VP_PACKAGE_VERSIONS__: Record<string, string>;

export type PackageVersion = {
  name: string;
  version: string;
};

export const packageVersions: Record<string, string> =
  typeof __VP_PACKAGE_VERSIONS__ !== 'undefined' ? __VP_PACKAGE_VERSIONS__ : {};

const pkgs = (
  versions: Record<string, string>,
  ...names: string[]
): PackageVersion[] =>
  names.map((name) => ({
    name,
    version: versions[name] ?? 'unknown',
  }));

type DocVersionGroup = {
  id: string;
  match: (path: string, base: string) => boolean;
  packages: PackageVersion[];
};

function buildDocVersionGroups(
  versions: Record<string, string>,
): DocVersionGroup[] {
  const draggablePackages = pkgs(
    versions,
    '@hungpvq/draggable',
    '@hungpvq/vue-draggable',
    '@hungpvq/react-draggable',
  );

  const mapPackages = pkgs(
    versions,
    '@hungpvq/vue-map-core',
    '@hungpvq/vue-map-dataset',
    '@hungpvq/vue-map-draw',
    '@hungpvq/map-draw',
    '@hungpvq/react-map-core',
    '@hungpvq/react-map-dataset',
    '@hungpvq/react-map-draw',
  );

  const isDemoMap = (base: string) => base.includes('demo-map');

  return [
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
      packages: pkgs(versions, '@hungpvq/vue-map-core', '@hungpvq/react-map-core'),
    },
    {
      id: 'map-dataset',
      match: (path, base) =>
        path.startsWith('/map/dataset') ||
        (isDemoMap(base) && path.startsWith('/dataset')),
      packages: pkgs(
        versions,
        '@hungpvq/vue-map-dataset',
        '@hungpvq/react-map-dataset',
      ),
    },
    {
      id: 'map-draw',
      match: (path, base) =>
        path.startsWith('/map/draw') ||
        (isDemoMap(base) && path.startsWith('/draw')),
      packages: pkgs(
        versions,
        '@hungpvq/map-draw',
        '@hungpvq/vue-map-draw',
        '@hungpvq/react-map-draw',
      ),
    },
    {
      id: 'map',
      match: (path, base) =>
        isDemoMap(base) || path === '/map' || path.startsWith('/map/'),
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
        versions,
        '@hungpvq/shared',
        '@hungpvq/shared-core',
        '@hungpvq/shared-file',
      ),
    },
  ];
}

export function resolveDocPackages(
  path: string,
  base = '/',
  versions: Record<string, string> = packageVersions,
): PackageVersion[] | null {
  const normalized =
    path.replace(/\/index\.html?$/, '/').replace(/\/$/, '') || '/';
  const group = buildDocVersionGroups(versions).find((g) =>
    g.match(normalized, base),
  );
  return group?.packages ?? null;
}

export function navLabel(
  text: string,
  packageName: string,
  versions: Record<string, string> = packageVersions,
): string {
  const version = versions[packageName];
  return version ? `${text} ${version}` : text;
}
