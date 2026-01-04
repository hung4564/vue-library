<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import {
  useConvertToGeoJSON,
  useDownloadFile,
  useGeoConvertToFile,
} from '@hungpvq/shared-file';
import { loggerFactory } from '@hungpvq/shared-log';
import type { MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
import {
  EventManagementControl,
  getChartRandomColor,
  getMap,
  Map,
} from '@hungpvq/vue-map-core';
import {
  ComponentManagementControl,
  createDatasetParDraftDataManagementGeojsonLocalComponent,
  createDatasetParDraftDataManagementListLocalComponent,
  createDatasetPartDataManagementGeojsonLocalComponent,
  createDatasetPartDataManagementListLocalComponent,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartIdentifyComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMenuBuilder,
  createMultiMapboxLayerComponent,
  createRootDataset,
  findSiblingOrNearestLeaf,
  IDataManagementView,
  IdentifyControl,
  isDataManagementView,
  LayerControl,
  LayerSimpleMapboxBuild,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import {
  DrawControl,
  DrawingType,
  getFirstFeatureByMap,
  MapDrawOption,
  useMapDraw,
} from '@hungpvq/vue-map-draw';
import { mdiDownload, mdiPencil } from '@mdi/js';
import type { Feature } from 'geojson';
import { ComponentPublicInstance, ref } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import FormEdit from './form-edit.vue';
import { createMapDraftSyncHook } from './helper';
loggerFactory.enable('map:draw');
const popupRef = ref<
  ComponentPublicInstance & {
    open: (data: Partial<any>) => Promise<any>;
  }
>();

const { downloadFile } = useDownloadFile();
const { convertList } = useConvertToGeoJSON();
const { convert } = useGeoConvertToFile();
const mapId = ref(getUUIDv4());
function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(createDefaultListDataset());
  addDataset(createDrawListDataset());
  addDataset(createDrawDraftListDataset(map));
  addDataset(createDefaultListItemDataset());
  addDataset(createDrawListItemDataset());
  addDataset(createDrawDraftListItemDataset(map));
}

function createDrawDraftListItemDataset(map: MapSimple) {
  const color = getChartRandomColor();
  const list = createDatasetPartListViewUiComponentBuilder(
    'Draw draft list item',
  )
    .setColor(color)
    .build();
  const source = createDatasetPartGeojsonSourceComponent('Draw draft source', {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent('Draw draft layer', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setFilter(['==', '$type', 'Point'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('line')
      .setFilter(['==', '$type', 'LineString'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setFilter(['==', '$type', 'Polygon'])
      .setOpacity(0.5)
      .setColor(color)
      .build(),
  ]);
  const groupDraft = createGroupDataset('Draft group');
  const sourceDraft = createDatasetPartGeojsonSourceComponent('Draw source', {
    type: 'FeatureCollection',
    features: [],
  });
  const layerDraft = createMultiMapboxLayerComponent('Draw layer', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setFilter(['==', '$type', 'Point'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('line')
      .setFilter(['==', '$type', 'LineString'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setFilter(['==', '$type', 'Polygon'])
      .setOpacity(0.5)
      .setColor(color)
      .build(),
  ]);
  const mapDraftSyncHook = createMapDraftSyncHook<{
    id: string;
    name: string;
  }>({
    map,
    originSource: source,
    draftSource: sourceDraft,
    layers: [layer],
    layerDrafts: [layerDraft],
  });
  const dataManagement = createDatasetParDraftDataManagementListLocalComponent<{
    id: string;
    name: string;
  }>('data management', {
    initData: [],
    key: 'geojson-list-draw-draft',
    originSource: source,
    hooks: [
      {
        beforeGetDetail(ctx) {
          console.info('beforeGetDetail', ctx);
        },
        afterGetDetail(ctx) {
          console.info('afterGetDetail', ctx);
        },
        beforeCreate(ctx) {
          console.info('beforeCreate', ctx);
        },
        afterCreate(ctx) {
          console.info('afterCreate', ctx);
        },
        beforeUpdate(ctx) {
          console.info('beforeUpdate', ctx);
        },
        afterUpdate(ctx) {
          console.info('afterUpdate', ctx);
        },
        beforeDelete(ctx) {
          console.info('beforeDelete', ctx);
        },
        afterDelete(ctx) {
          console.info('afterDelete', ctx);
        },
        beforeDraftCreate(ctx) {
          console.info('beforeDraftCreate', ctx);
        },
        afterDraftCreate(ctx) {
          console.info('afterDraftCreate', ctx);
        },
        beforeDraftUpdate(ctx) {
          console.info('beforeDraftUpdate', ctx);
        },
        afterDraftUpdate(ctx) {
          console.info('afterDraftUpdate', ctx);
        },
        beforeDraftDelete(ctx) {
          console.info('beforeDraftDelete', ctx);
        },
        afterDraftDelete(ctx) {
          console.info('afterDraftDelete', ctx);
        },
        beforeDraftCommit(ctx) {
          console.info('beforeDraftCommit', ctx);
        },
        afterDraftCommit(ctx) {
          console.info('afterDraftCommit', ctx);
        },
        beforeDraftDiscard(ctx) {
          console.info('beforeDraftDiscard', ctx);
        },
        afterDraftDiscard(ctx) {
          console.info('afterDraftDiscard', ctx);
        },
        beforeCancel(ctx) {
          console.info('beforeCancel', ctx);
        },
        afterCancel(ctx) {
          console.info('afterCancel', ctx);
        },
      },
      mapDraftSyncHook,
    ],
  });
  const dataset = createRootDataset('Draw draft');
  list.addMenus([
    createMenuDownload(),
    createMenuDrawLayer({
      draft: { show: true },
      cleanAfterDone: true,
      drawSupports: [
        DrawingType.POINT,
        DrawingType.POLYGON,
        DrawingType.LINE_STRING,
      ],
      getDraftItems: dataManagement.getDraftItems,
      selectFeature: async ({ point }, { mapId }) => {
        let feature: Feature | undefined = undefined;
        getMap(mapId, (map) => {
          if (feature) {
            return;
          }
          feature = getFirstFeatureByMap(
            map,
            point,
            layer.getAllLayerIds().concat(layerDraft.getAllLayerIds()),
          );
        });
        if (!feature) {
          return;
        }
        return dataManagement.handWithFeature(
          feature,
          dataManagement.getDetail,
        );
      },
      addFeature: (feature) =>
        dataManagement.handWithFeature(feature, dataManagement.create),
      updateFeature: (feature) =>
        dataManagement.handWithFeature(feature, dataManagement.update),
      deleteFeature: (feature) =>
        dataManagement.handWithFeature(feature, dataManagement.delete),
      commit: dataManagement.commit.bind(dataManagement),
      discard: dataManagement.discard.bind(dataManagement),
      redraw: dataManagement.redraw.bind(dataManagement),
      cancel: (feature) =>
        dataManagement.handWithFeature(feature, dataManagement.cancel),
    }),
  ]);
  groupDraft.add(sourceDraft);
  groupDraft.add(layerDraft);
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(groupDraft);
  dataset.add(dataManagement);
  return dataset;
}
function createDrawListItemDataset() {
  const dataset = createRootDataset('Default');
  const list = createDatasetPartListViewUiComponentBuilder('Draw list item')
    .addMenus([createMenuDownload()])
    .build();
  const source = createDatasetPartGeojsonSourceComponent(list.getName(), {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent(list.getName(), [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .setOpacity(0.5)
      .build(),
  ]);
  const dataManagement = createDatasetPartDataManagementListLocalComponent<{
    id: string;
    name: string;
  }>(list.getName(), {
    key: 'geojson-list-draw',
    initData: [],
    hooks: [
      {
        beforeCreate(ctx) {
          console.info('beforeCreate', ctx);
        },
        beforeUpdate(ctx) {
          console.info('beforeUpdate', ctx);
        },
        beforeDelete(ctx) {
          console.info('beforeDelete', ctx);
        },
        afterCreate(ctx) {
          console.info('afterCreate', ctx);
        },
        afterUpdate(ctx) {
          console.info('afterUpdate', ctx);
        },
        afterDelete(ctx) {
          console.info('afterDelete', ctx);
        },
      },
    ],
  });
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  list.addMenus([
    createMenuDrawLayer({
      cleanAfterDone: true,
      drawSupports: [
        DrawingType.POINT,
        DrawingType.POLYGON,
        DrawingType.LINE_STRING,
      ],
      selectFeature: async ({ point }, { mapId }) => {
        let feature: Feature | undefined = undefined;
        getMap(mapId, (map) => {
          if (feature) {
            return;
          }
          feature = getFirstFeatureByMap(map, point, layer.getAllLayerIds());
        });
        if (!feature) {
          return;
        }
        return dataManagement.handWithFeature(
          feature,
          dataManagement.getDetail,
        );
      },
      addFeature: (feature) =>
        dataManagement.handWithFeature(feature, dataManagement.create),
      updateFeature: (feature) =>
        dataManagement.handWithFeature(feature, dataManagement.update),
      deleteFeature: (feature) =>
        dataManagement.handWithFeature(feature, dataManagement.delete),
      redraw: dataManagement.redraw.bind(dataManagement),
    }),
  ]);
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}
function createDefaultListItemDataset() {
  const dataset = createRootDataset('Default');
  const list = createDatasetPartListViewUiComponentBuilder('Default list item')
    .addMenus([createMenuDownload()])
    .build();
  const source = createDatasetPartGeojsonSourceComponent(list.getName(), {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent(list.getName(), [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .setOpacity(0.5)
      .build(),
  ]);
  const dataManagement = createDatasetPartDataManagementListLocalComponent(
    list.getName(),
    {
      key: 'geojson-list',
      initData: [
        {
          id: 1,
          name: 'name 1',
          geometry: {
            coordinates: [
              [
                [106.36703216122214, 21.339114575625146],
                [106.36703216122214, 21.258074000185104],
                [106.49668551611245, 21.258074000185104],
                [106.49668551611245, 21.339114575625146],
                [106.36703216122214, 21.339114575625146],
              ],
            ],
            type: 'Polygon',
          },
        },
      ],
    },
  );
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}
function createDefaultListDataset() {
  const dataset = createRootDataset('Default');
  const list = createDatasetPartListViewUiComponentBuilder('Default list')
    .addMenus([createMenuDownload()])
    .build();
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .setOpacity(0.5)
      .build(),
  ]);
  const dataManagement = createDatasetPartDataManagementGeojsonLocalComponent(
    'data management',
    {
      initData: [
        {
          id: '1',
          type: 'Feature',
          properties: {
            id: '1',
            name: 'feature 1',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [105.76641783359327, 20.95368549262608],
                [105.76641783359327, 20.8061675909956],
                [105.95982873776939, 20.8061675909956],
                [105.95982873776939, 20.95368549262608],
                [105.76641783359327, 20.95368549262608],
              ],
            ],
          },
        },
        {
          id: '2',
          type: 'Feature',
          properties: {
            id: '2',
            name: 'feature 2',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [105.6018867927948, 20.882848913115083],
                [105.6018867927948, 20.709350165412573],
                [105.85443227815665, 20.709350165412573],
                [105.85443227815665, 20.882848913115083],
                [105.6018867927948, 20.882848913115083],
              ],
            ],
          },
        },
      ],
    },
  );
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}
function createDrawListDataset() {
  const color = getChartRandomColor();
  const dataset = createRootDataset('Draw');
  const dataManagement = createDatasetPartDataManagementGeojsonLocalComponent(
    'data management',
    {
      key: 'geojson-draw',
      hooks: [
        {
          async beforeCreate(ctx) {
            const item = ctx.payload!;
            const { geometry, properties, ...result } =
              await popupRef.value!.open(item.properties!);
            item.properties = { ...item?.properties, ...result };
            return item;
          },
          async beforeUpdate(ctx) {
            const item = ctx.payload!;
            const { geometry, properties, ...result } =
              await popupRef.value!.open(item.properties!);
            item.properties = { ...item?.properties, ...result };
            return item;
          },
          beforeDelete(ctx) {
            console.info('beforeDelete', ctx);
          },
          afterCreate(ctx) {
            console.info('afterCreate', ctx);
          },
          afterUpdate(ctx) {
            console.info('afterUpdate', ctx);
          },
          afterDelete(ctx) {
            console.info('afterDelete', ctx);
          },
        },
      ],
    },
  );
  const source = createDatasetPartGeojsonSourceComponent('Draw source', {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent('Draw layer', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setFilter(['==', '$type', 'Point'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('line')
      .setFilter(['==', '$type', 'LineString'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setFilter(['==', '$type', 'Polygon'])
      .setOpacity(0.5)
      .setColor(color)
      .build(),
  ]);
  const list = createDatasetPartListViewUiComponentBuilder('Draw list')
    .addMenus([
      createMenuDownload(),
      createMenuDrawLayer({
        cleanAfterDone: true,
        drawSupports: [
          DrawingType.POINT,
          DrawingType.POLYGON,
          DrawingType.LINE_STRING,
        ],
        selectFeature: async ({ point }, { mapId }) => {
          let feature: Feature | undefined = undefined;
          getMap(mapId, (map) => {
            if (feature) {
              return;
            }
            feature = getFirstFeatureByMap(map, point, layer.getAllLayerIds());
          });
          if (!feature) {
            return;
          }
          return dataManagement.getDetail(feature);
        },
        addFeature: dataManagement.create.bind(dataManagement),
        updateFeature: dataManagement.update.bind(dataManagement),
        deleteFeature: dataManagement.delete.bind(dataManagement),
        redraw: dataManagement.redraw.bind(dataManagement),
      }),
    ])
    .setColor(color)
    .build();
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(dataManagement);
  return dataset;
}
function createDrawDraftListDataset(map: MapSimple) {
  const color = getChartRandomColor();
  const source = createDatasetPartGeojsonSourceComponent('Draw draft source', {
    type: 'FeatureCollection',
    features: [],
  });
  const layer = createMultiMapboxLayerComponent('Draw draft layer', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setFilter(['==', '$type', 'Point'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('line')
      .setFilter(['==', '$type', 'LineString'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setFilter(['==', '$type', 'Polygon'])
      .setOpacity(0.5)
      .setColor(color)
      .build(),
  ]);
  const groupDraft = createGroupDataset('Draft group');
  const sourceDraft = createDatasetPartGeojsonSourceComponent('Draw source', {
    type: 'FeatureCollection',
    features: [],
  });
  const layerDraft = createMultiMapboxLayerComponent('Draw layer', [
    new LayerSimpleMapboxBuild()
      .setStyleType('point')
      .setFilter(['==', '$type', 'Point'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('line')
      .setFilter(['==', '$type', 'LineString'])
      .setColor(color)
      .build(),
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setFilter(['==', '$type', 'Polygon'])
      .setOpacity(0.5)
      .setColor(color)
      .build(),
  ]);
  const mapDraftSyncHook = createMapDraftSyncHook({
    map,
    originSource: source,
    draftSource: sourceDraft,
    layers: [layer],
    layerDrafts: [layerDraft],
  });
  const dataManagement =
    createDatasetParDraftDataManagementGeojsonLocalComponent(
      'data management',
      {
        initData: [],
        key: 'geojson-draw-2',
        originSource: source,
        hooks: [
          {
            beforeGetDetail(ctx) {
              console.info('beforeGetDetail', ctx);
            },
            afterGetDetail(ctx) {
              console.info('afterGetDetail', ctx);
            },
            beforeCreate(ctx) {
              console.info('beforeCreate', ctx);
            },
            afterCreate(ctx) {
              console.info('afterCreate', ctx);
            },
            beforeUpdate(ctx) {
              console.info('beforeUpdate', ctx);
            },
            afterUpdate(ctx) {
              console.info('afterUpdate', ctx);
            },
            beforeDelete(ctx) {
              console.info('beforeDelete', ctx);
            },
            afterDelete(ctx) {
              console.info('afterDelete', ctx);
            },
            beforeDraftCreate(ctx) {
              console.info('beforeDraftCreate', ctx);
            },
            afterDraftCreate(ctx) {
              console.info('afterDraftCreate', ctx);
            },
            beforeDraftUpdate(ctx) {
              console.info('beforeDraftUpdate', ctx);
            },
            afterDraftUpdate(ctx) {
              console.info('afterDraftUpdate', ctx);
            },
            beforeDraftDelete(ctx) {
              console.info('beforeDraftDelete', ctx);
            },
            afterDraftDelete(ctx) {
              console.info('afterDraftDelete', ctx);
            },
            beforeDraftCommit(ctx) {
              console.info('beforeDraftCommit', ctx);
            },
            afterDraftCommit(ctx) {
              console.info('afterDraftCommit', ctx);
            },
            beforeDraftDiscard(ctx) {
              console.info('beforeDraftDiscard', ctx);
            },
            afterDraftDiscard(ctx) {
              console.info('afterDraftDiscard', ctx);
            },
            beforeCancel(ctx) {
              console.info('beforeCancel', ctx);
            },
            afterCancel(ctx) {
              console.info('afterCancel', ctx);
            },
          },
          mapDraftSyncHook,
        ],
      },
    );
  const dataset = createRootDataset('Draw draft');
  const list = createDatasetPartListViewUiComponentBuilder('Draw draft list')
    .addMenus([
      createMenuDownload(),
      createMenuDrawLayer({
        draft: { show: true },
        cleanAfterDone: true,
        drawSupports: [
          DrawingType.POINT,
          DrawingType.POLYGON,
          DrawingType.LINE_STRING,
        ],
        getDraftItems: dataManagement.getDraftItems,
        selectFeature: async ({ point }, { mapId }) => {
          let feature: Feature | undefined = undefined;
          getMap(mapId, (map) => {
            if (feature) {
              return;
            }
            feature = getFirstFeatureByMap(
              map,
              point,
              layer.getAllLayerIds().concat(layerDraft.getAllLayerIds()),
            );
          });
          if (!feature) {
            return;
          }
          return dataManagement.getDetail(feature);
        },
        addFeature: dataManagement.create.bind(dataManagement),
        updateFeature: dataManagement.update.bind(dataManagement),
        deleteFeature: dataManagement.delete.bind(dataManagement),
        commit: dataManagement.commit.bind(dataManagement),
        discard: dataManagement.discard.bind(dataManagement),
        redraw: dataManagement.redraw.bind(dataManagement),
        cancel: dataManagement.cancel.bind(dataManagement),
      }),
    ])
    .setColor(color)
    .build();
  groupDraft.add(sourceDraft);
  groupDraft.add(layerDraft);
  const identify = createDatasetPartIdentifyComponentBuilder(list.getName())
    .setConfigFields([
      { text: 'Id', value: 'id' },
      { text: 'Name', value: 'name' },
    ])
    .configFieldName('id')
    .build();
  dataset.add(identify);
  dataset.add(list);
  dataset.add(source);
  dataset.add(layer);
  dataset.add(groupDraft);
  dataset.add(dataManagement);
  return dataset;
}
function createMenuDownload() {
  return createMenuBuilder()
    .item()
    .setName('Download')
    .setIcon(mdiDownload)
    .setClick(async ({ layer }) => {
      const maybeDataManagement = findSiblingOrNearestLeaf<IDataManagementView>(
        layer,
        isDataManagementView,
      );
      if (!maybeDataManagement) {
        return;
      }
      const data = await convert(
        convertList((await maybeDataManagement.list()) || []),
        {
          filename: 'download.geojson',
        },
      );
      if (data) downloadFile(data, 'download.geojson');
    })
    .build();
}
function createMenuDrawLayer(config: MapDrawOption) {
  return createMenuBuilder()
    .item()
    .setName('Edit feature')
    .setIcon(mdiPencil)
    .setClick(async ({ mapId }) => {
      const { start } = useMapDraw(mapId);
      start(config);
    })
    .build();
}
</script>
<template>
  <Map @map-loaded="onMapLoaded" :mapId="mapId">
    <AsideControl position="top-left" />
    <BaseMapControl
      position="bottom-left"
      default-base-map="Google Satellite"
    />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <ComponentManagementControl />
    <EventManagementControl position="top-left" />
    <DrawControl position="top-right" />
    <IdentifyControl position="top-right" />
    <FormEdit ref="popupRef" />
  </Map>
</template>

<style></style>

<style>
* {
  padding: 0;
  margin: 0;
}

body,
html,
#root {
  height: 100%;
}
</style>
