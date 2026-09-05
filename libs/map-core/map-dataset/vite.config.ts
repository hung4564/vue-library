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
      },
      name: '@hungpvq/map-dataset',
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        '@hungpvq/map-core',
        '@hungpvq/shared',
        '@hungpvq/shared-log',
        'maplibre-gl',
        '@mdi/js',
        'mitt',
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
}));
