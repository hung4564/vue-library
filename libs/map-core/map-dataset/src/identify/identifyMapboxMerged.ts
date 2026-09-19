import { getMap } from '@hungpvq/map-core';
import type { MapGeoJSONFeature, PointLike } from 'maplibre-gl';
import type { IDataset } from '../interfaces/dataset.base';
import type {
  IdentifyFeatureRow,
  IdentifyMultiResult,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
} from '../interfaces/dataset.parts';
import { runAllComponentsWithCheck } from '../model/visitors/helpers';
import { isMapboxLayerView } from '../utils/check';
import {
  buildIdentifyFeatureRows,
  identifyConfigFieldId,
  primaryIdentifyFeatureId,
} from './rows';

type MergedFeatureRow = {
  identify: IIdentifyViewWithMerge;
  identifyId: string;
  feature: IdentifyFeatureRow;
};

type CollectedFeature = {
  identify: IIdentifyViewWithMerge;
  identifyId: string;
  feature: MapGeoJSONFeature;
  rawId: string;
};

function removeDuplicates(collected: CollectedFeature[]): CollectedFeature[] {
  const seen = new Set<string>();
  return collected.filter(({ identifyId, rawId }) => {
    const key = `${identifyId}_${rawId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type MergeIdentifyPayload = {
  mapId: string;
  pointOrBox?: PointLike | [PointLike, PointLike];
  layerIdMap: Record<string, IIdentifyViewWithMerge>;
};

/**
 * One MapLibre query for a merge group, then per-Identify
 * {@link buildIdentifyFeatureRows} (getFeature → source → rendered).
 */
export async function getMergedFeatures(
  _identifies: IIdentifyViewWithMerge[],
  payload: unknown,
): Promise<MergedFeatureRow[]> {
  const typed = payload as MergeIdentifyPayload;

  const queried = await new Promise<MapGeoJSONFeature[]>((resolve) => {
    const layerIdMap = typed.layerIdMap;
    getMap(typed.mapId, (map) => {
      const allLayerIds = Object.keys(layerIdMap).filter((id) =>
        map.getLayer(id),
      );
      if (allLayerIds.length < 1) {
        resolve([]);
        return;
      }
      resolve(
        map.queryRenderedFeatures(typed.pointOrBox, { layers: allLayerIds }),
      );
    });
  });

  const collected: CollectedFeature[] = [];
  for (const feature of queried) {
    const layerId = feature.layer?.id;
    if (!layerId) continue;
    const identify = typed.layerIdMap[layerId];
    if (!identify) continue;
    const fieldId = identifyConfigFieldId(identify);
    const id = primaryIdentifyFeatureId(feature, fieldId);
    if (!id) continue;
    collected.push({
      identify,
      identifyId: identify.id,
      feature,
      rawId: id,
    });
  }

  const deduplicated = removeDuplicates(collected);
  if (!deduplicated.length) return [];

  const indicesByIdentify = new Map<string, number[]>();
  deduplicated.forEach((item, index) => {
    const list = indicesByIdentify.get(item.identifyId) ?? [];
    list.push(index);
    indicesByIdentify.set(item.identifyId, list);
  });

  const rowsByIndex: IdentifyFeatureRow[] = new Array(deduplicated.length);

  await Promise.all(
    [...indicesByIdentify.entries()].map(async ([, indices]) => {
      const identify = deduplicated[indices[0]].identify;
      const features = indices.map((i) => deduplicated[i].feature);
      const rows = await buildIdentifyFeatureRows(identify, features);
      // buildIdentifyFeatureRows also dedupes; align by primary id
      const byId = new Map(rows.map((row) => [String(row.id), row]));
      indices.forEach((collectedIndex) => {
        const rawId = deduplicated[collectedIndex].rawId;
        const row = byId.get(rawId);
        if (row) {
          rowsByIndex[collectedIndex] = row;
        } else {
          // Fallback: keep order if id remapped during resolve
          const order = indices.indexOf(collectedIndex);
          if (rows[order]) rowsByIndex[collectedIndex] = rows[order];
        }
      });
    }),
  );

  return deduplicated
    .map(({ identify, identifyId }, index) => {
      const feature = rowsByIndex[index];
      if (!feature) return null;
      return { identify, identifyId, feature };
    })
    .filter((row): row is MergedFeatureRow => row != null);
}

export const splitResponse = (
  identifies: IIdentifyViewWithMerge[],
  payload: unknown,
  response: unknown,
): IdentifyMultiResult[] => {
  void identifies;
  void payload;
  const rows = Array.isArray(response) ? (response as MergedFeatureRow[]) : [];
  const resultsMap = new Map<string, IdentifyMultiResult>();

  rows.forEach(({ identifyId, identify, feature }) => {
    if (!resultsMap.has(identifyId)) {
      resultsMap.set(identifyId, {
        identify,
        features: [],
      });
    }
    const result = resultsMap.get(identifyId);
    if (result && 'features' in result) {
      result.features.push(feature);
    }
  });

  return Array.from(resultsMap.values());
};

export const mergePayload = (
  identifies: IIdentifyViewWithMerge[],
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike],
): MergeIdentifyPayload & { identifies: IIdentifyViewWithMerge[] } => {
  const layerIdMap: Record<string, IIdentifyViewWithMerge> = {};

  identifies.forEach((identify) => {
    const layers = runAllComponentsWithCheck(
      identify.getParent() || identify,
      (dataset): dataset is IDataset & IMapboxLayerView =>
        isMapboxLayerView(dataset),
      [(dataset) => dataset.getAllLayerIds()],
    );

    const allLayerIds: string[] = Array.from(layers.values()).flat(2);
    allLayerIds.forEach((lid) => {
      layerIdMap[lid] = identify;
    });
  });

  return { identifies, mapId, pointOrBox, layerIdMap };
};
