/// <reference types='vitest' />
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import * as fs from 'node:fs';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

const WORKER_NAMES = ['geojson.worker', 'vectortile.worker'] as const;

/**
 * Library mode rewrites Worker URLs to absolute `/assets/…` or nested
 * `"" + new URL(...).href` forms. Normalize to a plain relative
 * `assets/<name>.worker.js` so browsers resolve from the published package.
 * Also rewrite source `./<name>.worker.ts` specifiers used by createWorker.
 */
function relativeWorkerUrls(): Plugin {
  const patterns: Array<{ re: RegExp; to: string }> = [
    {
      re: /\.\/(geojson|vectortile)\.worker\.ts/g,
      to: 'assets/$1.worker.js',
    },
    {
      re: /new URL\(\s*(?:\/\*\s*@vite-ignore\s*\*\/\s*)?["']\/assets\/((?:geojson|vectortile)\.worker[^"']+)["']\s*,\s*import\.meta\.url\s*\)/g,
      to: 'new URL("assets/$1", import.meta.url)',
    },
    {
      re: /new URL\(\s*(?:\/\*\s*@vite-ignore\s*\*\/\s*)?""\s*\+\s*new URL\(\s*["'](?:\.\/)?assets\/((?:geojson|vectortile)\.worker[^"']+)["']\s*,\s*import\.meta\.url\s*\)\.href\s*,\s*import\.meta\.url\s*\)/g,
      to: 'new URL("assets/$1", import.meta.url)',
    },
  ];

  const rewrite = (code: string): string | null => {
    let next = code;
    let changed = false;
    for (const { re, to } of patterns) {
      re.lastIndex = 0;
      if (!re.test(next)) continue;
      re.lastIndex = 0;
      next = next.replace(re, to);
      changed = true;
    }
    return changed ? next : null;
  };

  const touchesWorker = (code: string) =>
    WORKER_NAMES.some((name) => code.includes(name));

  return {
    name: 'map-dataset-relative-worker-urls',
    apply: 'build',
    generateBundle(_opts, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk' || !touchesWorker(chunk.code)) continue;
        const next = rewrite(chunk.code);
        if (next) chunk.code = next;
      }
    },
    writeBundle(outputOptions) {
      const root =
        typeof outputOptions.dir === 'string'
          ? outputOptions.dir
          : path.resolve(__dirname, '../../../dist/libs/map-core/map-dataset');
      if (!fs.existsSync(root)) return;
      for (const name of fs.readdirSync(root)) {
        if (!name.endsWith('.js') && !name.endsWith('.cjs')) continue;
        const file = path.join(root, name);
        if (!fs.statSync(file).isFile()) continue;
        const code = fs.readFileSync(file, 'utf8');
        if (!touchesWorker(code)) continue;
        const next = rewrite(code);
        if (next) fs.writeFileSync(file, next);
      }
    },
  };
}

function workerEntryFileName(chunkInfo: { name?: string }): string {
  const name = chunkInfo.name ?? '';
  if (name.includes('vectortile')) return 'assets/vectortile.worker.js';
  if (name.includes('geojson')) return 'assets/geojson.worker.js';
  // Fallback — keep distinct files if Vite names the entry differently.
  return `assets/${name || 'worker'}.js`;
}

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/map-core/map-dataset',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md', 'package.json']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
    relativeWorkerUrls(),
  ],
  worker: {
    plugins: () => [nxViteTsPaths()],
    format: 'es' as const,
    rollupOptions: {
      output: {
        // One file per worker entry (no shared worker chunks under public/).
        inlineDynamicImports: true,
        entryFileNames: workerEntryFileName,
      },
    },
  },
  // Prefer relative asset URLs in published JS (Worker + any other assets).
  experimental: {
    renderBuiltUrl(_filename, { hostType }) {
      if (hostType === 'js') {
        return { relative: true };
      }
      return { relative: true };
    },
  },
  build: {
    outDir: '../../../dist/libs/map-core/map-dataset',
    emptyOutDir: true,
    reportCompressedSize: true,
    // Never inline the GIS worker (or other large assets) as data: URLs.
    assetsInlineLimit: 0,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        // CSS-only graph so `./style.css` is emitted (not a package JS export).
        // Named `css` to avoid colliding with domain entry `@hungpvq/map-dataset/style`.
        css: 'src/style.ts',
        vite: 'src/vite.ts',
        geojson: 'src/geojson/index.ts',
        raster: 'src/raster/index.ts',
        'vector-tile': 'src/vector-tile/index.ts',
        identify: 'src/identify/index.ts',
        menu: 'src/menu/index.ts',
        style: 'src/style/index.ts',
        'create-control': 'src/create-control/index.ts',
        'geo-export': 'src/geo-export/index.ts',
        'data-management': 'src/data-management/index.ts',
        'attribute-table': 'src/attribute-table/index.ts',
        highlight: 'src/highlight/index.ts',
      },
      name: '@hungpvq/map-dataset',
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
        '@hungpvq/shared',
        '@hungpvq/shared-log',
        'maplibre-gl',
        '@mdi/js',
        'mitt',
        '@turf/boolean-intersects',
        '@turf/helpers',
        /^@turf\//,
        '@tmcw/togeojson',
        '@xmldom/xmldom',
        'jszip',
        'papaparse',
        'shpjs',
        'topojson-client',
        'tokml',
        '@mapbox/shp-write',
        'vite',
        'node:fs',
        'node:module',
        'node:path',
        'node:url',
      ],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'style.css';
          return 'assets/[name]-[hash][extname]';
        },
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
      reportsDirectory: '../../../coverage/libs/map-core/map-dataset',
      provider: 'v8' as const,
    },
  },
}));
