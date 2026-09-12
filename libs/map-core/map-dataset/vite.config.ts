/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/map-core/map-dataset',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md', 'package.json']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  worker: {
    plugins: () => [nxViteTsPaths()],
    format: 'es' as const,
  },
  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../../dist/libs/map-core/map-dataset',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        vite: 'src/vite.ts',
        geojson: 'src/geojson/index.ts',
        raster: 'src/raster/index.ts',
        'vector-tile': 'src/vector-tile/index.ts',
        identify: 'src/identify/index.ts',
        menu: 'src/menu/index.ts',
        style: 'src/style/index.ts',
        'create-control': 'src/create-control/index.ts',
        'geo-export': 'src/geo-export/index.ts',
        'data-management': 'src/data-management/index.ts',
        'attribute-table': 'src/attribute-table/index.ts',
      },
      name: '@hungpvq/map-dataset',
      fileName: (format, entryName) => {
        const ext = format === 'cjs' ? 'cjs' : 'js';
        return `${entryName}.${ext}`;
      },
      formats: ['es' as const, 'cjs' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        '@hungpvq/map-core',
        /^@hungpvq\/map-core\//,
        '@hungpvq/shared',
        '@hungpvq/shared-log',
        'maplibre-gl',
        '@mdi/js',
        'mitt',
        '@turf/boolean-intersects',
        '@turf/helpers',
        '@turf/turf',
        '@tmcw/togeojson',
        '@xmldom/xmldom',
        'jszip',
        'papaparse',
        'shpjs',
        'topojson-client',
        'tokml',
        '@mapbox/shp-write',
        'vite',
        'node:fs',
        'node:module',
        'node:path',
        'node:url',
      ],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'style.css';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    setupFiles: ['../core/src/test-setup.ts'],
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/map-core/map-dataset',
      provider: 'v8' as const,
    },
  },
}));
