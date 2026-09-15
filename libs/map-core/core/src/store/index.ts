import type { MapFCOnUseMap, MapSimple } from '../types';

export type {
  EventEmitter,
  IMapStoreAdapter,
  LoggerFunction,
  MapFCOnUseMap,
} from './interface';
export { MAP_CORE_EVENT, MapStoreManager } from './store-manager';
export type {
  AddStoreOptions,
  DefaultValue,
  MapRootStore,
  MapStore,
  MapStoreInternal,
  StoreCleanup,
} from './types';

export type MapAccessor = (
  mapId: string,
  cb?: MapFCOnUseMap,
) => MapSimple | undefined;

let registeredMapAccessor: MapAccessor | undefined;

export function registerMapAccessor(fn: MapAccessor) {
  registeredMapAccessor = fn;
}

export function getMap(
  mapId: string,
  cb?: MapFCOnUseMap,
): MapSimple | undefined {
  return registeredMapAccessor?.(mapId, cb);
}
