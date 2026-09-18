/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/vue/map-dataset',

  plugins: [
    vue(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md', 'package.json']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],

  build: {
    outDir: '../../../dist/libs/vue/map-dataset',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        // CSS-only graph so `./style.css` includes dataset styles (not a JS export).
        css: 'src/style.ts',
      },
      name: 'dataset',
      fileName: (format, entryName) => {
        const ext = format === 'cjs' ? 'cjs' : 'js';
        return entryName === 'index' ? `index.${ext}` : `${entryName}.${ext}`;
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@hungpvq/map-core',
        /^@hungpvq\/map-core\//,
        '@hungpvq/map-dataset',
        /^@hungpvq\/map-dataset\//,
        '@hungpvq/vue-map-core',
        '@hungpvq/shared',
        '@hungpvq/vue-draggable',
        'vuedraggable',
        'mitt',
        '@hungpvq/shared-log',
        '@hungpvq/shared-store',
        '@mdi/js',
        /^@turf\//,
        'maplibre-gl',
      ],
      output: {
        assetFileNames: 'style.css',
        globals: {
          vue: 'Vue',
        },
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
      reportsDirectory: '../../../coverage/libs/vue/map-dataset',
      provider: 'v8' as const,
    },
  },
});
