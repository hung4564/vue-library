import type {
  IDataset,
  IMapboxLayerView,
  IMapboxSourceView,
} from '../interfaces';
import { findSiblingOrNearestLeaf } from '../model/visitors';

export type DatasetSourceKind = 'vector' | 'raster' | 'unknown';

const VECTOR_SOURCE_TYPES = new Set(['geojson', 'vector']);
const RASTER_SOURCE_TYPES = new Set([
  'raster',
  'raster-dem',
  'raster-array',
  'image',
  'video',
]);
const VECTOR_LAYER_TYPES = new Set([
  'fill',
  'line',
  'symbol',
  'circle',
  'heatmap',
  'fill-extrusion',
]);
const RASTER_LAYER_TYPES = new Set([
  'raster',
  'raster-particle',
  'hillshade',
  'color-relief',
]);

function readSourceType(dataset: IDataset): string | undefined {
  const source = findSiblingOrNearestLeaf(
    dataset,
    (node) => node.type === 'source',
  ) as IMapboxSourceView | undefined;
  if (!source || typeof source.getMapboxSource !== 'function') return undefined;
  try {
    return source.getMapboxSource()?.type;
  } catch {
    return undefined;
  }
}

function kindFromSourceType(type?: string): DatasetSourceKind | undefined {
  if (!type) return undefined;
  if (VECTOR_SOURCE_TYPES.has(type)) return 'vector';
  if (RASTER_SOURCE_TYPES.has(type) || type.startsWith('raster')) {
    return 'raster';
  }
  return undefined;
}

function kindFromLayers(dataset: IDataset): DatasetSourceKind | undefined {
  const layer = findSiblingOrNearestLeaf(
    dataset,
    (node) => node.type === 'layer',
  ) as (IDataset & IMapboxLayerView) | undefined;
  if (!layer || typeof layer.getLayers !== 'function') return undefined;
  try {
    const layers = layer.getLayers() ?? [];
    if (layers.some((item) => RASTER_LAYER_TYPES.has(item.type))) {
      return 'raster';
    }
    if (layers.some((item) => VECTOR_LAYER_TYPES.has(item.type))) {
      return 'vector';
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/** Vector vs raster for a list/layer node, from its nearest source or map layers. */
export function getDatasetSourceKind(
  dataset?: IDataset | null,
): DatasetSourceKind {
  if (!dataset) return 'unknown';
  return (
    kindFromSourceType(readSourceType(dataset)) ??
    kindFromLayers(dataset) ??
    'unknown'
  );
}
