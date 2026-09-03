import type { GeoJSON } from 'geojson';
// Vite workers cannot resolve workspace package names and would leave
// `@hungpvq/map-core` external; import the source file so reproject is bundled.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { reprojectGeojsonToWgs84 } from '../../../../core/src/utils/geojson-reproject';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { bboxFromGeojson } from '../../../../core/src/utils/fillBound';
import type { GeojsonBbox } from '../../../../core/src/utils/fillBound';
import {
  detectGeojsonCrs,
  detectGeojsonStyleTypes,
} from './geojson-parse';
import type { LayerStyleType } from '../../utils/layer-simple-builder';
import {
  asGisFeatureCollection,
  parseGisFile,
  parseGisFiles,
  parseGisFromUrl,
  parseGisText,
} from './gis-parse';

export type GeojsonWorkerRequest =
  | {
      id: string;
      type: 'parse-geojson' | 'parse-gis';
      text: string;
      filename?: string;
    }
  | {
      id: string;
      type: 'read-geojson' | 'read-gis';
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

type WorkerLogLevel = 'debug' | 'info' | 'warn' | 'error';

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

function formatLogArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.stack || arg.message;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
}

function postLog(
  message: string,
  options: { level?: WorkerLogLevel; taskId?: string } = {},
) {
  self.postMessage({
    __workerMonitor: true,
    kind: 'log',
    message,
    level: options.level ?? 'info',
    taskId: options.taskId,
    at: Date.now(),
  });
}

function installConsoleForwarding() {
  const patched = console as Console & { __mapGisConsolePatched?: boolean };
  if (patched.__mapGisConsolePatched) return;
  patched.__mapGisConsolePatched = true;

  const map: Record<string, WorkerLogLevel> = {
    debug: 'debug',
    info: 'info',
    log: 'info',
    warn: 'warn',
    error: 'error',
  };
  for (const method of ['debug', 'info', 'log', 'warn', 'error'] as const) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args);
      try {
        postLog(formatLogArgs(args), { level: map[method] });
      } catch {
        // Logging must not crash GIS parse/reproject.
      }
    };
  }
}

installConsoleForwarding();
postLog('GIS worker ready');

function postProgress(
  taskId: string,
  current: number,
  total?: number,
  message?: string,
) {
  self.postMessage({
    __workerMonitor: true,
    kind: 'progress',
    taskId,
    current,
    total,
    message,
  });
}

function createProgressPoster(taskId: string) {
  let last = 0;
  return (current: number, total?: number, message?: string) => {
    const now = Date.now();
    const done = total != null && current >= total;
    if (!done && now - last < 80) return;
    last = now;
    postProgress(taskId, current, total, message);
  };
}

self.onmessage = (event: MessageEvent<GeojsonWorkerRequest>) => {
  void handleMessage(event.data);
};

async function handleMessage(message: GeojsonWorkerRequest) {
  const started = Date.now();
  try {
    let geojson: GeoJSON | null = null;
    let crs: string | null = null;
    let format: string | undefined;
    let styleTypes: LayerStyleType[] | undefined;
    let bbox: GeojsonBbox | undefined;
    const report = createProgressPoster(message.id);
    postLog(`${message.type} start`, {
      level: 'info',
      taskId: message.id,
    });

    switch (message.type) {
      case 'parse-geojson':
      case 'parse-gis': {
        report(0, 1, 'parse');
        postLog(`parse text (${message.text.length} chars)`, {
          taskId: message.id,
        });
        const parsed = parseGisText(
          message.text,
          { name: message.filename, strict: true },
          report,
        );
        geojson = parsed.geojson;
        crs = parsed.crs;
        format = parsed.format;
        postLog(
          `parsed ${format || 'gis'} ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
          { taskId: message.id },
        );
        report(1, 1, 'parse');
        break;
      }
      case 'read-geojson':
      case 'read-gis': {
        postLog(
          `read file ${message.file.name || ''} (${formatBytes(message.file.size)})`,
          { taskId: message.id },
        );
        const parsed = await parseGisFile(message.file, report);
        geojson = parsed.geojson;
        crs = parsed.crs;
        format = parsed.format;
        postLog(
          `parsed ${format || 'gis'} ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
          { taskId: message.id },
        );
        break;
      }
      case 'read-gis-files': {
        const names = message.files.map((file) => file.name).join(', ');
        const size = message.files.reduce((sum, file) => sum + file.size, 0);
        postLog(`read files ${names} (${formatBytes(size)})`, {
          taskId: message.id,
        });
        const parsed = await parseGisFiles(message.files, report);
        geojson = parsed.geojson;
        crs = parsed.crs;
        format = parsed.format;
        postLog(
          `parsed ${format || 'gis'} ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
          { taskId: message.id },
        );
        break;
      }
      case 'fetch-gis': {
        postLog(`fetch ${message.url}`, { taskId: message.id });
        const parsed = await parseGisFromUrl(message.url, report);
        geojson = parsed.geojson;
        crs = parsed.crs;
        format = parsed.format;
        postLog(
          `fetched ${format || 'gis'} ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
          { taskId: message.id },
        );
        break;
      }
      case 'reproject-geojson': {
        const collection = asGisFeatureCollection(message.geojson);
        const total = collection?.features.length ?? 1;
        const fromCrs = message.crs || detectGeojsonCrs(message.geojson) || 'unknown';
        report(0, total, 'reproject');
        postLog(
          `reproject ${describeGeojson(message.geojson)} from EPSG:${fromCrs} → 4326`,
          { taskId: message.id },
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
        postLog(
          `detect style types ${describeGeojson(message.geojson)}`,
          { taskId: message.id },
        );
        styleTypes = detectGeojsonStyleTypes(message.geojson);
        geojson = message.geojson;
        report(1, 1, 'detect-styles');
        postLog(`detected styles: ${styleTypes.join(', ')}`, {
          taskId: message.id,
        });
        break;
      }
      case 'compute-bbox': {
        report(0, 1, 'bbox');
        postLog(`compute bbox ${describeGeojson(message.geojson)}`, {
          taskId: message.id,
        });
        bbox = bboxFromGeojson(message.geojson) ?? undefined;
        geojson = message.geojson;
        report(1, 1, 'bbox');
        postLog(
          bbox ? `bbox ${bbox.join(',')}` : 'bbox empty',
          { taskId: message.id },
        );
        break;
      }
      default:
        throw new Error('Unknown GIS worker task');
    }

    postLog(`${message.type} done in ${Date.now() - started}ms`, {
      taskId: message.id,
    });
    const response: GeojsonWorkerResponse = {
      id: message.id,
      ok: true,
      geojson,
      crs,
      format,
      styleTypes,
      bbox,
    };
    self.postMessage(response);
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    postLog(`${message.type} error: ${text}`, {
      level: 'error',
      taskId: message.id,
    });
    const response: GeojsonWorkerResponse = {
      id: message.id,
      ok: false,
      error: text,
    };
    self.postMessage(response);
  }
}
