/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/map-core/map-debug',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md', 'package.json']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: '../../../dist/libs/map-core/map-debug',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        dataset: 'src/dataset/index.ts',
        // CSS-only graph so `./style.css` is emitted (not a package JS export).
        css: 'src/style.ts',
      },
      name: '@hungpvq/map-debug',
      fileName: (format, entryName) => {
        const ext = format === 'cjs' ? 'cjs' : 'js';
        return `${entryName}.${ext}`;
      },
      formats: ['es' as const, 'cjs' as const],
    },
    rollupOptions: {
      external: [
        '@hungpvq/map-core',
        /^@hungpvq\/map-core\//,
        '@hungpvq/map-dataset',
        /^@hungpvq\/map-dataset\//,
        '@hungpvq/shared-log',
        '@hungpvq/shared-store',
      ],
      output: {
        assetFileNames: 'style.css',
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
      reportsDirectory: '../../../coverage/libs/map-core/map-debug',
      provider: 'v8' as const,
    },
  },
}));
