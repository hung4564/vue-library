import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@hungpvq/shared': resolve(__dirname, './libs/share/shared/src/index.ts'),
      '@hungpvq/shared-core': resolve(
        __dirname,
        './libs/share/core/src/index.ts'
      ),
    },
  },
});
