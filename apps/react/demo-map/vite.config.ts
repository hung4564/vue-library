/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  base: '/demo-map/react/',
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/apps/react/demo-map',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // GeoJSON parse + CRS reproject (CreateControl). See libs/vue/map-dataset/docs/worker.md
  worker: {
    plugins: () => [nxViteTsPaths()],
    format: 'es' as const,
  },
  build: {
    outDir: '../../../deploy/demo-map/react',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
