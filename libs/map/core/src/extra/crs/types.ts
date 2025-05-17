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
export const MittTypeMapCrsEventKey = {
  setItems: 'map:crs:set-items',
  setCurrent: 'map:crs:set-current',
} as const;
export type MittTypeMapCrs = {
  [MittTypeMapCrsEventKey.setCurrent]: CrsItem | undefined | null;
  [MittTypeMapCrsEventKey.setItems]: CrsItem[];
};
