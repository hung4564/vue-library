/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/vue/map-core',

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
    outDir: '../../../dist/libs/vue/map-core',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        fields: 'src/fields.ts',
      },
      name: 'vue-map-core',
      fileName: (format, entryName) => {
        const ext = format === 'cjs' ? 'cjs' : 'js';
        return entryName === 'index' ? `index.${ext}` : `${entryName}.${ext}`;
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@hungpvq/shared',
        '@hungpvq/shared-core',
        '@hungpvq/vue-draggable',
        '@hungpvq/map-core',
        'mitt',
        '@hungpvq/shared-log',
        '@hungpvq/shared-store',
        'lodash',
        'maplibre-gl',
        '@mdi/js',
        'geojson',
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
      reportsDirectory: '../../../coverage/libs/vue/map-core',
      provider: 'v8' as const,
    },
  },
});
