/**
 * Vue-specific print store
 * Framework-agnostic types are available directly from @hungpvq/map-core
 */

import type { MapPrintStore, PrintOption } from '@hungpvq/map-core';
import { logHelper } from '@hungpvq/map-core';
import { createMapScopedStore } from '../../../store/store';
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger().setNamespace('map:print', 2);

export const KEY = 'print' as const;

export const useMapPrintStore = (mapId: string) =>
  createMapScopedStore<MapPrintStore>(mapId, KEY as any, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {};
  });

export function useMapPrint(mapId: string) {
  const store = useMapPrintStore(mapId);
  function initPrint({ show, close, save, saveAll }: MapPrintStore) {
    store.show = show;
    store.close = close;
    store.save = save;
    store.saveAll = saveAll;
  }
  function closePrint() {
    store.close?.();
  }
  function showPrint(
    options: PrintOption = {
      ratio: 1,
      orientation: 'portrait',
      format: 'png',
    },
  ) {
    store.show?.(options);
  }
  function savePrint(cb?: (image: string) => Promise<void>) {
    logHelper(logger, mapId, 'store').debug('savePrint', cb);
    store.save?.(cb);
  }
  function saveAllPrint(cb?: (image: string) => Promise<void>) {
    logHelper(logger, mapId, 'store').debug('saveAllPrint', cb);
    store.saveAll?.(cb);
  }
  return { showPrint, closePrint, savePrint, saveAllPrint, initPrint };
}
