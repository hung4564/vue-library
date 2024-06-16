import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@hungpv97/shared': resolve(__dirname, './libs/shared/src/index.ts'),
      '@hungpv97/shared-core': resolve(
        __dirname,
        './libs/shared-core/src/index.ts'
      ),
      '@vueuse/docs-utils': resolve(
        __dirname,
        './docs/.vitepress/plugins/utils.ts'
      ),
    },
  },
});
