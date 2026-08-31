/**
 * Framework-agnostic types for Coordinate Reference System (CRS)
 */
export type MapCrsStore = {
  crs: string;
  items: CrsItem[];
  item?: CrsItem;
};

export type CrsItem = {
  name: string;
  epsg: string;
  default?: boolean;
  unit: 'degree' | 'meter';
  proj4js?: string;
};

export const DEFAULT_CRS_ITEMS: CrsItem[] = [
  { name: 'WGS 84', epsg: '4326', default: true, unit: 'degree' },
  {
    name: 'VN-2000',
    epsg: '4756',
    unit: 'degree',
    proj4js:
      '+proj=longlat +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +no_defs +type=crs',
  },
];

export function createDefaultCrsStore(): MapCrsStore {
  return {
    crs: '4326',
    items: DEFAULT_CRS_ITEMS.slice(),
    item: DEFAULT_CRS_ITEMS[0],
  };
}

export const MittTypeMapCrsEventKey = {
  setItems: 'map:crs:set-items',
  setCurrent: 'map:crs:set-current',
} as const;

export type MittTypeMapCrs = {
  [MittTypeMapCrsEventKey.setCurrent]: CrsItem | undefined | null;
  [MittTypeMapCrsEventKey.setItems]: CrsItem[];
};
