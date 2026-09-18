import type { Plugin } from 'vite';

const EXCLUDE = [
  '@hungpvq/map-dataset',
  '@hungpvq/map-dataset/geojson',
  '@hungpvq/map-dataset/create-control',
  // UMD build has no ESM named exports — shimmed below via resolveId/load.
  'maplibre-gl',
] as const;

/** CJS deps that break when Vite serves them raw (missing named ESM exports). */
const INCLUDE = [
  'geojson-rbush',
  '@hungpvq/shared-log',
  '@hungpvq/shared-store',
] as const;

const MAPLIBRE_VIRTUAL = '\0hungpvq-maplibre-gl-named';
/** Real UMD entry — must not match bare `maplibre-gl` or the shim recurses. */
const MAPLIBRE_RUNTIME = 'maplibre-gl/dist/maplibre-gl.js';

/** Baked string (no nested `${}`) so the lib build does not rewrite the shim. */
const MAPLIBRE_NAMED_SHIM = [
  `import maplibregl from "${MAPLIBRE_RUNTIME}";`,
  'export default maplibregl;',
  'export const Map = maplibregl.Map;',
  'export const Point = maplibregl.Point;',
  'export const Marker = maplibregl.Marker;',
  'export const Popup = maplibregl.Popup;',
  'export const LngLat = maplibregl.LngLat;',
  'export const LngLatBounds = maplibregl.LngLatBounds;',
  'export const MercatorCoordinate = maplibregl.MercatorCoordinate;',
  'export const NavigationControl = maplibregl.NavigationControl;',
  'export const GeolocateControl = maplibregl.GeolocateControl;',
  'export const ScaleControl = maplibregl.ScaleControl;',
  'export const AttributionControl = maplibregl.AttributionControl;',
  'export const FullscreenControl = maplibregl.FullscreenControl;',
  'export const TerrainControl = maplibregl.TerrainControl;',
  'export const GlobeControl = maplibregl.GlobeControl;',
  'export const LogoControl = maplibregl.LogoControl;',
  'export const MapWheelEvent = maplibregl.MapWheelEvent;',
  'export const MapMouseEvent = maplibregl.MapMouseEvent;',
  'export const MapTouchEvent = maplibregl.MapTouchEvent;',
  'export const ErrorEvent = maplibregl.ErrorEvent;',
  'export const ajax = maplibregl.ajax;',
  'export const config = maplibregl.config;',
  'export const getRTLTextPluginStatus = maplibregl.getRTLTextPluginStatus;',
  'export const setRTLTextPlugin = maplibregl.setRTLTextPlugin;',
  'export const addProtocol = maplibregl.addProtocol;',
  'export const removeProtocol = maplibregl.removeProtocol;',
  'export const getMaxParallelImageRequests = maplibregl.getMaxParallelImageRequests;',
  'export const setMaxParallelImageRequests = maplibregl.setMaxParallelImageRequests;',
  'export const clearPrewarmedResources = maplibregl.clearPrewarmedResources;',
  'export const getWorkerCount = maplibregl.getWorkerCount;',
  'export const setWorkerCount = maplibregl.setWorkerCount;',
  'export const getWorkerUrl = maplibregl.getWorkerUrl;',
  'export const setWorkerUrl = maplibregl.setWorkerUrl;',
  'export const prewarm = maplibregl.prewarm;',
  'export const version = maplibregl.version;',
].join('\n');

/**
 * Vite helper for apps that install the published `@hungpvq/map-dataset`.
 *
 * Does **not** copy worker files into `public/`. It:
 * - excludes the package from `optimizeDeps` so `new URL('assets/geojson.worker.js', import.meta.url)`
 *   keeps resolving from `node_modules/@hungpvq/map-dataset/…` instead of `.vite/deps/`
 * - includes CJS helpers (`geojson-rbush`, `@hungpvq/shared-log`, …) for Vite prebundle interop
 * - shims `maplibre-gl` named ESM exports from the UMD default object
 *   (`import { Point, Map, … } from 'maplibre-gl'` works under Vite)
 *
 * Monorepo apps that path-alias into `libs/` should use `worker.format: 'es'` +
 * `nxViteTsPaths` on `worker.plugins` instead (see GIS worker docs).
 */
export function mapDatasetGisWorker(): Plugin {
  return {
    name: 'map-dataset-gis-worker',
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          exclude: [...EXCLUDE],
          include: [...INCLUDE, MAPLIBRE_RUNTIME],
          needsInterop: [MAPLIBRE_RUNTIME],
        },
        ssr: {
          optimizeDeps: {
            exclude: [...EXCLUDE],
          },
        },
      };
    },
    resolveId(source) {
      if (source === 'maplibre-gl') return MAPLIBRE_VIRTUAL;
      return null;
    },
    load(id) {
      if (id === MAPLIBRE_VIRTUAL) return MAPLIBRE_NAMED_SHIM;
      return null;
    },
  };
}
