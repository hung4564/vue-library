import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Node-only loader for VitePress config.
 * Do not import this from theme/Vue/markdown — it breaks the client bundle.
 *
 * Reads package.json at config time so Nx does not treat docs as a static
 * dependency of each published library (avoids source ↔ lib cycles).
 */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readPkg(relativePath: string): { name: string; version: string } {
  const raw = readFileSync(join(repoRoot, relativePath), 'utf8');
  const pkg = JSON.parse(raw) as { name: string; version: string };
  return { name: pkg.name, version: pkg.version };
}

export function loadPackageVersions(): Record<string, string> {
  const draggable = readPkg('libs/draggable/core/package.json');
  const reactDraggable = readPkg('libs/draggable/react/package.json');
  const reactMapCore = readPkg('libs/map-core/react/package.json');
  const reactMapDataset = readPkg('libs/map-dataset/react/package.json');
  const shared = readPkg('libs/share/shared/package.json');
  const sharedCore = readPkg('libs/share/core/package.json');
  const sharedFile = readPkg('libs/share/file/package.json');
  const vueDraggable = readPkg('libs/draggable/vue/package.json');
  const vueMapCore = readPkg('libs/map-core/vue/package.json');
  const vueMapDataset = readPkg('libs/map-dataset/vue/package.json');
  const vueMap = readPkg('libs/map/vue/package.json');
  const mapDraw = readPkg('libs/map-draw/core/package.json');
  const reactMapDraw = readPkg('libs/map-draw/react/package.json');
  const vueMapDraw = readPkg('libs/map-draw/vue/package.json');
  const reactMap = readPkg('libs/map/react/package.json');

  return {
    [draggable.name]: draggable.version,
    [vueDraggable.name]: vueDraggable.version,
    [reactDraggable.name]: reactDraggable.version,
    [shared.name]: shared.version,
    [sharedCore.name]: sharedCore.version,
    [sharedFile.name]: sharedFile.version,
    [vueMap.name]: vueMap.version,
    [vueMapCore.name]: vueMapCore.version,
    [vueMapDataset.name]: vueMapDataset.version,
    [vueMapDraw.name]: vueMapDraw.version,
    [mapDraw.name]: mapDraw.version,
    [reactMapDraw.name]: reactMapDraw.version,
    [reactMap.name]: reactMap.version,
    [reactMapCore.name]: reactMapCore.version,
    [reactMapDataset.name]: reactMapDataset.version,
  };
}
