import { copyByJson } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import booleanIntersects from '@turf/boolean-intersects';
import { point as pointTurf } from '@turf/turf';
import type { Feature } from 'geojson';
import type { FieldFeatureDef } from '../../extra';
import { handleMenuActionClick } from '../../extra/menu';
import LayerDetail from '../../modules/LayerDetail/LayerDetail.vue';
import { isDatasetSourceMap } from '../../utils/check';
import {
  convertFeatureToItem,
  convertItemToFeature,
} from '../../utils/convert';
import { createNamedComponent } from '../base';
import { findSiblingOrNearestLeaf } from '../visitors';
import { createDatasetPartDataManagementComponent } from './base';

export function createDataManagementMapboxComponent<
  D extends {
    id: string;
    geometry: { type: string; coordinates: any[] };
    [key: string]: any;
  } = {
    id: string;
    geometry: { type: string; coordinates: any[] };
    [key: string]: any;
  },
>(name: string, config: { fields?: FieldFeatureDef[] } = {}) {
  const base = createDatasetPartDataManagementComponent<D>(name, config);

  let items: D[] = [];

  const getList = (ids?: string[]): Promise<D[]> => {
    if (!ids) return Promise.resolve(items);
    return Promise.resolve(items.filter((item) => ids.includes(item.id)));
  };

  const addToMap = (map: MapSimple) => {
    getList().then((list) => {
      const source = findSiblingOrNearestLeaf(base, (d) => d.type === 'source');
      if (source && isDatasetSourceMap(source)) {
        source.updateData?.(map, {
          type: 'FeatureCollection',
          features: list.map((x) => convertItemToFeature(x)),
        });
      }
    });
  };

  const showDetail = (mapId: string, detail: D) => {
    handleMenuActionClick(
      [
        [
          'addComponent',
          [
            dataComponent,
            mapId,
            {
              componentKey: 'layer-detail',
              attr: {
                item: detail,
                fields: config.fields,
                view: dataComponent,
              },
              check: 'detail',
            },
          ],
        ],
        [
          'highlight',
          [
            dataComponent,
            mapId,
            {
              detail: convertItemToFeature(detail),
              key: 'detail',
            },
          ],
        ],
      ],
      dataComponent,
      mapId,
      detail,
    );
  };

  const dataComponent = createNamedComponent('DataManagementMapboxComponent', {
    ...base,
    addToMap,
    removeFromMap: (map: MapSimple) => {
      console.warn('removeFromMap not supported');
    },
    getList,
    setItems(newItems: D[]) {
      items = newItems;
    },
    showDetail,
    async addFeatures(features: Feature[] = []) {
      items.push(...features.map(convertFeatureToItem<D>));
      items = copyByJson(items);
    },
    async updateFeatures(features: Feature[] = []) {
      const mapFeatures = features.reduce<Record<string, Feature>>(
        (acc, cur) => {
          acc[cur.properties!.id] = cur;
          return acc;
        },
        {},
      );
      items = items.map((item) =>
        mapFeatures[item.id]
          ? convertFeatureToItem<D>(mapFeatures[item.id])
          : item,
      );
    },
    async deleteFeatures(features: Feature[] = []) {
      const ids = features.map((f) => f.properties!.id);
      items = items.filter((item) => !ids.includes(item.id));
    },
    async getFeatures(point: [number, number]) {
      return items
        .filter((feature) =>
          booleanIntersects(feature.geometry, pointTurf(point)),
        )
        .map(convertItemToFeature);
    },
  });

  return dataComponent;
}
