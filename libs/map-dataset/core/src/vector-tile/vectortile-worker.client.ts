import { connectWorkerMonitor } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { getOrCreateStore } from '@hungpvq/shared-store';
import { addProtocol } from 'maplibre-gl';

import {
  closeArchive,
  getArchiveMeta,
  getArchiveTile,
  openMbtilesFromBuffer,
  openPmtilesFromBuffer,
  openPmtilesFromUrl,
  parseVectorTileProtocolUrl,
  registerVectorTileLocalProtocols,
  type VectorTileArchiveKind,
  type VectorTileArchiveMeta,
  type VectorTileOpenResult,
} from './archives';
import type {
  VectorTileWorkerRequest,
  VectorTileWorkerResponse,
} from './vectortile.worker';

export type {
  VectorTileArchiveKind,
  VectorTileArchiveMeta,
  VectorTileOpenResult,
};

const VECTOR_TILE_WORKER_ID = 'vectortile';

type VectorTileWorkerSlot = {
  urlOverride: string | URL | undefined;
  protocolsReady: boolean;
};

function slot(): VectorTileWorkerSlot {
  return getOrCreateStore('__hungpvq_vectortile_worker__', () => ({
    urlOverride: undefined as string | URL | undefined,
    protocolsReady: false,
  }));
}

export type ConfigureVectorTileWorkerOptions = {
  url: string | URL;
};

export function configureVectorTileWorker(
  options: ConfigureVectorTileWorkerOptions,
): void {
  slot().urlOverride = options.url;
  vectorTileWorker.terminate();
}

function resolveOverrideUrl(): URL {
  const override = slot().urlOverride;
  if (override == null) {
    throw new Error('Vector tile worker URL override is not configured');
  }
  if (override instanceof URL) return override;
  const base =
    typeof document !== 'undefined' && document.baseURI
      ? document.baseURI
      : import.meta.url;
  return new URL(override, base);
}

export function resolveVectorTileWorkerUrl(): URL {
  if (slot().urlOverride != null) return resolveOverrideUrl();
  return new URL(
    /* @vite-ignore */ 'assets/vectortile.worker.js',
    import.meta.url,
  );
}

const vectorTileWorker = connectWorkerMonitor<
  VectorTileWorkerRequest,
  VectorTileWorkerResponse
>({
  id: VECTOR_TILE_WORKER_ID,
  name: 'Vector tiles',
  createWorker: () => {
    if (slot().urlOverride != null) {
      return new Worker(resolveOverrideUrl(), { type: 'module' });
    }
    return new Worker(new URL('./vectortile.worker.ts', import.meta.url), {
      type: 'module',
    });
  },
});

function fromOpen(response: VectorTileWorkerResponse): VectorTileOpenResult {
  if (!response.open) {
    throw new Error(response.error || 'Vector tile open failed');
  }
  return response.open;
}

async function readArchiveBuffer(
  file: Blob | File | ArrayBuffer,
): Promise<ArrayBuffer> {
  return file instanceof ArrayBuffer ? file : file.arrayBuffer();
}

/** Worker-first open with main-thread fallback (archive + get-tile share one realm). */
function openArchiveWorkerFirst(
  type: VectorTileWorkerRequest['type'],
  workerPost: (taskId: string) => Promise<VectorTileWorkerResponse>,
  mainOpen: () => Promise<VectorTileOpenResult>,
): Promise<VectorTileOpenResult> {
  return vectorTileWorker.runTask(
    type,
    {
      engine: 'worker',
      run: async (taskId) => fromOpen(await workerPost(taskId)),
    },
    { engine: 'main', run: async () => mainOpen() },
  );
}

export async function openMbtilesArchive(
  file: Blob | File | ArrayBuffer,
): Promise<VectorTileOpenResult> {
  const buffer = await readArchiveBuffer(file);
  const archiveId = getUUIDv4();
  ensureVectorTileProtocols();
  return openArchiveWorkerFirst(
    'open-mbtiles',
    (taskId) =>
      vectorTileWorker.post({
        id: taskId,
        type: 'open-mbtiles',
        archiveId,
        buffer,
      }),
    () => openMbtilesFromBuffer(buffer, archiveId),
  );
}

export async function openPmtilesUrl(
  url: string,
): Promise<VectorTileOpenResult> {
  const trimmed = url.trim();
  const archiveId = getUUIDv4();
  ensureVectorTileProtocols();
  return openArchiveWorkerFirst(
    'open-pmtiles-url',
    (taskId) =>
      vectorTileWorker.post({
        id: taskId,
        type: 'open-pmtiles-url',
        archiveId,
        url: trimmed,
      }),
    () => openPmtilesFromUrl(trimmed, archiveId),
  );
}

export async function openPmtilesFile(
  file: Blob | File | ArrayBuffer,
): Promise<VectorTileOpenResult> {
  const buffer = await readArchiveBuffer(file);
  const archiveId = getUUIDv4();
  ensureVectorTileProtocols();
  return openArchiveWorkerFirst(
    'open-pmtiles-file',
    (taskId) =>
      vectorTileWorker.post({
        id: taskId,
        type: 'open-pmtiles-file',
        archiveId,
        buffer,
      }),
    () => openPmtilesFromBuffer(buffer, archiveId),
  );
}

export async function getVectorTileArchiveTile(
  archiveId: string,
  z: number,
  x: number,
  y: number,
): Promise<ArrayBuffer | null> {
  if (getArchiveMeta(archiveId)) {
    return getArchiveTile(archiveId, z, x, y);
  }

  return vectorTileWorker.runTask(
    'get-tile',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await vectorTileWorker.post({
          id: taskId,
          type: 'get-tile',
          archiveId,
          z,
          x,
          y,
        });
        if (!response.ok) throw new Error(response.error || 'get-tile failed');
        return response.tile ?? null;
      },
    },
    {
      engine: 'main',
      run: async () => getArchiveTile(archiveId, z, x, y),
    },
  );
}

export async function closeVectorTileArchive(archiveId: string): Promise<void> {
  await vectorTileWorker.runTask(
    'close-archive',
    {
      engine: 'worker',
      run: async (taskId) => {
        await vectorTileWorker.post({
          id: taskId,
          type: 'close-archive',
          archiveId,
        });
      },
    },
    {
      engine: 'main',
      run: async () => {
        closeArchive(archiveId);
      },
    },
  );
}

/**
 * Register MapLibre local archive protocols once (`mbtiles-local` / `pmtiles-local`).
 * Both resolve tiles via {@link getVectorTileArchiveTile}.
 */
export function ensureVectorTileProtocols(): void {
  if (slot().protocolsReady) return;

  registerVectorTileLocalProtocols(addProtocol, async (params) => {
    const parsed = parseVectorTileProtocolUrl(params.url);
    if (!parsed) {
      throw new Error(`Invalid local vector-tile protocol URL: ${params.url}`);
    }
    const tile = await getVectorTileArchiveTile(
      parsed.archiveId,
      parsed.z,
      parsed.x,
      parsed.y,
    );
    return { data: tile ?? new Uint8Array() };
  });
  slot().protocolsReady = true;
}
