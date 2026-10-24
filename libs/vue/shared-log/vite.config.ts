/// <reference types="vitest" />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/vue/shared-log',
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
    outDir: '../../../dist/libs/vue/shared-log',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        css: 'src/style.ts',
      },
      name: 'vue-shared-log',
      fileName: (format, entryName) => {
        const ext = format === 'cjs' ? 'cjs' : 'js';
        return entryName === 'index' ? `index.${ext}` : `${entryName}.${ext}`;
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@hungpvq/shared-log',
        '@hungpvq/shared-store',
        '@hungpvq/vue-ui-core',
      ],
      output: {
        assetFileNames: 'style.css',
        globals: { vue: 'Vue' },
      },
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,ts,tsx}'],
  },
});
