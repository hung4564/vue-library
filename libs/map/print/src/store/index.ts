import { addStore, addToQueue, getStore } from '@hungpvq/vue-map-core';

export const KEY = 'print';
export type PrintOption = {
  ratio: number;
  orientation: 'portrait' | 'landscape';
  format: 'pdf' | 'png' | 'jpg';
};
export type MapEventStore = {
  show: (props: PrintOption) => void;
  close: () => void;
  save: (cb?: (image: string) => Promise<void>) => void;
  saveAll: (cb?: (image: string) => Promise<void>) => void;
};
function initMapPrint(mapId: string) {
  addStore<MapEventStore>(mapId, KEY, undefined);
}
addToQueue(KEY, initMapPrint);
export const initPrint = (
  mapId: string,
  { show, close, save, saveAll }: MapEventStore
) => {
  addStore<MapEventStore>(mapId, KEY, { show, close, save, saveAll });
};
export function showPrint(
  mapId: string,
  options: PrintOption = {
    ratio: 1,
    orientation: 'portrait',
    format: 'png',
  }
) {
  const store = getStore<MapEventStore>(mapId, KEY);
  store.show(options);
}
export function closePrint(mapId: string) {
  const store = getStore<MapEventStore>(mapId, KEY);
  store.close();
}

export function savePrint(
  mapId: string,
  cb?: (image: string) => Promise<void>
) {
  const store = getStore<MapEventStore>(mapId, KEY);
  store.save(cb);
}
export function saveAllPrint(
  mapId: string,
  cb?: (image: string) => Promise<void>
) {
  const store = getStore<MapEventStore>(mapId, KEY);
  store.saveAll(cb);
}
