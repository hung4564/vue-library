import { createNamedComponent } from '../base';
import { findSiblingOrNearestLeaf } from '../visitors';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import {
  createDatasetPartDataManagementComponent,
  createDatasetPartDataManagementDraftComponent,
} from './base';
import type {
  IDataAdapter,
  IDataDraftManagerHook,
  IDataManagementView,
  IDataManagerHook,
  IDataManagerProps,
  IDataMapper,
  IDraftDataManagementView,
  Identifiable,
} from './types';

import { getMap, type MapSimple } from '@hungpvq/map-core';
import type { IMapboxSourceView } from '../../interfaces';
import { isDatasetSourceMap } from '../../utils/check';
import { getUUIDv4 } from '@hungpvq/shared';
import booleanIntersects from '@turf/boolean-intersects';
import { point as pointTurf } from '@turf/helpers';
export function listToFeatureMapper<
  E extends Identifiable = Identifiable,
>(): IDataMapper<E, E> {
  return {
    toFeature(record) {
      if (!record) {
        return;
      }
      const { geometry, ...properties } = record;

      const feature: Feature<Geometry, GeoJsonProperties> = {
        type: 'Feature',
        id: properties['id'] as string | number | undefined,
        geometry: geometry as Geometry,
        properties,
      };

      return feature as unknown as E;
    },
    toItem(feature) {
      if (!feature) {
        return;
      }
      const result: Record<string, unknown> = {
        id:
          (feature as Feature).properties?.['id'] ||
          (feature as Feature).id,
        geometry: (feature as Feature).geometry,
      };

      if ((feature as Feature).properties) {
        Object.assign(result, (feature as Feature).properties);
      }

      return result as E;
    },
    toExternal(feature) {
      if (!feature) {
        return;
      }
      return feature as unknown as E;
    },

    fromExternal(record) {
      if (!record) {
        return;
      }
      return record as unknown as E;
    },
  };
}
export const listLocalAdapter: <T extends Identifiable = Identifiable>(props: {
  key?: string;
  initData?: T[];
}) => IDataAdapter<T> = <T extends Identifiable = Identifiable>({
  key = 'geojson',
  initData = [],
}: {
  key?: string;
  initData?: T[];
}) => {
  let tmp_data: T[] = [];

  function saveToStorage(data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  async function list() {
    if (tmp_data && tmp_data.length > 0) {
      return tmp_data;
    }
    const data = localStorage.getItem(key);
    if (data) {
      try {
        tmp_data = JSON.parse(data);
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
      const id = item.id!;
      const found = data.find((f) => f.id === id);
      return found;
    },
    async create(item) {
      if (!item) return item as unknown as T;
      if (!item.id) (item as { id?: string }).id = getUUIDv4();
      tmp_data.push(item as unknown as T);
      saveToStorage(tmp_data);
      return item as unknown as T;
    },
    async update(item) {
      if (!item) return item as unknown as T;
      if (!item.id) throw new Error('Item must have id to update');
      const idx = tmp_data.findIndex((f) => f.id === item.id);
      if (idx === -1)
        throw new Error(`Feature with id ${String(item.id)} not found`);

      tmp_data[idx] = { ...tmp_data[idx], ...item };
      saveToStorage(tmp_data);
      return tmp_data[idx];
    },

    async delete(item) {
      if (!item) return;
      tmp_data = tmp_data.filter((f) => f.id !== item.id!);
      saveToStorage(tmp_data);
    },
  };
};

export function createDatasetPartDataManagementListLocalComponent<
  T extends Identifiable = Identifiable,
>(
  name: string,
  props: { key?: string; initData?: T[] } & Omit<
    IDataManagerProps<T>,
    'source' | 'adapter' | 'mapper'
  > = {},
): IDataManagementView<T> {
  const mapper = listToFeatureMapper<T>();
  const { key, initData, ...otherProps } = props;
  const propsBase: IDataManagerProps<
    T,
    IDataManagerHook<T>,
    IDataAdapter<T>
  > = {
    source: 'users',
    adapter: listLocalAdapter<T>({
      key: key,
      initData: (initData?.map(mapper.fromExternal) || []).filter((x) => !!x),
    }),
    mapper,
    ...otherProps,
  };
  const manager = createDatasetPartDataManagementComponent<
    T,
    IDataManagerHook<T>,
    IDataAdapter<T>
  >(name, propsBase);
  function addToMap(map: MapSimple) {
    manager.list().then((list) => {
      const source = findSiblingOrNearestLeaf(
        manager,
        (d) => d.type === 'source',
      );
      if (source && isDatasetSourceMap(source)) {
        source.updateData?.(map, {
          type: 'FeatureCollection',
          features: list.map(manager.mapper.toFeature),
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

export function createDatasetParDraftDataManagementListLocalComponent<
  T extends Identifiable = Identifiable,
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
  const mapper = listToFeatureMapper<T>();
  const propsBase: IDataManagerProps<
    T,
    IDataManagerHook<T>,
    IDataAdapter<T>
  > = {
    source: 'users',
    adapter: listLocalAdapter<T>({
      key: key,
      initData: (initData?.map(mapper.fromExternal) || []).filter((x) => !!x),
    }),
    mapper,
    ...otherProps,
  };
  const manager = createDatasetPartDataManagementDraftComponent<T>(
    name,
    propsBase,
  );
  manager.addDependsOn(props.originSource);
  function addToMap(map: MapSimple) {
    manager.list().then((list) => {
      props.originSource.updateData?.(map, {
        type: 'FeatureCollection',
        features: list.map(manager.mapper.toFeature),
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
