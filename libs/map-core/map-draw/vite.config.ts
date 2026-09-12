/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/map-core/map-draw',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md', 'package.json']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: '../../../dist/libs/map-core/map-draw',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/index.ts',
      name: '@hungpvq/map-draw',
      fileName: 'index',
      formats: ['es' as const, 'cjs' as const],
    },
    rollupOptions: {
      external: [
        '@hungpvq/map-core',
        /^@hungpvq\/map-core\//,
        '@hungpvq/shared',
        '@hungpvq/shared-log',
        'maplibre-gl',
        'randomcolor',
        '@mapbox/mapbox-gl-draw',
      ],
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
      reportsDirectory: '../../../coverage/libs/map-core/map-draw',
      provider: 'v8' as const,
    },
  },
}));
