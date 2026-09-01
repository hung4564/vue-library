<script lang="ts">
export default {
  name: 'layer-control',
};
</script>

<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import type { MenuContextSource } from '@hungpvq/map-dataset';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
  useToolbarControl,
  WithShowProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiDelete,
  mdiDotsVertical,
  mdiGroup,
  mdiLayers,
  mdiPlus,
} from '@mdi/js';
import { watch } from 'vue';
import { provideMenuConditionContext } from '../../extra/menu/condition-context';
import CreateControl from '../CreateControl/CreateControl.vue';
import LayerMenuDefaultHandle from '../LayerMenuDefaultHandle.vue';
import LayerList from './part/LayerList.vue';

const props = withDefaults(
  defineProps<
    WithMapPropType &
      WithShowProps & {
        disabledCreate?: boolean;
        disabledCreateGroup?: boolean;
        disabledDeleteAll?: boolean;
        disabledMove?: boolean;
        menuContext?: MenuContextSource;
      }
  >(),
  {
    ...defaultMapProps,
    disabledCreate: false,
    disabledCreateGroup: false,
    disabledDeleteAll: false,
    disabledMove: false,
  },
);
provideMenuConditionContext(() => props.menuContext);
defineSlots<{
  titleList: (props: { mapId: string }) => any;
  endList: (props: { mapId: string }) => any;
  default(): any;
}>();
const { mapId, moduleContainerProps, order } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: {
    'layer-control': {
      title: 'Layer Control',
      'create-btn': 'Create Layer',
      create: {
        title: 'New Layer',
      },
      field: {
        name: 'Name',
        type: 'Type',
        url: 'Url',
        minzoom: 'Min zoom',
        maxzoom: 'Max zoom',
        file: 'File',
        geojson: 'Geojson',
        tiles: 'Tiles',
        bound: {
          title: 'Bound',
          minx: 'Min Longitude',
          miny: 'Min Latitude',
          maxx: 'Max Longitude',
          maxy: 'Max Latitude',
        },
      },
      info: {
        title: 'Info',
      },
    },
  },
});
const path = {
  icon: mdiLayers,
  menu: mdiDotsVertical,
  group: { create: mdiGroup },
  deleteAll: mdiDelete,
  layer: { create: mdiPlus },
};
const [show, toggleShow] = useShow(props.show);
const [showCreate, toggleShowCreate] = useShow();
function openAddLayer() {
  toggleShowCreate();
}
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapLayerControl',
  getState() {
    return {
      visible: !show.value,
      active: show.value,
      title: trans.value('map.layer-control.title'),
      order: order.value,
      icon: {
        type: 'mdi',
        path: path.icon,
      },
    };
  },
  onClick() {
    toggleShow();
  },
});
watch(show, () => control.sync());
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>

    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        v-model:show="show"
        :title="trans('map.layer-control.title')"
      >
        <template #title>
          <span class="layer-control__title">
            {{ trans('map.layer-control.title') }}
          </span>
        </template>
        <div class="layer-control">
          <LayerList
            :mapId="mapId"
            :disabledCreateGroup="disabledCreateGroup"
            :disabledDeleteAll="disabledDeleteAll"
            :disabledMove="disabledMove"
          >
            <template #title>
              <slot name="titleList" :mapId="mapId">
                <BaseButton @click.stop="openAddLayer()" v-if="!disabledCreate">
                  <SvgIcon size="14" type="mdi" :path="path.layer.create" />
                </BaseButton>
              </slot>
            </template>
          </LayerList>
          <div class="base-map-card-container">
            <slot name="endList" :mapId="mapId"> </slot>
          </div>
        </div>
      </DraggableItemSideBar>
    </template>
    <CreateControl v-model:show="showCreate" />
    <slot />
    <LayerMenuDefaultHandle />
  </ModuleContainer>
</template>
