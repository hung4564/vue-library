/// <reference types='vitest' />
import * as fs from 'node:fs';

import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as path from 'path';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';

/**
 * Source thumbnails resolve `../../assets/basemap/*` from `src/basemap/`.
 * Published `basemap.js` sits at package root — rewrite to `./assets/basemap/*`.
 */
function relativeBasemapAssetUrls(): Plugin {
  const rewrite = (code: string): string | null => {
    if (!code.includes('assets/basemap')) return null;
    const next = code.replace(
      /\.\.\/\.\.\/assets\/basemap\//g,
      './assets/basemap/',
    );
    return next === code ? null : next;
  };

  return {
    name: 'map-core-relative-basemap-asset-urls',
    apply: 'build',
    generateBundle(_opts, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.fileName.includes('basemap')) {
          continue;
        }
        const next = rewrite(chunk.code);
        if (next) chunk.code = next;
      }
    },
    writeBundle(outputOptions) {
      const root =
        typeof outputOptions.dir === 'string'
          ? outputOptions.dir
          : path.resolve(__dirname, '../../../dist/libs/map-core/core');
      if (!fs.existsSync(root)) return;
      for (const name of fs.readdirSync(root)) {
        if (
          !name.startsWith('basemap.') ||
          (!name.endsWith('.js') && !name.endsWith('.cjs'))
        ) {
          continue;
        }
        const file = path.join(root, name);
        if (!fs.statSync(file).isFile()) continue;
        const code = fs.readFileSync(file, 'utf8');
        const next = rewrite(code);
        if (next) fs.writeFileSync(file, next);
      }
    },
  };
}

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/map-core/core',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin([
      '*.md',
      'package.json',
      {
        input: 'assets',
        output: 'assets',
        glob: '**/*',
      },
    ]),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
    relativeBasemapAssetUrls(),
  ],
  build: {
    outDir: '../../../dist/libs/map-core/core',
    emptyOutDir: true,
    reportCompressedSize: true,
    assetsInlineLimit: 0,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // `worker` is a CSS/DOM-free entry for Web Workers (`@hungpvq/map-core/worker`).
      // The remaining entries are the domain subpaths (`@hungpvq/map-core/<name>`).
      entry: {
        index: 'src/index.ts',
        // CSS-only graph so `./style.css` is emitted (not a package JS export).
        css: 'src/style.ts',
        worker: 'src/worker-entry.ts',
        basemap: 'src/basemap/index.ts',
        devtools: 'src/devtools/index.ts',
        crs: 'src/crs/index.ts',
        event: 'src/event/index.ts',
        image: 'src/image/index.ts',
        legend: 'src/legend/index.ts',
        measurement: 'src/measurement/index.ts',
        menu: 'src/menu/index.ts',
        print: 'src/print/index.ts',
        theme: 'src/theme/index.ts',
        toolbar: 'src/toolbar/index.ts',
      },
      name: '@hungpvq/map-core',
      fileName: (format, entryName) => {
        const ext = format === 'cjs' ? 'cjs' : 'js';
        return entryName === 'index' ? `index.${ext}` : `${entryName}.${ext}`;
      },
      formats: ['es' as const, 'cjs' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        'proj4',
        'maplibre-gl',
        'mitt',
        '@hungpvq/shared-log',
        '@hungpvq/shared-store',
        '@mdi/js',
        /^@turf\//,
        '@maplibre/maplibre-gl-style-spec',
        'file-saver',
      ],
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? '';
          if (name.endsWith('.css')) return 'style.css';
          return 'assets/[name][extname]';
        },
      },
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/map-core/core',
      provider: 'v8' as const,
    },
  },
}));
