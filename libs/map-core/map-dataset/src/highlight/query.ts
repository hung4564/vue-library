import type { MapSimple } from '@hungpvq/map-core';
import type { Feature } from 'geojson';
import type { MapGeoJSONFeature, PointLike } from 'maplibre-gl';
import type { IDataset, IMapboxLayerView } from '../interfaces';
import { runAllComponentsWithCheck } from '../model/visitors';
import { convertFeatureToItem, convertItemToFeature } from '../utils';
import { isMapboxLayerView } from '../utils/check';
import { DEFAULT_HIGHLIGHT_POINTER, findHighlightPart } from './cascade';
import type { IHighlightPart } from './part';
import { getMap, logHelper } from '@hungpvq/map-core';
import { loggerHighlight } from '../logger';

export type HighlightHit = {
  feature: Feature;
  dataset: IDataset;
  raw?: MapGeoJSONFeature;
};

function isPointLike(value: unknown): value is PointLike {
  if (Array.isArray(value)) {
    return (
      value.length === 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number'
    );
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value
  ) {
    const v = value as { x: unknown; y: unknown };
    return typeof v.x === 'number' && typeof v.y === 'number';
  }
  return false;
}

function getXY(point: PointLike): { x: number; y: number } {
  if (Array.isArray(point)) return { x: point[0], y: point[1] };
  return { x: (point as { x: number }).x, y: (point as { y: number }).y };
}

/**
 * Hit-test map layers belonging to datasets that have a highlight part.
 */
export async function queryHighlightAtPoint(
  mapId: string,
  datasets: IDataset[],
  pointOrBox?: PointLike | [PointLike, PointLike],
  props = { selectThreshold: 5 },
): Promise<HighlightHit | undefined> {
  if (!pointOrBox) return undefined;

  const cache: Record<string, IDataset> = {};
  const allLayerIds: string[] = [];

  for (const ds of datasets) {
    const part =
      findHighlightPart(ds) ??
      (ds.type === 'highlight' ? ds : undefined);
    const root = part?.getParent?.() ?? ds.getParent?.() ?? ds;
    const results = runAllComponentsWithCheck(
      root,
      (dataset): dataset is IDataset & IMapboxLayerView =>
        isMapboxLayerView(dataset),
      [
        (dataset) => {
          return dataset.getAllLayerIds();
        },
      ],
    );
    const layerIds = Array.from(results.values()).flat(2) as string[];
    const owner = (part?.getParent?.() ?? root) as IDataset;
    for (const layerId of layerIds) {
      cache[layerId] = owner;
      allLayerIds.push(layerId);
    }
  }

  if (!allLayerIds.length) {
    logHelper(loggerHighlight, mapId, 'queryHighlightAtPoint').debug('no layers');
    return undefined;
  }

  const features = await new Promise<MapGeoJSONFeature[]>((resolve) => {
    getMap(mapId, (map: MapSimple) => {
      let queryBox: PointLike | [PointLike, PointLike] | undefined =
        pointOrBox;
      if (queryBox && isPointLike(queryBox)) {
        const point = getXY(queryBox);
        queryBox = [
          [point.x - props.selectThreshold, point.y + props.selectThreshold],
          [point.x + props.selectThreshold, point.y - props.selectThreshold],
        ];
      }
      const queried = map.queryRenderedFeatures(queryBox as never, {
        layers: allLayerIds.filter((id) => map.getLayer(id)),
      });
      resolve(queried);
    });
  });

  if (!features.length) return undefined;
  const raw = features[0];
  const dataset = cache[raw.layer.id];
  if (!dataset) return undefined;

  // convertFeatureToItem flattens props + geometry (no `.data` wrapper).
  const item = convertFeatureToItem<{
    id?: string | number;
    geometry?: Feature['geometry'];
    [key: string]: unknown;
  }>(raw);
  if (!item?.geometry) {
    logHelper(loggerHighlight, mapId, 'queryHighlightAtPoint').warn(
      'hit missing geometry',
      { layerId: raw.layer.id },
    );
    return undefined;
  }
  const feature = convertItemToFeature({
    ...item,
    geometry: item.geometry,
  });
  return { feature, dataset, raw };
}

export function datasetsFromHighlightParts(parts: IDataset[]): IDataset[] {
  return parts.map((p) => p.getParent?.() ?? p);
}

/**
 * Keep highlight parts (or parent datasets) whose `pointer` policy allows
 * the given map event. Manual `show()` is unaffected.
 */
export function filterDatasetsForPointerEvent(
  partsOrDatasets: IDataset[],
  event: 'click' | 'hover',
): IDataset[] {
  return partsOrDatasets.filter((ds) => {
    const part =
      (ds.type === 'highlight' ? (ds as IHighlightPart) : undefined) ??
      findHighlightPart(ds);
    if (!part?.getHighlightPointer) {
      return true;
    }
    const policy = {
      ...DEFAULT_HIGHLIGHT_POINTER,
      ...part.getHighlightPointer(),
    };
    return event === 'click' ? policy.click !== false : policy.hover !== false;
  });
}
