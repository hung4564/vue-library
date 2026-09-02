/**
 * Framework-agnostic types for Coordinate Reference System (CRS)
 */
export type MapCrsStore = {
  crs: string;
  /** User-managed CRS entries (custom proj4) plus built-in defaults on the map. */
  items: CrsItem[];
  /** EPSG codes selected for MeasurePoint coordinate display. */
  displayEpsgs: string[];
  item?: CrsItem;
};

export type CrsItem = {
  name: string;
  epsg: string;
  default?: boolean;
  unit: 'degree' | 'meter';
  proj4js?: string;
};

export { DEFAULT_CRS_ITEMS } from '../utils/proj4-crs-catalog';

/** Default CRS entries stored on the map (editable via CrsControl). */
export const INITIAL_MAP_CRS_ITEMS: CrsItem[] = [
  {
    name: 'WGS 84',
    epsg: '4326',
    default: true,
    unit: 'degree',
  },
];

export function createDefaultCrsStore(): MapCrsStore {
  const defaultItem = INITIAL_MAP_CRS_ITEMS[0];

  return {
    crs: defaultItem.epsg,
    items: INITIAL_MAP_CRS_ITEMS.slice(),
    displayEpsgs: [defaultItem.epsg],
    item: defaultItem,
  };
}

export const MittTypeMapCrsEventKey = {
  setItems: 'map:crs:set-items',
  setCurrent: 'map:crs:set-current',
  setDisplayEpsgs: 'map:crs:set-display-epsgs',
} as const;

export type MittTypeMapCrs = {
  [MittTypeMapCrsEventKey.setCurrent]: CrsItem | undefined | null;
  [MittTypeMapCrsEventKey.setItems]: CrsItem[];
  [MittTypeMapCrsEventKey.setDisplayEpsgs]: string[];
};
