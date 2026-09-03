import type { GeoJSON } from 'geojson';
// Vite workers cannot resolve workspace package names and would leave
// `@hungpvq/map-core` external; import the source file so reproject is bundled.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { reprojectGeojsonToWgs84 } from '../../../../core/src/utils/geojson-reproject';
import { detectGeojsonCrs, parseGeojsonText } from './geojson-parse';

export type GeojsonWorkerRequest =
  | {
      id: string;
      type: 'parse-geojson';
      text: string;
    }
  | {
      id: string;
      type: 'read-geojson';
      file: File;
    }
  | {
      id: string;
      type: 'reproject-geojson';
      geojson: GeoJSON;
      crs?: string | null;
    };

export type GeojsonWorkerResponse = {
  id: string;
  ok: boolean;
  geojson?: GeoJSON | null;
  crs?: string | null;
  error?: string;
};

type WorkerLogLevel = 'debug' | 'info' | 'warn' | 'error';

function parseAndDetect(text: string): {
  geojson: GeoJSON | null;
  crs: string | null;
} {
  const geojson = parseGeojsonText(text);
  return {
    geojson,
    crs: geojson ? detectGeojsonCrs(geojson) : null,
  };
}

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
      postLog(formatLogArgs(args), { level: map[method] });
    };
  }
}

installConsoleForwarding();
postLog('GeoJSON worker ready');

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
    const report = createProgressPoster(message.id);
    postLog(`${message.type} start`, {
      level: 'info',
      taskId: message.id,
    });

    switch (message.type) {
      case 'parse-geojson': {
        report(0, 1, 'parse');
        postLog(`parse text (${message.text.length} chars)`, {
          taskId: message.id,
        });
        const parsed = parseAndDetect(message.text);
        geojson = parsed.geojson;
        crs = parsed.crs;
        postLog(
          `parsed ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
          { taskId: message.id },
        );
        report(1, 1, 'parse');
        break;
      }
      case 'read-geojson': {
        report(0, 2, 'read');
        postLog(`read file (${formatBytes(message.file.size)})`, {
          taskId: message.id,
        });
        const text = await message.file.text();
        report(1, 2, 'parse');
        postLog(`file text ready (${text.length} chars), parsing`, {
          taskId: message.id,
        });
        const parsed = parseAndDetect(text);
        geojson = parsed.geojson;
        crs = parsed.crs;
        postLog(
          `parsed ${describeGeojson(geojson)}${crs ? `, CRS EPSG:${crs}` : ''}`,
          { taskId: message.id },
        );
        report(2, 2, 'parse');
        break;
      }
      case 'reproject-geojson': {
        const total =
          message.geojson?.type === 'FeatureCollection'
            ? message.geojson.features.length
            : 1;
        const fromCrs = message.crs || 'unknown';
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
        break;
      }
      default:
        throw new Error('Unknown GeoJSON worker task');
    }

    postLog(`${message.type} done in ${Date.now() - started}ms`, {
      taskId: message.id,
    });
    const response: GeojsonWorkerResponse = {
      id: message.id,
      ok: true,
      geojson,
      crs,
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
