export const GEO_EXPORT_FORMATS = [
  'geojson',
  'kml',
  'csv',
  'shapefile',
] as const;

export type GeoExportFormat = (typeof GEO_EXPORT_FORMATS)[number];

export const GEO_EXPORT_FORMAT_META: Record<
  GeoExportFormat,
  { name: string; extension: string; mime: string }
> = {
  geojson: {
    name: 'GeoJSON',
    extension: 'geojson',
    mime: 'application/geo+json',
  },
  kml: {
    name: 'KML',
    extension: 'kml',
    mime: 'application/vnd.google-earth.kml+xml',
  },
  csv: {
    name: 'CSV',
    extension: 'csv',
    mime: 'text/csv',
  },
  shapefile: {
    name: 'Shapefile (zip)',
    extension: 'zip',
    mime: 'application/zip',
  },
};
