import { addStore, getStore } from '../../store';
import { addToQueue } from '../../store/queue';
import { MittType } from '../../types';
import { MAP_STORE_KEY } from '../../types/key';
import {
  MittTypeMapCrsEventKey,
  type CrsItem,
  type MapCrsStore,
  type MittTypeMapCrs,
} from './types';

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
  addStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS, {
    crs: '4326',
    items: item_init.slice(),
    item: item_init[0],
  });
}
addToQueue(MAP_STORE_KEY.CRS, initMapCrs);

export async function setCrsItems(mapId: string, items: CrsItem[]) {
  const store = getStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS);
  store.items = items;
  const emitter = getStore<MittType<MittTypeMapCrs>>(mapId, MAP_STORE_KEY.MITT);
  emitter.emit(MittTypeMapCrsEventKey.setItems, items);
}

export const getCrsItems = (mapId: string) =>
  getStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS).items;

export const getCrsItem = (mapId: string) =>
  getStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS).item;

export const getCrs = (mapId: string) =>
  getStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS).crs;

export function setCrs(mapId: string, crs: string | undefined | null) {
  if (!crs) {
    crs = '4326';
  }
  getStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS).crs = crs;
  const crsItem = getStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS).items.find(
    (x) => x.epsg == crs,
  );
  getStore<MapCrsStore>(mapId, MAP_STORE_KEY.CRS).item = crsItem;
  const emitter = getStore<MittType<MittTypeMapCrs>>(mapId, MAP_STORE_KEY.MITT);
  emitter.emit(MittTypeMapCrsEventKey.setCurrent, crsItem);
}
