/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/vue/map',

  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md', 'package.json', 'style.css', 'index.d.ts']),
  ],

  build: {
    outDir: '../../../dist/libs/vue/map',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      name: 'vue-map',
      fileName: (format, entryName) => {
        const ext = format === 'cjs' ? 'cjs' : 'js';
        return entryName === 'index' ? `index.${ext}` : `${entryName}.${ext}`;
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'vue',
        'maplibre-gl',
        '@hungpvq/vue-map-dataset',
        '@hungpvq/vue-map-core',
        '@hungpvq/map-core',
        /^@hungpvq\/map-core\//,
        '@hungpvq/map-dataset',
        /^@hungpvq\/map-dataset\//,
        '@hungpvq/vue-draggable',
        '@hungpvq/draggable',
        '@hungpvq/shared',
        '@hungpvq/shared-log',
        '@hungpvq/shared-store',
      ],
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
      reportsDirectory: '../../../coverage/libs/vue/map',
      provider: 'v8' as const,
    },
  },
});
