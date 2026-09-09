import type { FeatureCollection } from 'geojson';
import type { GeoExportFormat } from './types';
import { GEO_EXPORT_FORMAT_META } from './types';

type TokmlFn = (
  geojson: FeatureCollection,
  options?: Record<string, unknown>,
) => string;

function featuresToCsv(data: FeatureCollection): string {
  const rows = data.features.map((feature) => ({
    ...(feature.properties ?? {}),
    geometry: JSON.stringify(feature.geometry),
  }));
  const keys = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((key) => keys.add(key));
  }
  const headers = Array.from(keys);
  const escape = (value: unknown) => {
    if (value == null) return '';
    const text = String(value);
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => escape((row as Record<string, unknown>)[header])).join(','),
    ),
  ];
  return `\uFEFF${lines.join('\n')}`;
}

function toBlob(result: unknown, mime: string): Blob | null {
  if (result instanceof Blob) return result;
  if (result instanceof ArrayBuffer) return new Blob([result], { type: mime });
  if (result instanceof Uint8Array) {
    const copy = new Uint8Array(result.byteLength);
    copy.set(result);
    return new Blob([copy], { type: mime });
  }
  if (Array.isArray(result)) return new Blob([new Uint8Array(result)], { type: mime });
  if (typeof result === 'string') return new Blob([result], { type: mime });
  return null;
}

export async function convertFeatureCollectionToFile(
  data: FeatureCollection,
  format: GeoExportFormat,
): Promise<Blob> {
  const meta = GEO_EXPORT_FORMAT_META[format];

  switch (format) {
    case 'geojson':
      return new Blob([JSON.stringify(data)], { type: meta.mime });
    case 'csv':
      return new Blob([featuresToCsv(data)], { type: meta.mime });
    case 'kml': {
      try {
        // tokml ships without TypeScript types
        // @ts-expect-error -- no bundled types for 'tokml'
        const mod = (await import('tokml')) as { default?: TokmlFn };
        const tokml = mod.default;
        if (typeof tokml !== 'function') {
          throw new Error('Install optional peer "tokml" to export KML');
        }
        return new Blob([tokml(data)], { type: meta.mime });
      } catch {
        throw new Error('Install optional peer "tokml" to export KML');
      }
    }
    case 'shapefile': {
      try {
        const shpwrite = await import('@mapbox/shp-write');
        const result = await shpwrite.zip(data, {
          folder: 'shapefile',
          types: {
            point: 'points',
            polygon: 'polygons',
            line: 'lines',
          },
          compression: 'DEFLATE',
          outputType: 'blob',
        });
        const blob = toBlob(result, meta.mime);
        if (!blob) throw new Error('Could not convert GeoJSON to shapefile');
        return blob;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.startsWith('Could not convert')
        ) {
          throw error;
        }
        throw new Error(
          'Install optional peer "@mapbox/shp-write" to export Shapefile',
        );
      }
    }
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
