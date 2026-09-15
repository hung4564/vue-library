import type { FeatureCollection } from 'geojson';
import type { IDataset } from '../interfaces/dataset.base';
import { findGeojsonSource } from '../geojson/find-source';
import { findSiblingOrNearestLeaf } from '../model/visitors/helpers';
import { isDataManagementView } from '../utils/check';
import { convertFeatureCollectionToFile } from './convert';
import { reprojectFeatureCollectionForExport } from './crs';
import { downloadBlob, sanitizeExportFilename } from './download';
import {
  asFeatureCollection,
  recordsToFeatureCollection,
} from '../utils/feature-collection';
import {
  GEO_EXPORT_FORMAT_META,
  type GeoExportFormat,
} from './types';

export function hasGeojsonExportData(layer: IDataset): boolean {
  const management = findSiblingOrNearestLeaf(layer, isDataManagementView);
  if (management) return true;
  const source = findGeojsonSource(layer);
  return !!source;
}

async function resolveGeojsonData(
  data: unknown,
): Promise<FeatureCollection | null> {
  if (typeof data === 'string') {
    const response = await fetch(data);
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
    }
    return asFeatureCollection(await response.json());
  }
  return asFeatureCollection(data);
}

export async function getDatasetFeatureCollection(
  layer: IDataset,
): Promise<FeatureCollection | null> {
  const management = findSiblingOrNearestLeaf(layer, isDataManagementView);
  if (management && isDataManagementView(management)) {
    const { items } = await management.list({ pageSize: 'all' });
    return recordsToFeatureCollection(items ?? []);
  }

  const source = findGeojsonSource(layer);
  if (!source) return null;

  const fromHelper = await resolveGeojsonData(source.getData?.());
  if (fromHelper) return fromHelper;

  const spec = source.getMapboxSource() as { data?: unknown };
  return resolveGeojsonData(spec?.data);
}

/** Local convert + download for a FeatureCollection (used by the controller). */
export async function exportFeatureCollectionGeo(
  collection: FeatureCollection,
  format: GeoExportFormat,
  options?: {
    filename?: string;
    sourceCrs?: string | null;
    targetCrs?: string | null;
  },
): Promise<void> {
  const prepared = await reprojectFeatureCollectionForExport(collection, {
    sourceCrs: options?.sourceCrs,
    targetCrs: options?.targetCrs,
  });
  const blob = await convertFeatureCollectionToFile(prepared, format);
  const meta = GEO_EXPORT_FORMAT_META[format];
  const base = sanitizeExportFilename(options?.filename || 'layer');
  const filename = base.toLowerCase().endsWith(`.${meta.extension}`)
    ? base
    : `${base}.${meta.extension}`;
  downloadBlob(blob, filename);
}
