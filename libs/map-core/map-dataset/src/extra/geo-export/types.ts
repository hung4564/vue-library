import type { Feature, FeatureCollection, Geometry } from 'geojson';

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

export function isGeoExportFormat(value: unknown): value is GeoExportFormat {
  return (
    typeof value === 'string' &&
    (GEO_EXPORT_FORMATS as readonly string[]).includes(value)
  );
}

export function toFeatureCollection(
  data: unknown,
): FeatureCollection | null {
  if (!data) return null;
  if (typeof data === 'string') return null;
  if (typeof data !== 'object') return null;
  const value = data as { type?: string };

  if (value.type === 'FeatureCollection' && Array.isArray((data as FeatureCollection).features)) {
    return data as FeatureCollection;
  }
  if (value.type === 'Feature' && (data as Feature).geometry) {
    return { type: 'FeatureCollection', features: [data as Feature] };
  }
  if (
    typeof value.type === 'string' &&
    'coordinates' in (data as Geometry)
  ) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: data as Geometry,
        },
      ],
    };
  }
  return null;
}

export function recordsToFeatureCollection(list: unknown[]): FeatureCollection {
  const features: Feature[] = [];
  for (const item of list) {
    const feature = recordToFeature(item);
    if (feature) features.push(feature);
  }
  return { type: 'FeatureCollection', features };
}

function recordToFeature(item: unknown): Feature | null {
  if (!item || typeof item !== 'object') return null;
  const rec = item as Record<string, unknown>;
  if (rec['type'] === 'Feature' && rec['geometry']) {
    return rec as unknown as Feature;
  }
  if (!rec['geometry']) return null;
  const geometry = rec['geometry'];
  const properties = rec['properties'];
  const id = rec['id'];
  const rest: Record<string, unknown> = { ...rec };
  delete rest['geometry'];
  delete rest['properties'];
  delete rest['id'];
  delete rest['type'];
  const props =
    properties && typeof properties === 'object' && !Array.isArray(properties)
      ? (properties as Record<string, unknown>)
      : rest;
  return {
    type: 'Feature',
    id: id as string | number | undefined,
    geometry: geometry as Geometry,
    properties: props,
  };
}
