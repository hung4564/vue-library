import {
  ensureMapPrintApi,
  ensureMapPrintStore,
  type MapPrintStore,
} from '@hungpvq/map-core/print';

export const useMapPrintStore = (mapId: string): MapPrintStore =>
  ensureMapPrintStore(mapId);

export function useMapPrint(mapId: string) {
  return ensureMapPrintApi(mapId);
}
