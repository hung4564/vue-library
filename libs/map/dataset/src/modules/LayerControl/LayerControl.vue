<script lang="ts">
export default {
  name: 'layer-control',
};
</script>

<script setup lang="ts">
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  defaultMapProps,
  MapControlButton,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
  WithMapPropType,
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
import CreateControl from '../CreateControl/CreateControl.vue';
import LayerMenuDefaultHandle from '../LayerMenuDefaultHandle.vue';
import LayerList from './part/LayerList.vue';

const props = withDefaults(
  defineProps<
    WithMapPropType &
      WithShowProps & {
        disabledCreate?: boolean;
        disabledCreateGroup?: boolean;
      }
  >(),
  {
    ...defaultMapProps,
    disabledCreate: false,
    disabledCreateGroup: false,
  },
);
defineSlots<{
  titleList: (props: { mapId: string }) => any;
  endList: (props: { mapId: string }) => any;
  default(): any;
}>();
const { mapId, moduleContainerProps } = useMap(props);
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
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        v-if="!show"
        :tooltip="trans('map.layer-control.title')"
        @click.stop="toggleShow()"
        :active="show"
      >
        <SvgIcon size="14" type="mdi" :path="path.icon" />
      </MapControlButton>
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
          <LayerList :mapId="mapId" :disabledCreateGroup="disabledCreateGroup">
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

<style lang="scss">
.fill-height {
  height: 100%;
}
.layer-control {
  .map-row {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .map-co,
  .map-col-6,
  .map-col-12 {
    box-sizing: border-box;
    width: 100%;
  }
  .map-col {
    flex-basis: 0;
    flex-grow: 1;
    max-width: 100%;
  }
  .map-col-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .map-col-6 {
    flex: 0 0 calc(50% - 6px);
    max-width: 50%;
  }
}
</style>
<style scoped>
.layer-control {
  display: flex;
  flex-direction: column;
}
.layer-control-container {
  display: flex;
  flex-direction: column;
  overflow: auto;
  flex-grow: 1;
}
.base-map-card-container {
  flex-grow: 0;
}
.layer-control__list {
  flex-grow: 1;
  overflow: auto;
  padding: 4px 12px 8px;
}
.layer-control {
  height: 100%;
  overflow: hidden;
}
.layer-control__title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.draggable-group__divider {
  padding: 4px 0;
  display: block;
  flex: 1 1 100%;
  height: 0px;
  max-height: 0px;
  opacity: 0.12;
  transition: inherit;
  border-style: solid;
  border-width: thin 0 0 0;
}
.layer-control__header {
  display: flex;
  align-items: center;
  padding: 8px;
}
.v-spacer {
  flex: 1 1 auto;
}
</style>
