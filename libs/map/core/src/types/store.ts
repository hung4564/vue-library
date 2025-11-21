import { MapSimple } from '@hungpvq/shared-map';
import {
  MittTypeMapCompare,
  MittTypeMapCompareEventKey,
} from '../extra/compare/types';
import { MittTypeMapCrs, MittTypeMapCrsEventKey } from '../extra/crs/types';
import {
  MittTypeMapEvent,
  MittTypeMapEventEventKey,
} from '../extra/event/types';
import { MittTypeMapLang, MittTypeMapLangEventKey } from '../extra/lang/types';
import { MAP_STORE_KEY } from './key';

export type MapStore = {
  map?: MapSimple;
  maps?: MapSimple[];
  isMulti?: boolean;
  [key: string]: any;
};

export type MittTypeMap = MittTypeMapCompare &
  MittTypeMapLang &
  MittTypeMapEvent &
  MittTypeMapCrs;
export const MittTypeMapEventKey = {
  [MAP_STORE_KEY.EVENT]: MittTypeMapEventEventKey,
  [MAP_STORE_KEY.MAP_COMPARE]: MittTypeMapCompareEventKey,
  [MAP_STORE_KEY.LANG]: MittTypeMapLangEventKey,
  [MAP_STORE_KEY.CRS]: MittTypeMapCrsEventKey,
};

export function hasMapInstance(
  store?: MapStore,
): store is MapStore & { map: MapSimple } {
  return !!store?.map;
}

export function hasMapCollection(
  store?: MapStore,
): store is MapStore & { maps: MapSimple[] } {
  return Array.isArray(store?.maps) && !!store?.maps?.length;
}

export function isMultiMapStore(
  store?: MapStore,
): store is MapStore & { isMulti: true } {
  return !!store?.isMulti;
}
