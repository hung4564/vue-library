import type {
  IDataset,
  IdentifyFeatureRow,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
  IdentifyResult,
} from '../interfaces';
import { runAllComponentsWithCheck } from '../model/visitors';
import type { MapGeoJSONFeature, PointLike } from 'maplibre-gl';
import { isMapboxLayerView } from '../utils/check';
import { getMap } from '@hungpvq/map-core';

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

function formatFeature(
  collected: CollectedFeature[],
  dataMap: Map<string, unknown>,
): MergedFeatureRow[] {
  return collected.map(({ identify, identifyId, feature, rawId }) => ({
    identify,
    identifyId,
    feature: {
      id: rawId,
      name: feature.properties?.[identify.config.field_name || 'name'] ?? '',
      data: dataMap.get(rawId) || {
        ...feature.properties,
        geometry: feature.geometry,
      },
    },
  }));
}

export type MergeIdentifyPayload = {
  mapId: string;
  pointOrBox?: PointLike | [PointLike, PointLike];
  layerIdMap: Record<string, IIdentifyViewWithMerge>;
};

export async function getMergedFeatures(
  identifies: IIdentifyViewWithMerge[],
  payload: unknown,
): Promise<MergedFeatureRow[]> {
  const typed = payload as MergeIdentifyPayload;
  return new Promise((resolve) => {
    const layerIdMap = typed.layerIdMap;

    getMap(typed.mapId, (map) => {
      const allLayerIds = Object.keys(layerIdMap).filter((id) =>
        map.getLayer(id),
      );
      if (allLayerIds.length < 1) {
        resolve([]);
        return;
      }
      const queriedFeatures: MapGeoJSONFeature[] = map.queryRenderedFeatures(
        typed.pointOrBox,
        { layers: allLayerIds },
      );

      const collected: CollectedFeature[] = [];

      const idSet = new Set<string>();

      queriedFeatures.forEach((feature) => {
        const layerId = feature.layer.id;
        const identify = layerIdMap[layerId];
        const id =
          feature.properties?.[identify.config.field_id || 'id'] ?? feature.id;
        if (!id) return;

        const idStr = String(id);
        idSet.add(idStr);

        collected.push({
          identify,
          identifyId: identify.id,
          feature,
          rawId: idStr,
        });
      });

      const deduplicated = removeDuplicates(collected);

      const results = formatFeature(deduplicated, new Map());
      resolve(results);
      return;
    });
  });
}

export const splitResponse = (
  identifies: IIdentifyViewWithMerge[],
  payload: unknown,
  response: unknown,
): IdentifyResult[] => {
  void identifies;
  void payload;
  const rows = Array.isArray(response) ? (response as MergedFeatureRow[]) : [];
  const resultsMap = new Map<string, IdentifyResult>();

  rows.forEach(({ identifyId, identify, feature }) => {
    if (!resultsMap.has(identifyId)) {
      resultsMap.set(identifyId, {
        identify,
        features: [],
      });
    }
    const result = resultsMap.get(identifyId);
    if (result)
      if ('features' in result) {
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
