/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig((env) => {
  const envFile = loadEnv(env.mode, process.cwd());
  return {
    root: __dirname,
    cacheDir: '../../../node_modules/.vite/apps/demo-map',
    base: envFile.VITE_BASE_URL || '/demo-map/vue/',
    server: {
      port: 4200,
      host: 'localhost',
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    plugins: [vue(), nxViteTsPaths()],

    // GIS parse + CRS reproject (CreateControl). See libs/map-core/map-dataset/docs/worker.md
    worker: {
      plugins: () => [nxViteTsPaths()],
      format: 'es' as const,
      rollupOptions: {
        // FileGDB loads gdal UMD from CDN on the main thread — never bundle it.
        external: ['gdal3.js'],
      },
    },

    // gdal3.js / sql.js Emscripten factories break when Vite prebundles them.
    optimizeDeps: {
      exclude: ['gdal3.js', 'sql.js'],
    },

    build: {
      outDir: '../../../deploy/demo-map/vue',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },

    test: {
      globals: true,
      cache: {
        dir: '../../../node_modules/.vitest',
      },
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../../coverage/apps/demo-map',
        provider: 'v8',
      },
    },
  };
});
