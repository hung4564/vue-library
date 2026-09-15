import type { IDataset } from '../interfaces/dataset.base';
import type { IMapboxSourceView } from '../interfaces/dataset.parts';
import { findPartByType } from '../model/visitors/helpers';

function isGeojsonSourceView(node: IDataset): node is IMapboxSourceView {
  if (typeof (node as IMapboxSourceView).getMapboxSource !== 'function') {
    return false;
  }
  try {
    return (node as IMapboxSourceView).getMapboxSource()?.type === 'geojson';
  } catch {
    return false;
  }
}

export function findGeojsonSource(
  layer: IDataset,
): IMapboxSourceView | undefined {
  return findPartByType(layer, 'source', isGeojsonSourceView);
}
