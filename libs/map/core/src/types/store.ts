import { MapSimple } from '@hungpvq/shared-map';

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
