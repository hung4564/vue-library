import type { FeatureCollection } from 'geojson';
import type { IDataset, IMapboxSourceView } from '../../interfaces';
import { findSiblingOrNearestLeaf } from '../../model/visitors';
import { isDataManagementView } from '../../utils/check';
import { logger } from '../../logger';
import { convertFeatureCollectionToFile } from './convert';
import { downloadBlob, sanitizeExportFilename } from './download';
import {
  GEO_EXPORT_FORMAT_META,
  recordsToFeatureCollection,
  toFeatureCollection,
  type GeoExportFormat,
} from './types';

export function hasGeojsonExportData(layer: IDataset): boolean {
  const management = findSiblingOrNearestLeaf(layer, isDataManagementView);
  if (management) return true;
  const source = findGeojsonSource(layer);
  return !!source;
}

export function findGeojsonSource(
  layer: IDataset,
): IMapboxSourceView | undefined {
  const source = findSiblingOrNearestLeaf(
    layer,
    (dataset) => dataset.type === 'source',
  ) as IMapboxSourceView | undefined;
  if (!source || typeof source.getMapboxSource !== 'function') return undefined;
  try {
    return source.getMapboxSource()?.type === 'geojson' ? source : undefined;
  } catch {
    return undefined;
  }
}

async function resolveGeojsonData(data: unknown): Promise<FeatureCollection | null> {
  if (typeof data === 'string') {
    const response = await fetch(data);
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
    }
    return toFeatureCollection(await response.json());
  }
  return toFeatureCollection(data);
}

export async function getDatasetFeatureCollection(
  layer: IDataset,
): Promise<FeatureCollection | null> {
  const management = findSiblingOrNearestLeaf(layer, isDataManagementView);
  if (management && isDataManagementView(management)) {
    const list = await management.list();
    return recordsToFeatureCollection(list ?? []);
  }

  const source = findGeojsonSource(layer);
  if (!source) return null;

  const fromHelper = await resolveGeojsonData(source.getData?.());
  if (fromHelper) return fromHelper;

  const spec = source.getMapboxSource() as { data?: unknown };
  return resolveGeojsonData(spec?.data);
}

export async function exportDatasetGeo(
  layer: IDataset,
  format: GeoExportFormat,
  options?: { filename?: string },
): Promise<void> {
  const collection = await getDatasetFeatureCollection(layer);
  if (!collection) {
    logger.debug('No GeoJSON data to export', { layerId: layer.id, format });
    return;
  }
  const blob = await convertFeatureCollectionToFile(collection, format);
  const meta = GEO_EXPORT_FORMAT_META[format];
  const base =
    options?.filename ?? sanitizeExportFilename(layer.getName?.() || 'layer');
  const filename = base.toLowerCase().endsWith(`.${meta.extension}`)
    ? base
    : `${base}.${meta.extension}`;
  downloadBlob(blob, filename);
}
