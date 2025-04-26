import { getMap } from '@hungpvq/vue-map-core';
import type { MapboxGeoJSONFeature, PointLike } from 'maplibre-gl';
import type {
  IDataset,
  IdentifyResult,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
} from '../../interfaces';
import { isDataManagementView, isMapboxLayerView } from '../../utils/check';
import {
  findSiblingOrNearestLeaf,
  runAllComponentsWithCheck,
} from '../dataset.visitors';

// Tách hàm để loại bỏ các mục trùng lặp
function removeDuplicates(
  collected: {
    identify: IIdentifyViewWithMerge;
    identifyId: string;
    feature: MapboxGeoJSONFeature;
    rawId: string;
  }[]
): {
  identify: IIdentifyViewWithMerge;
  identifyId: string;
  feature: MapboxGeoJSONFeature;
  rawId: string;
}[] {
  const seen = new Set<string>();
  return collected.filter(({ identifyId, rawId }) => {
    const key = `${identifyId}_${rawId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Tách hàm để định dạng lại feature
function formatFeature(
  collected: {
    identify: IIdentifyViewWithMerge;
    identifyId: string;
    feature: MapboxGeoJSONFeature;
    rawId: string;
  }[],
  dataMap: Map<string, any>
): {
  identify: IIdentifyViewWithMerge;
  identifyId: string;
  feature: {
    id: string | number;
    name: string;
    data: any;
  };
}[] {
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

// Tách hàm để xây dựng dataMap từ fetchedData
function buildDataMap(fetchedData: any[]): Map<string, any> {
  return new Map(fetchedData.map((item: any) => [String(item.id), item]));
}

export async function getMergedFeatures(
  identifies: IIdentifyViewWithMerge[],
  payload: {
    mapId: string;
    pointOrBox?: PointLike | [PointLike, PointLike];
    layerIdMap: Record<string, IIdentifyViewWithMerge>;
  }
): Promise<
  {
    identifyId: string;
    identify: IIdentifyViewWithMerge;
    feature: {
      id: string | number;
      name: string;
      data: any;
    };
  }[]
> {
  return new Promise((resolve) => {
    const layerIdMap = payload.layerIdMap;

    getMap(payload.mapId, (map) => {
      const allLayerIds = Object.keys(layerIdMap);
      const queriedFeatures: MapboxGeoJSONFeature[] = map.queryRenderedFeatures(
        payload.pointOrBox,
        { layers: allLayerIds }
      );

      const collected: {
        identify: IIdentifyViewWithMerge;
        identifyId: string;
        feature: MapboxGeoJSONFeature;
        rawId: string;
      }[] = [];

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

      // Loại bỏ các mục trùng lặp
      const deduplicated = removeDuplicates(collected);

      // Tìm dataManagement
      const anyIdentify = identifies[0];
      const maybeDataManagement = findSiblingOrNearestLeaf(
        anyIdentify,
        (dataset) => dataset.type === 'dataManagement'
      );

      // Nếu không có dataManagement, trả về raw feature info
      if (!isDataManagementView(maybeDataManagement)) {
        const results = formatFeature(deduplicated, new Map());
        resolve(results);
        return;
      }

      // Sử dụng dataManagement để fetch dữ liệu
      const dataManagement = maybeDataManagement;
      dataManagement.getList([...idSet]).then((fetchedData) => {
        const dataMap = buildDataMap(fetchedData);

        const results = formatFeature(deduplicated, dataMap);
        resolve(results);
      });
    });
  });
}

export const splitResponse = (
  identifies: IIdentifyViewWithMerge[],
  payload: any,
  response: {
    identifyId: string;
    identify: IIdentifyViewWithMerge;
    feature: {
      id: string | number;
      name: string;
      data: any;
    };
  }[]
): IdentifyResult[] => {
  const resultsMap = new Map<string, IdentifyResult>();

  response.forEach(({ identifyId, identify, feature }) => {
    if (!resultsMap.has(identifyId)) {
      resultsMap.set(identifyId, {
        identify,
        features: [],
      });
    }

    resultsMap.get(identifyId)?.features.push(feature);
  });

  return Array.from(resultsMap.values());
};
export const mergePayload = (
  identifies: IIdentifyViewWithMerge[],
  mapId: string,
  pointOrBox?: PointLike | [PointLike, PointLike]
) => {
  const layerIdMap: Record<string, IIdentifyViewWithMerge> = {};

  identifies.forEach((identify) => {
    const layers = runAllComponentsWithCheck(
      identify.getParent() || identify,
      (dataset): dataset is IDataset & IMapboxLayerView =>
        isMapboxLayerView(dataset),
      [(dataset) => dataset.getAllLayerIds()]
    );

    const allLayerIds: string[] = Array.from(layers.values()).flat(2);
    allLayerIds.forEach((lid) => {
      layerIdMap[lid] = identify;
    });
  });

  return { identifies, mapId, pointOrBox, layerIdMap };
};
