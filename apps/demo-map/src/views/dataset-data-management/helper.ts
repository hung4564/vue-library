import { MapSimple } from '@hungpvq/shared-map';
import {
  ID,
  IDataDraftManagerHook,
  Identifiable,
  IMapboxLayerView,
  IMapboxSourceView,
} from '@hungpvq/vue-map-dataset';

interface MapDraftSyncHookOptions {
  map: MapSimple;
  originSource: IMapboxSourceView;
  draftSource: IMapboxSourceView;
  layers: IMapboxLayerView[];
  layerDrafts: IMapboxLayerView[];
}
export function createMapDraftSyncHook<T extends Identifiable = any>(
  options: MapDraftSyncHookOptions,
): IDataDraftManagerHook<T> {
  const { map, originSource, draftSource, layers = [], layerDrafts } = options;

  const hiddenIds = new Set<ID>();
  const hiddenDraftIds = new Set<ID>();

  function updateSourceData(
    source: IMapboxSourceView,
    updater: (features: any[]) => any[],
  ) {
    const current = source.getData().features ?? [];
    const updated = updater(current);
    source.updateData?.(map, {
      type: 'FeatureCollection',
      features: updated,
    });
  }

  function applyDraftLayerFilter() {
    const allLayers = layerDrafts.map((x) => x.getLayers()).flat();
    const ids = Array.from(hiddenDraftIds).filter((x) => x != null);
    for (const layer of allLayers) {
      const layerId = layer.id;
      const currentFilter = 'filter' in layer ? layer.filter : null;
      const hideFilter: any = ['!in', 'id', ...ids];
      const newFilter =
        ids.length === 0
          ? currentFilter
          : currentFilter
            ? ['all', currentFilter, hideFilter]
            : ['all', hideFilter];
      map.setFilter(layerId, newFilter as any);
    }
  }
  function applyOriginLayerFilter() {
    const allLayers = layers.map((x) => x.getLayers()).flat();
    const ids = Array.from(hiddenIds).filter((x) => x != null);
    for (const layer of allLayers) {
      const layerId = layer.id;
      const currentFilter = 'filter' in layer ? layer.filter : null;
      const hideFilter: any = ['!in', 'id', ...ids];
      const newFilter =
        ids.length === 0
          ? currentFilter
          : currentFilter
            ? ['all', currentFilter, hideFilter]
            : ['all', hideFilter];
      map.setFilter(layerId, newFilter as any);
    }
  }

  function showAllInOrigin() {
    const allLayers = layers.map((x) => x.getLayers()).flat();
    hiddenIds.clear();
    for (const layer of allLayers) {
      const layerId = layer.id;
      const currentFilter = 'filter' in layer ? layer.filter : null;
      map.setFilter(layerId, currentFilter);
    }
  }

  return {
    async beforeGetDetail(ctx) {
      const current = draftSource.getData().features ?? [];
      const id = ctx.mapper.toExternal(ctx.payload)?.id;
      const found = current.find((f: any) => f.properties?.id == id);
      if (!found) return;
      hiddenDraftIds.add(id!);
      applyDraftLayerFilter();
      return { cancel: true, returnValue: found };
    },

    afterGetDetail(ctx) {
      const item = ctx.payload;
      if (!item) return;
      const item_id = ctx.mapper.toExternal(item)?.id;
      hiddenIds.add(item_id!);

      applyOriginLayerFilter();
      applyDraftLayerFilter();
      updateSourceData(draftSource, (features) =>
        features.filter((f) => f.properties?.id !== item_id),
      );
    },

    async afterDraftCreate(ctx) {
      const item = ctx.payload;
      if (!item) return;
      updateSourceData(draftSource, (features) => [
        ...features,
        ctx.mapper.toFeature(item),
      ]);
    },

    async afterDraftUpdate(ctx) {
      const item = ctx.payload;
      if (!item) return;

      const item_id = ctx.mapper.toExternal(item)?.id;
      hiddenIds.add(item_id!);
      hiddenDraftIds.delete(item_id!);
      applyOriginLayerFilter();
      applyDraftLayerFilter();

      updateSourceData(draftSource, (features) => {
        const item_feature = ctx.mapper.toFeature(item);
        const idx = features.findIndex((f) => f.properties?.id === item_id);
        if (idx >= 0) features[idx] = item_feature;
        else features.push(item_feature);
        return features;
      });
    },

    async afterDraftDelete(ctx) {
      const item = ctx.payload;
      if (!item) return;

      const item_id = ctx.mapper.toExternal(item)?.id;
      hiddenIds.add(item_id!);
      applyOriginLayerFilter();

      updateSourceData(draftSource, (features) =>
        features.filter((f) => f.properties?.id !== item_id),
      );
    },

    async afterDraftCommit(ctx) {
      const items = ctx.payload || [];
      for (const d of items) {
        if (d.status === 'created' || d.status === 'updated') {
          const modified_id = d.modified?.id;
          updateSourceData(originSource, (features) => {
            const idx = features.findIndex(
              (f) => f.properties?.id === modified_id,
            );
            if (idx >= 0) features[idx] = d.modified;
            else features.push(d.modified);
            return features;
          });
        } else if (d.status === 'deleted') {
          const original_id = d.original?.id;
          updateSourceData(originSource, (features) =>
            features.filter((f) => f.properties?.id !== original_id),
          );
        }
      }

      updateSourceData(draftSource, () => []);
      showAllInOrigin();
    },
    async afterDraftDiscard(ctx) {
      if (ctx.payload) {
        const item_id = ctx.mapper.toExternal(ctx.payload).id;
        updateSourceData(draftSource, (features) =>
          features.filter((f) => f.properties?.id != item_id),
        );
        hiddenIds.delete(item_id!);
        hiddenDraftIds.delete(item_id!);
        applyOriginLayerFilter();
        applyDraftLayerFilter();
      } else {
        updateSourceData(draftSource, () => []);
        showAllInOrigin();
      }
    },
    async afterCancel(ctx) {
      const item_id = ctx.mapper.toExternal(ctx.payload)?.id;
      hiddenIds.delete(item_id!);
      hiddenDraftIds.delete(item_id!);
      applyOriginLayerFilter();
      applyDraftLayerFilter();
    },
  };
}
