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
