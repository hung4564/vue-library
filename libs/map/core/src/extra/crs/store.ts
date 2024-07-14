import { reactive } from 'vue';
import { addStore, getStore } from '../../store';
import { addToQueue } from '../../store/queue';
import type { CrsItem, MapCrsStore } from './types';

const KEY = 'crs';

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
function initMapCrs(mapId: string) {
  addStore<MapCrsStore>(
    mapId,
    KEY,
    reactive({
      crs: '4326',
      items: item_init.slice(),
      item: item_init[0],
    })
  );
}
addToQueue(KEY, initMapCrs);

export async function setCrsItems(mapId: string, items: CrsItem[]) {
  const store = getStore<MapCrsStore>(mapId, KEY);
  store.items = items;
}

export const getCrsItems = (mapId: string) =>
  getStore<MapCrsStore>(mapId, KEY).items;

export const getCrsItem = (mapId: string) =>
  getStore<MapCrsStore>(mapId, KEY).item;

export const getCrs = (mapId: string) => getStore<MapCrsStore>(mapId, KEY).crs;

export function setCrs(mapId: string, crs: string) {
  getStore<MapCrsStore>(mapId, KEY).crs = crs;
  getStore<MapCrsStore>(mapId, KEY).item = getStore<MapCrsStore>(
    mapId,
    KEY
  ).items.find((x) => x.epsg == crs);
}
