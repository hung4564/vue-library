import { createNamedComponent } from '../model/base';
import { findSiblingOrNearestLeaf } from '../model/visitors';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import {
  createDatasetPartDataManagementComponent,
  createDatasetPartDataManagementDraftComponent,
} from '../model/data-management/base';
import type {
  IDataAdapter,
  IDataDraftManagerHook,
  IDataManagementView,
  IDataManagerProps,
  IDraftDataManagementView,
  Identifiable,
} from '../model/data-management/types';

import { getMap, type MapSimple } from '@hungpvq/map-core';
import type { IMapboxSourceView } from '../interfaces';
import { isDatasetSourceMap } from '../utils/check';
import { getUUIDv4 } from '@hungpvq/shared';
import booleanIntersects from '@turf/boolean-intersects';
import { point as pointTurf } from '@turf/turf';

export const geojsonLocalAdapter: <
  T extends Feature<Geometry, any> = Feature<Geometry, any>,
>(props: {
  key?: string;
  initData?: T[];
}) => IDataAdapter<T> = <
  P extends GeoJsonProperties = any,
  T extends Feature<Geometry, P> = Feature<Geometry, P>,
>({
  key = 'geojson',
  initData = [],
}: {
  key?: string;
  initData?: T[];
}) => {
  let tmp_data: T[] = [];

  function saveToStorage(data: T[]) {
    const geojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: data,
    };
    localStorage.setItem(key, JSON.stringify(geojson));
  }
  async function list() {
    if (tmp_data && tmp_data.length > 0) {
      return tmp_data;
    }
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const geojson = JSON.parse(data) as FeatureCollection;
        tmp_data = (geojson.features ?? []) as T[];
      } catch {
        tmp_data = [];
      }
    } else {
      tmp_data = initData;
      saveToStorage(tmp_data);
    }
    return tmp_data;
  }
  return {
    list,
    async getDetail(item: Partial<T>) {
      const data = await list();
      const id = item.properties?.['id'] || item.id;
      const found = data.find((f: any) => f.id === id);
      return found;
    },
    async create(item) {
      if (!item) return item;
      if (!(item as any).id) (item as any).id = getUUIDv4();
      tmp_data.push(item as unknown as T);
      saveToStorage(tmp_data);
      return item as unknown as T;
    },
    async update(item) {
      if (!item) return item;
      if (!(item as any).id) throw new Error('Item must have id to update');
      const idx = tmp_data.findIndex((f: any) => f.id === (item as any).id);
      if (idx === -1)
        throw new Error(`Feature with id ${(item as any).id} not found`);

      tmp_data[idx] = { ...tmp_data[idx], ...item };
      saveToStorage(tmp_data);
      return tmp_data[idx];
    },

    async delete(item) {
      if (!item) return item;
      tmp_data = tmp_data.filter((f: any) => f.id !== item.id);
      saveToStorage(tmp_data);
    },
  };
};

export function createDatasetPartDataManagementGeojsonLocalComponent<
  P extends Identifiable = Identifiable,
  T extends Feature<Geometry, P> & Identifiable = Feature<Geometry, P> &
    Identifiable,
>(
  name: string,
  props: { key?: string; initData?: T[] } & Omit<
    IDataManagerProps<T>,
    'source' | 'adapter'
  > = {},
): IDataManagementView<T> {
  const { key, initData, ...otherProps } = props;
  const manager = createDatasetPartDataManagementComponent<T>(name, {
    adapter: geojsonLocalAdapter<T>({
      key: key,
      initData: initData,
    }),
    source: 'geojson',
    ...otherProps,
  });
  function addToMap(map: MapSimple) {
    manager.list().then((list) => {
      const source = findSiblingOrNearestLeaf(
        manager,
        (d) => d.type === 'source',
      );
      if (source && isDatasetSourceMap(source)) {
        source.updateData?.(map, {
          type: 'FeatureCollection',
          features: list,
        });
        manager.addDependsOn(source);
      }
    });
  }
  return createNamedComponent('DataManagementGeojsonLocalComponent', {
    ...manager,
    async list(params: { point: [number, number] }) {
      const items = await manager.list();
      if (!items || items.length == 0) {
        return items;
      }
      if (params && params.point) {
        return items.filter((feature) =>
          booleanIntersects(feature['geometry'] as any, pointTurf(params.point)),
        );
      }
      return items;
    },
    redraw: (mapId: string) => {
      getMap(mapId, (map) => {
        addToMap(map);
      });
    },
    addToMap,
  });
}

export function createDatasetParDraftDataManagementGeojsonLocalComponent<
  P extends Identifiable = Identifiable,
  T extends Feature<Geometry, P> = Feature<Geometry, P>,
>(
  name: string,
  props: {
    key?: string;
    initData?: T[];
    originSource: IMapboxSourceView;
  } & Omit<
    IDataManagerProps<T, IDataDraftManagerHook<T>, IDataAdapter<T>>,
    'source' | 'adapter'
  >,
): IDraftDataManagementView<T> {
  const { key, initData, ...otherProps } = props;
  const manager = createDatasetPartDataManagementDraftComponent<T>(name, {
    adapter: geojsonLocalAdapter({
      key: key,
      initData: initData,
    }),
    source: 'geojson',
    ...otherProps,
  });
  manager.addDependsOn(props.originSource);
  function addToMap(map: MapSimple) {
    manager.list().then((list) => {
      props.originSource.updateData?.(map, {
        type: 'FeatureCollection',
        features: list,
      });
    });
  }
  return createNamedComponent('DataManagementGeojsonLocalComponent', {
    ...manager,
    async list(params: { point: [number, number] }) {
      const items = await manager.list();
      if (!items || items.length == 0) {
        return items;
      }
      if (params && params.point) {
        return items.filter((feature) =>
          booleanIntersects(feature['geometry'] as any, pointTurf(params.point)),
        );
      }
      return items;
    },
    redraw: (mapId: string) => {
      getMap(mapId, (map) => {
        addToMap(map);
      });
    },
    addToMap,
  });
}
