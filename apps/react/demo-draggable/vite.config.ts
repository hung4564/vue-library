/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  base: '/demo-draggable/react/',
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/apps/react/demo-draggable',
  server: {
    port: 4201,
    host: 'localhost',
  },
  preview: {
    port: 4301,
    host: 'localhost',
  },
  plugins: [
    // Workspace libs are served as source via tsconfig paths. Fast Refresh on
    // those files rewrites exports and breaks Vite ESM named imports
    // ("does not provide an export named …"). Keep Refresh for the app only.
    react({
      exclude: [/node_modules/, /[\\/]libs[\\/]/],
    }),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
  ],
  build: {
    outDir: '../../../deploy/demo-draggable/react',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
