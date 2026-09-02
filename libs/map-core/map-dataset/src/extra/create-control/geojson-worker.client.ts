import type { GeoJSON } from 'geojson';
import { normalizeEpsgCode, reprojectGeojsonToWgs84, toPlainJson } from '@hungpvq/map-core';
import { detectGeojsonCrs, parseGeojsonText } from './geojson-parse';
import type {
  GeojsonWorkerRequest,
  GeojsonWorkerResponse,
} from './geojson.worker';

export type GeojsonLoadResult = {
  geojson: GeoJSON | null;
  crs: string | null;
};

type PendingTask = {
  resolve: (value: GeojsonWorkerResponse) => void;
  reject: (reason?: unknown) => void;
};

let worker: Worker | null = null;
let workerUnavailable = false;
const pending = new Map<string, PendingTask>();

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `geojson-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getWorker(): Worker | null {
  if (workerUnavailable || typeof Worker === 'undefined') {
    return null;
  }
  if (worker) return worker;

  try {
    worker = new Worker(new URL('./geojson.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (event: MessageEvent<GeojsonWorkerResponse>) => {
      const task = pending.get(event.data.id);
      if (!task) return;
      pending.delete(event.data.id);
      if (event.data.ok) {
        task.resolve(event.data);
        return;
      }
      task.reject(new Error(event.data.error || 'GeoJSON worker failed'));
    };
    worker.onerror = () => {
      workerUnavailable = true;
      worker?.terminate();
      worker = null;
      for (const task of pending.values()) {
        task.reject(new Error('GeoJSON worker crashed'));
      }
      pending.clear();
    };
    return worker;
  } catch {
    workerUnavailable = true;
    return null;
  }
}

function postToWorker(
  payload: Omit<GeojsonWorkerRequest, 'id'>,
): Promise<GeojsonWorkerResponse> {
  const instance = getWorker();
  if (!instance) {
    return Promise.reject(new Error('GeoJSON worker unavailable'));
  }

  const id = createRequestId();
  const message = toWorkerMessage(payload, id);
  return new Promise<GeojsonWorkerResponse>((resolve, reject) => {
    pending.set(id, { resolve, reject });
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

  try {
    const response = await postToWorker({ type: 'parse-geojson', text: trimmed });
    return {
      geojson: response.geojson ?? null,
      crs: response.crs ?? null,
    };
  } catch {
    return loadFromTextSync(trimmed);
  }
}

export async function loadGeojsonFileAsync(file: Blob): Promise<GeojsonLoadResult> {
  try {
    const response = await postToWorker({
      type: 'read-geojson',
      file: file as File,
    });
    return {
      geojson: response.geojson ?? null,
      crs: response.crs ?? null,
    };
  } catch {
    const text = await file.text();
    return loadFromTextSync(text);
  }
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

  try {
    const response = await postToWorker({
      type: 'reproject-geojson',
      geojson,
      crs: epsg,
    });
    return response.geojson ?? geojson;
  } catch {
    return reprojectGeojsonToWgs84(geojson, epsg);
  }
}

export function terminateGeojsonWorker(): void {
  worker?.terminate();
  worker = null;
  workerUnavailable = false;
  pending.clear();
}
