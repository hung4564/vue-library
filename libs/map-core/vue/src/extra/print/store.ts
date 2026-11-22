/**
 * Vue-specific print store
 */

import { MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  ensureMapPrintApi,
  ensureMapPrintStore,
  type MapPrintStore,
} from '@hungpvq/map-core/print';

export const KEY = MAP_STORE_KEY.PRINT;

export const useMapPrintStore = (mapId: string): MapPrintStore =>
  ensureMapPrintStore(mapId);

export function useMapPrint(mapId: string) {
  return ensureMapPrintApi(mapId);
}
