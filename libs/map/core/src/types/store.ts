import { MapSimple } from '@hungpvq/shared-map';
import {
  MittTypeMapCompare,
  MittTypeMapCompareEventKey,
  MittTypeMapCrs,
  MittTypeMapCrsEventKey,
  MittTypeMapEvent,
  MittTypeMapEventEventKey,
  MittTypeMapLang,
  MittTypeMapLangEventKey,
} from '../extra';
import { MAP_STORE_KEY } from './key';

export type MapStore =
  | {
      map: MapSimple;
      [key: string]: any;
    }
  | {
      maps: MapSimple[];
      [key: string]: any;
      isMulti: boolean;
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
