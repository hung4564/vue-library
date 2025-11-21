import { getUUIDv4 } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import booleanIntersects from '@turf/boolean-intersects';
import { point as pointTurf } from '@turf/turf';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import { createNamedComponent, findSiblingOrNearestLeaf } from '..';
import type { IMapboxSourceView } from '../../interfaces';
import { isDatasetSourceMap } from '../../utils/check';
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
  Identifiable,
  IDraftDataManagementView,
} from './types';
export function listToFeatureMapper<
  E extends Identifiable = Record<string, any>,
>(): IDataMapper<E, E> {
  return {
    toFeature(record) {
      if (!record) {
        return;
      }
      const { geometry, ...properties } = record;

      const feature: any = {
        type: 'Feature',
        id: properties.id,
        geometry,
        properties,
      };

      return feature;
    },
    toItem(feature) {
      if (!feature) {
        return;
      }
      const result: any = {
        id: feature.properties?.id || feature.id,
        geometry: feature.geometry,
      };

      if (feature.properties) {
        Object.assign(result, feature.properties);
      }

      return result;
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
      const id = item.properties?.id || item.id;
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
      tmp_data = tmp_data.filter((f: any) => f.id !== item.id!);
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
          booleanIntersects(feature.geometry as any, pointTurf(params.point)),
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
          booleanIntersects(feature.geometry as any, pointTurf(params.point)),
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
          booleanIntersects(feature.geometry as any, pointTurf(params.point)),
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
          booleanIntersects(feature.geometry as any, pointTurf(params.point)),
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
