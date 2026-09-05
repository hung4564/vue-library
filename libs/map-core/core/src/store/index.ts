import type { MapFCOnUseMap, MapSimple } from '../types';

export type MapAccessor = (
  mapId: string,
  cb?: MapFCOnUseMap,
) => MapSimple | MapSimple[] | undefined;

let registeredMapAccessor: MapAccessor | undefined;

export function registerMapAccessor(fn: MapAccessor) {
  registeredMapAccessor = fn;
}

export function getMap(
  mapId: string,
  cb?: MapFCOnUseMap,
): MapSimple | MapSimple[] | undefined {
  return registeredMapAccessor?.(mapId, cb);
}

export * from './interface';
export * from './store-manager';
export * from './types';
