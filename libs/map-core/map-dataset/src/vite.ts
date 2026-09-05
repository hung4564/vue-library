import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

export type MapDatasetGisWorkerOptions = {
  /**
   * App public directory (absolute or relative to Vite `root`).
   * Defaults to Vite `config.publicDir` (`public`).
   */
  publicDir?: string;
};

function resolvePackageRoot(): string {
  // Published as `<pkg>/vite.js` next to `<pkg>/assets/`.
  return path.dirname(fileURLToPath(import.meta.url));
}

function isGisWorkerFile(name: string): boolean {
  return /^geojson\.worker.*\.js$/i.test(name);
}

/**
 * Copies `geojson.worker-*.js` from `@hungpvq/map-dataset/assets` into the app
 * `public/assets` folder.
 *
 * Needed because the published package creates the worker with an absolute URL
 * (`/assets/geojson.worker-<hash>.js`). Vite serves `public/` at the site root in
 * both `dev` and `build`, so the browser can load that path without hand-copying.
 */
export function mapDatasetGisWorker(
  options: MapDatasetGisWorkerOptions = {},
): Plugin {
  let publicDir = '';

  const sync = () => {
    if (!publicDir) return;
    const srcDir = path.join(resolvePackageRoot(), 'assets');
    const destDir = path.join(publicDir, 'assets');
    if (!fs.existsSync(srcDir)) return;

    fs.mkdirSync(destDir, { recursive: true });

    for (const name of fs.readdirSync(destDir)) {
      if (isGisWorkerFile(name)) {
        fs.unlinkSync(path.join(destDir, name));
      }
    }

    for (const name of fs.readdirSync(srcDir)) {
      if (!isGisWorkerFile(name)) continue;
      fs.copyFileSync(path.join(srcDir, name), path.join(destDir, name));
    }
  };

  return {
    name: 'map-dataset-gis-worker',
    configResolved(config) {
      publicDir = options.publicDir
        ? path.resolve(config.root, options.publicDir)
        : config.publicDir;
      sync();
    },
    buildStart() {
      sync();
    },
  };
}
