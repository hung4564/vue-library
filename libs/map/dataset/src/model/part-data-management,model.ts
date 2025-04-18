/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { copyByJson } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import booleanIntersects from '@turf/boolean-intersects';
import { point as pointTurf } from '@turf/turf';
import type { Feature } from 'geojson';
import type { IDataManagementView, IDatasetMap } from '../interfaces';
import LayerDetail from '../modules/LayerDetail/LayerDetail.vue';
import { addComponent, setFeatureHighlight } from '../store';
import { DatasetLeaf } from './dataset.base';
import { findSiblingOrNearestLeaf } from './dataset.visitors';
import { GeojsonSource } from './part-mapbox-source.model';

export abstract class DatasetPartDataManagementComponent<D = any>
  extends DatasetLeaf<{
    fields: { trans?: string; text?: string; value: string }[];
  }>
  implements IDataManagementView<D>
{
  override get type(): string {
    return 'dataManagement';
  }
  abstract showDetail(mapId: string, detail: D): void;
  abstract getList(ids?: string[]): Promise<D[]>;
  get fields() {
    return this.data?.fields;
  }
}

export class DataManagementMapboxComponent<
    D extends {
      id: string;
      geometry: { type: string; coordinates: any[] };
      [key: string]: any;
    } = {
      id: string;
      geometry: { type: string; coordinates: any[] };
      [key: string]: any;
    }
  >
  extends DatasetPartDataManagementComponent<D>
  implements IDatasetMap
{
  protected items: D[] = [];
  addToMap(map: MapSimple): void {
    this.getList().then((items) => {
      const source = findSiblingOrNearestLeaf(
        this,
        (dataset) => dataset.type == 'source'
      ) as GeojsonSource;
      if (source) {
        source.updateData(map, {
          type: 'FeatureCollection',
          features: items.map((x) => {
            const { geometry, ...properties } = x;
            return { type: 'Feature', geometry, properties };
          }),
        });
      }
    });
  }
  removeFromMap(map: MapSimple): void {
    console.warn('not support');
  }
  setItems(items: D[]) {
    this.items = items;
  }
  getList(ids?: string[]): Promise<any[]> {
    return new Promise((resolve) => {
      if (!ids) {
        resolve(this.items);
        return;
      }
      const filteredItems = this.items.filter((item) => ids.includes(item.id));
      resolve(filteredItems);
    });
  }
  showDetail(mapId: string, detail: any): void {
    addComponent(mapId, {
      component: () => LayerDetail,
      attr: {
        item: detail,
        fields: this.fields,
        view: this,
      },
    });
    setFeatureHighlight(mapId, convertItemToFeature(detail), 'detail');
  }

  async addFeatures(features: Feature[] = []) {
    this.items.push(...features.map(convertFeatureToItem<D>));
    this.items = copyByJson(this.items);
  }
  async updateFeatures(features: Feature[] = []) {
    const object_cache = features.reduce<Record<string, Feature>>(
      (acc, cur) => {
        acc[cur.properties!.id] = cur;
        return acc;
      },
      {}
    );
    this.items.forEach((feature, i) => {
      if (object_cache[feature.id]) {
        this.items[i] = convertFeatureToItem<D>(object_cache[feature.id]);
      }
    });
  }
  async deleteFeatures(features: Feature[] = []) {
    const object_cache = features.reduce<Record<string, Feature>>(
      (acc, cur) => {
        acc[cur.properties!.id] = cur;
        return acc;
      },
      {}
    );
    this.items = this.items.filter((x) => !object_cache[x.id]);
  }
  async getFeatures(point: [number, number]) {
    return this.items
      .filter((feature) =>
        booleanIntersects(feature.geometry, pointTurf(point))
      )
      .map(convertItemToFeature);
  }
}

function convertFeatureToItem<T>(feature: Feature) {
  return {
    id: feature.id,
    ...feature.properties,
    geometry: feature.geometry,
  } as T;
}
function convertItemToFeature(item: any): Feature {
  const { geometry, ...properties } = item;
  return {
    id: item.id,
    type: 'Feature',
    geometry,
    properties,
  };
}
