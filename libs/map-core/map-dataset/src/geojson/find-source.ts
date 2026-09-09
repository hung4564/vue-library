import type { IDataset, IMapboxSourceView } from '../interfaces';
import { findSiblingOrNearestLeaf } from '../model/visitors';

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
