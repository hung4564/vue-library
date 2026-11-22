import { runWorkerMonitor } from '@hungpvq/map-core/worker';

import {
  closeArchive,
  getArchiveTile,
  openMbtilesFromBuffer,
  openPmtilesFromBuffer,
  openPmtilesFromUrl,
  type VectorTileOpenResult,
} from './archives';

export type VectorTileWorkerRequest =
  | {
      id: string;
      type: 'open-mbtiles';
      archiveId?: string;
      buffer: ArrayBuffer;
    }
  | {
      id: string;
      type: 'open-pmtiles-url';
      archiveId?: string;
      url: string;
    }
  | {
      id: string;
      type: 'open-pmtiles-file';
      archiveId?: string;
      buffer: ArrayBuffer;
    }
  | {
      id: string;
      type: 'get-tile';
      archiveId: string;
      z: number;
      x: number;
      y: number;
    }
  | {
      id: string;
      type: 'close-archive';
      archiveId: string;
    };

export type VectorTileWorkerResponse = {
  id: string;
  ok: boolean;
  open?: VectorTileOpenResult;
  tile?: ArrayBuffer | null;
  error?: string;
};

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

runWorkerMonitor<VectorTileWorkerRequest>(
  async (message, ctx) => {
    const report = (current: number, total?: number, msg?: string) => {
      ctx.throwIfAborted();
      ctx.report(current, total, msg);
    };

    switch (message.type) {
      case 'open-mbtiles': {
        report(0, 1, 'open-mbtiles');
        ctx.log(`open mbtiles (${formatBytes(message.buffer.byteLength)})`);
        const open = await openMbtilesFromBuffer(
          message.buffer,
          message.archiveId,
        );
        report(1, 1, 'open-mbtiles');
        return { open };
      }
      case 'open-pmtiles-url': {
        report(0, 1, 'open-pmtiles');
        ctx.log(`open pmtiles url ${message.url}`);
        const open = await openPmtilesFromUrl(message.url, message.archiveId);
        report(1, 1, 'open-pmtiles');
        return { open };
      }
      case 'open-pmtiles-file': {
        report(0, 1, 'open-pmtiles');
        ctx.log(
          `open pmtiles file (${formatBytes(message.buffer.byteLength)})`,
        );
        const open = await openPmtilesFromBuffer(
          message.buffer,
          message.archiveId,
        );
        report(1, 1, 'open-pmtiles');
        return { open };
      }
      case 'get-tile': {
        const tile = await getArchiveTile(
          message.archiveId,
          message.z,
          message.x,
          message.y,
        );
        return { tile };
      }
      case 'close-archive': {
        closeArchive(message.archiveId);
        return {};
      }
      default:
        throw new Error(
          `Unknown vector-tile worker task: ${(message as { type: string }).type}`,
        );
    }
  },
  { readyMessage: 'Vector tiles worker ready' },
);
