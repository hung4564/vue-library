import type { GeoJSON } from 'geojson';
import {
  applyWorkerMonitorMessage,
  normalizeEpsgCode,
  reprojectGeojsonToWgs84,
  runMonitoredTask,
  toPlainJson,
  WorkerMonitor,
} from '@hungpvq/map-core';
import { detectGeojsonCrs, parseGeojsonText } from './geojson-parse';
import type {
  GeojsonWorkerRequest,
  GeojsonWorkerResponse,
} from './geojson.worker';

export const GEOJSON_WORKER_ID = 'geojson';

export type GeojsonLoadResult = {
  geojson: GeoJSON | null;
  crs: string | null;
};

type PendingTask = {
  resolve: (value: GeojsonWorkerResponse) => void;
  reject: (reason?: unknown) => void;
};

const geojsonWorker = WorkerMonitor.register(GEOJSON_WORKER_ID, {
  name: 'GeoJSON',
});

let worker: Worker | null = null;
let workerUnavailable = false;
const pending = new Map<string, PendingTask>();

function getWorker(): Worker | null {
  if (workerUnavailable || typeof Worker === 'undefined') {
    return null;
  }
  if (worker) return worker;

  try {
    worker = new Worker(new URL('./geojson.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (applyWorkerMonitorMessage(GEOJSON_WORKER_ID, event.data)) return;
      const data = event.data as GeojsonWorkerResponse;
      const task = pending.get(data.id);
      if (!task) return;
      pending.delete(data.id);
      if (data.ok) {
        task.resolve(data);
        return;
      }
      task.reject(new Error(data.error || 'GeoJSON worker failed'));
    };
    worker.onerror = () => {
      workerUnavailable = true;
      geojsonWorker.setStatus('unavailable');
      geojsonWorker.setLastError('GeoJSON worker crashed');
      geojsonWorker.log({
        level: 'error',
        message: 'GeoJSON worker crashed',
      });
      worker?.terminate();
      worker = null;
      for (const [id, task] of pending) {
        geojsonWorker.failTask(id, 'GeoJSON worker crashed', {
          engine: 'worker',
          fallback: true,
        });
        task.reject(new Error('GeoJSON worker crashed'));
      }
      pending.clear();
    };
    if (geojsonWorker.snapshot().pending.length === 0) {
      geojsonWorker.setStatus('idle');
    }
    geojsonWorker.log({ level: 'info', message: 'GeoJSON worker started' });
    return worker;
  } catch (error) {
    workerUnavailable = true;
    geojsonWorker.setStatus('unavailable');
    geojsonWorker.setLastError(
      error instanceof Error ? error.message : 'GeoJSON worker failed to start',
    );
    geojsonWorker.log({
      level: 'error',
      message:
        error instanceof Error
          ? `GeoJSON worker failed to start: ${error.message}`
          : 'GeoJSON worker failed to start',
    });
    return null;
  }
}

function postToWorker(
  payload: Omit<GeojsonWorkerRequest, 'id'>,
  taskId: string,
): Promise<GeojsonWorkerResponse> {
  const instance = getWorker();
  if (!instance) {
    return Promise.reject(new Error('GeoJSON worker unavailable'));
  }

  const message = toWorkerMessage(payload, taskId);
  return new Promise<GeojsonWorkerResponse>((resolve, reject) => {
    pending.set(taskId, { resolve, reject });
    instance.postMessage(message);
  });
}

function toWorkerMessage(
  payload: Omit<GeojsonWorkerRequest, 'id'>,
  id: string,
): GeojsonWorkerRequest {
  if (payload.type === 'reproject-geojson') {
    return {
      id,
      type: 'reproject-geojson',
      crs: payload.crs,
      geojson: toPlainJson(payload.geojson),
    };
  }
  return { ...payload, id } as GeojsonWorkerRequest;
}

function loadFromTextSync(text: string): GeojsonLoadResult {
  const geojson = parseGeojsonText(text);
  return {
    geojson,
    crs: geojson ? detectGeojsonCrs(geojson) : null,
  };
}

export async function loadGeojsonTextAsync(text: string): Promise<GeojsonLoadResult> {
  const trimmed = text.trim();
  if (!trimmed) return { geojson: null, crs: null };

  return runMonitoredTask(
    GEOJSON_WORKER_ID,
    'parse-geojson',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await postToWorker(
          { type: 'parse-geojson', text: trimmed },
          taskId,
        );
        return {
          geojson: response.geojson ?? null,
          crs: response.crs ?? null,
        };
      },
    },
    {
      engine: 'main',
      run: async () => loadFromTextSync(trimmed),
    },
  );
}

export async function loadGeojsonFileAsync(file: Blob): Promise<GeojsonLoadResult> {
  return runMonitoredTask(
    GEOJSON_WORKER_ID,
    'read-geojson',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await postToWorker(
          { type: 'read-geojson', file: file as File },
          taskId,
        );
        return {
          geojson: response.geojson ?? null,
          crs: response.crs ?? null,
        };
      },
    },
    {
      engine: 'main',
      run: async () => {
        const text = await file.text();
        return loadFromTextSync(text);
      },
    },
  );
}

/** Parse in worker when available; returns GeoJSON only. */
export async function parseGeojsonTextAsync(text: string): Promise<GeoJSON | null> {
  return (await loadGeojsonTextAsync(text)).geojson;
}

export async function reprojectGeojsonToWgs84Async(
  geojson: GeoJSON,
  crs?: string | null,
): Promise<GeoJSON> {
  const epsg = normalizeEpsgCode(crs) ?? '4326';
  if (epsg === '4326') return geojson;

  return runMonitoredTask(
    GEOJSON_WORKER_ID,
    'reproject-geojson',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await postToWorker(
          { type: 'reproject-geojson', geojson, crs: epsg },
          taskId,
        );
        return response.geojson ?? geojson;
      },
    },
    {
      engine: 'main',
      run: async (taskId) =>
        reprojectGeojsonToWgs84(geojson, epsg, (current, total) => {
          geojsonWorker.setProgress(taskId, {
            current,
            total,
            message: 'reproject',
          });
        }),
    },
  );
}

export function terminateGeojsonWorker(): void {
  worker?.terminate();
  worker = null;
  workerUnavailable = false;
  for (const [id, task] of pending) {
    geojsonWorker.failTask(id, 'GeoJSON worker terminated', {
      engine: 'worker',
      fallback: true,
    });
    task.reject(new Error('GeoJSON worker terminated'));
  }
  pending.clear();
  geojsonWorker.setStatus('terminated');
  geojsonWorker.setLastError(undefined);
}
