import { logHelper } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { logger } from '../logger';

export const KEY = 'print';
export type PrintOption = {
  ratio: number;
  orientation: 'portrait' | 'landscape';
  format: 'pdf' | 'png' | 'jpg';
};
export type MapPrintStore = {
  show?: (props: PrintOption) => void;
  close?: () => void;
  save?: (cb?: (image: string) => Promise<void>) => void;
  saveAll?: (cb?: (image: string) => Promise<void>) => void;
};

export const useMapPrintStore = (mapId: string) =>
  defineStore<MapPrintStore>(['map:core', mapId, KEY], () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {};
  })();

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
