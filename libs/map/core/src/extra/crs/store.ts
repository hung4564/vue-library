import { logHelper } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { MAP_STORE_KEY } from '../../types/key';
import { logger } from './logger';
import { type CrsItem, type MapCrsStore } from './types';

const item_init: CrsItem[] = [
  { name: 'WGS 84', epsg: '4326', default: true, unit: 'degree' },
  {
    name: 'VN-2000',
    epsg: '4756',
    unit: 'degree',
    proj4js:
      '+proj=longlat +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +no_defs +type=crs',
  },
];

export const useMapCrsStore = (mapId: string) =>
  defineStore<MapCrsStore>(['map:core', mapId, MAP_STORE_KEY.CRS], () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      crs: '4326',
      items: item_init.slice(),
      item: item_init[0],
    };
  })();
