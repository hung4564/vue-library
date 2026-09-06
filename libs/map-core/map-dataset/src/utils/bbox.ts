import type { BBox } from 'geojson';
import type { IBoundView, IDataset, IMetadataView } from '../interfaces';
import { findSiblingOrNearestLeaf } from '../model/visitors';

export function isValidBbox(bbox: unknown): bbox is BBox {
  return (
    Array.isArray(bbox) &&
    bbox.length >= 4 &&
    bbox.slice(0, 4).every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

/**
 * Resolve a dataset bbox by priority:
 * 1. explicit `bbox` argument
 * 2. nearest `bound` dataset part (`getData()`)
 * 3. nearest `metadata` dataset part (`metadata.bbox`)
 * 4. `info.metadata.bbox` on the start node (if present)
 */
export function resolveDatasetBbox(
  layer: IDataset,
  bbox?: BBox | null,
): BBox | undefined {
  if (isValidBbox(bbox)) return bbox;

  const bound = findSiblingOrNearestLeaf(
    layer,
    (dataset) => dataset.type === 'bound',
  ) as IBoundView | undefined;
  if (bound && typeof bound.getData === 'function') {
    const boundBbox = bound.getData();
    if (isValidBbox(boundBbox)) return boundBbox;
  }

  const metadata = findSiblingOrNearestLeaf(
    layer,
    (dataset) => dataset.type === 'metadata',
  ) as (IDataset & IMetadataView) | undefined;
  if (isValidBbox(metadata?.metadata?.bbox)) return metadata.metadata.bbox;

  const info = (
    layer as IDataset & { info?: { metadata?: { bbox?: BBox } } }
  ).info;
  if (isValidBbox(info?.metadata?.bbox)) return info.metadata.bbox;

  return undefined;
}
