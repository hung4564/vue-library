/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/react/map-dataset',
  plugins: [
    react({ exclude: [/node_modules/, /[\\/]libs[\\/]/] }),
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
  build: {
    outDir: '../../../dist/libs/react/map-dataset',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/index.ts',
      name: '@hungpvq/react-map-dataset',
      fileName: 'index',
      formats: ['es' as const],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@hungpvq/map-core',
        /^@hungpvq\/map-core\//,
        '@hungpvq/map-dataset',
        /^@hungpvq\/map-dataset\//,
        '@hungpvq/react-map-core',
        '@hungpvq/react-draggable',
        '@hungpvq/shared',
        '@hungpvq/shared-log',
        'maplibre-gl',
        '@mdi/js',
        '@mdi/react',
      ],
      output: {
        assetFileNames: 'style.css',
      },
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/react/map-dataset',
      provider: 'v8' as const,
    },
  },
}));
