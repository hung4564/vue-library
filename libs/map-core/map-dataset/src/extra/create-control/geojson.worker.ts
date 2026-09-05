import { runWorkerMonitor } from '@hungpvq/map-core/worker';
import type { LayerStyleType } from '../../utils/layer-simple-builder';
import { detectGeojsonCrs, detectGeojsonStyleTypes } from './geojson-parse';
import {
  asGisFeatureCollection,
  parseGisFile,
  parseGisFiles,
  parseGisFromUrl,
  parseGisText,
} from './gis-parse';
import type { GeoJSON } from 'geojson';
// Vite workers cannot resolve workspace package names for most map-core
// utilities and would leave them external; keep relative imports for those.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { reprojectGeojsonToWgs84 } from '../../../../core/src/utils/geojson-reproject';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { GeojsonBbox } from '../../../../core/src/utils/fillBound';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { bboxFromGeojson } from '../../../../core/src/utils/fillBound';

export type GeojsonWorkerRequest =
  | {
      id: string;
      type: 'parse-gis';
      text: string;
      filename?: string;
    }
  | {
      id: string;
      type: 'read-gis';
      file: File;
    }
  | {
      id: string;
      type: 'read-gis-files';
      files: File[];
    }
  | {
      id: string;
      type: 'fetch-gis';
      url: string;
    }
  | {
      id: string;
      type: 'reproject-geojson';
      geojson: GeoJSON;
      crs?: string | null;
    }
  | {
      id: string;
      type: 'detect-style-types';
      geojson: GeoJSON;
    }
  | {
      id: string;
      type: 'compute-bbox';
      geojson: GeoJSON;
    };

export type GeojsonWorkerResponse = {
  id: string;
  ok: boolean;
  geojson?: GeoJSON | null;
  crs?: string | null;
  format?: string;
  styleTypes?: LayerStyleType[];
  bbox?: GeojsonBbox;
  error?: string;
};

function describeGeojson(geojson: GeoJSON | null): string {
  if (!geojson) return 'empty';
  if (geojson.type === 'FeatureCollection') {
    return `FeatureCollection (${geojson.features.length} features)`;
  }
  if (geojson.type === 'Feature') return 'Feature';
  return geojson.type;
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

runWorkerMonitor<GeojsonWorkerRequest>(
  async (message, ctx) => {
    let geojson: GeoJSON | null = null;
    let crs: string | null = null;
    let format: string | undefined;
    let styleTypes: LayerStyleType[] | undefined;
    let bbox: GeojsonBbox | undefined;
    const report = ctx.report;

    switch (message.type) {
      case 'parse-gis': {
        report(0, 1, 'parse');
        ctx.log(`parse text (${message.text.length} chars)`);
        const parsed = parseGisText(
          message.text,
          { name: message.filename, strict: true },
          report,
        );
        geojson = parsed.geojson;
        crs = parsed.crs;
        format = parsed.format;
        ctx.log(
          `parsed ${format || 'gis'} ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
        );
        report(1, 1, 'parse');
        break;
      }
      case 'read-gis': {
        ctx.log(
          `read file ${message.file.name || ''} (${formatBytes(message.file.size)})`,
        );
        const parsed = await parseGisFile(message.file, report);
        geojson = parsed.geojson;
        crs = parsed.crs;
        format = parsed.format;
        ctx.log(
          `parsed ${format || 'gis'} ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
        );
        break;
      }
      case 'read-gis-files': {
        const names = message.files.map((file) => file.name).join(', ');
        const size = message.files.reduce((sum, file) => sum + file.size, 0);
        ctx.log(`read files ${names} (${formatBytes(size)})`);
        const parsed = await parseGisFiles(message.files, report);
        geojson = parsed.geojson;
        crs = parsed.crs;
        format = parsed.format;
        ctx.log(
          `parsed ${format || 'gis'} ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
        );
        break;
      }
      case 'fetch-gis': {
        ctx.log(`fetch ${message.url}`);
        const parsed = await parseGisFromUrl(message.url, report);
        geojson = parsed.geojson;
        crs = parsed.crs;
        format = parsed.format;
        ctx.log(
          `fetched ${format || 'gis'} ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
        );
        break;
      }
      case 'reproject-geojson': {
        const collection = asGisFeatureCollection(message.geojson);
        const total = collection?.features.length ?? 1;
        const fromCrs =
          message.crs || detectGeojsonCrs(message.geojson) || 'unknown';
        report(0, total, 'reproject');
        ctx.log(
          `reproject ${describeGeojson(message.geojson)} from EPSG:${fromCrs} → 4326`,
        );
        geojson = reprojectGeojsonToWgs84(
          message.geojson,
          message.crs,
          (current, count) => report(current, count, 'reproject'),
        );
        crs = '4326';
        break;
      }
      case 'detect-style-types': {
        report(0, 1, 'detect-styles');
        ctx.log(`detect style types ${describeGeojson(message.geojson)}`);
        styleTypes = detectGeojsonStyleTypes(message.geojson);
        geojson = message.geojson;
        report(1, 1, 'detect-styles');
        ctx.log(`detected styles: ${styleTypes.join(', ')}`);
        break;
      }
      case 'compute-bbox': {
        report(0, 1, 'bbox');
        ctx.log(`compute bbox ${describeGeojson(message.geojson)}`);
        bbox = bboxFromGeojson(message.geojson) ?? undefined;
        geojson = message.geojson;
        report(1, 1, 'bbox');
        ctx.log(bbox ? `bbox ${bbox.join(',')}` : 'bbox empty');
        break;
      }
      default:
        throw new Error('Unknown GIS worker task');
    }

    return { geojson, crs, format, styleTypes, bbox };
  },
  { readyMessage: 'GIS worker ready' },
);
