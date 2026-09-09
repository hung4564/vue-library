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

  return {
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
}
