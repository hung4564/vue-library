<template>
  <ModuleContainer v-bind="moduleContainerProps" :btnWidth="70">
    <template #btn>
      <MapControlButton v-if="current_baseMaps" :tooltip="title">
        <template #content>
          <map-card
            class="clickable base-map-button__container"
            height="70px"
            width="70px"
            @click="onToggleList"
          >
            <div class="base-map-button__content">
              <map-image :src="current_baseMaps.thumbnail">
                <div class="base-map-button__title">
                  <map-icon dark small v-if="controlIcon">
                    {{ controlIcon }}
                  </map-icon>
                  <SvgIcon type="mdi" :path="path.layer" v-else />
                  <div class="">
                    {{ title || trans('map.basemap.title') }}
                  </div>
                </div>
              </map-image>
            </div>
          </map-card>
        </template>
      </MapControlButton>

      <div v-else></div>
    </template>
    <template #draggable="props">
      <DraggableItemPopup
        v-if="show"
        v-bind="props"
        :height="
          sizeBaseMap * (Math.floor(c_baseMaps.length / 3) + 1) + 48 + 10
        "
        v-model:show="show"
        :is-resizable="false"
        :title="trans('map.basemap.setting')"
        :width="sizeBaseMap * 3 + 24"
      >
        <div class="base-map-control-setting">
          <div
            v-for="baseMap in c_baseMaps"
            :key="baseMap.id"
            class="clickable base-map-control-setting-item"
            :style="{ width: sizeBaseMap + 'px' }"
            :title="baseMap.title"
            @click="onClick(baseMap)"
          >
            <div
              :style="{
                width: sizeBaseMap - 34 + 'px',
                height: sizeBaseMap - 34 + 'px',
              }"
            >
              <map-image :src="baseMap.thumbnail"> </map-image>
            </div>
            <div
              class="base-map-control-setting-item__title"
              :class="{
                'base-map-control-setting-item__active':
                  current_baseMaps && baseMap.id == current_baseMaps.id,
              }"
              style="font-size: 14px"
            >
              {{ baseMap.title }}
            </div>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
<script lang="ts" setup>
import { logHelper } from '@hungpvq/shared-map';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  defaultMapProps,
  MapCard,
  MapControlButton,
  MapIcon,
  MapImage,
  ModuleContainer,
  useLang,
  useMap,
  useToolbarControl,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiLayersOutline } from '@mdi/js';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useBaseMap } from '../hooks';
import { logger } from '../logger';
import type { BaseMapItem } from '../types';
import defaultbasemap from './basemap';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      baseMaps?: BaseMapItem[]; // hoặc cụ thể hơn nếu có kiểu
      title?: string;
      defaultBaseMap?: string;
      controlIcon?: string;
    }
  >(),
  {
    ...defaultMapProps,
    baseMaps: () => defaultbasemap,
    title: '',
    defaultBaseMap: 'Open Street Map',
    controlIcon: '',
  },
);
const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
const {
  setBaseMaps,
  baseMaps: c_baseMaps,
  setDefaultBaseMap,
  setCurrent,
  currentBaseMap: current_baseMaps,
  remove,
  init,
} = useBaseMap(mapId.value);
watch(
  () => props.baseMaps as BaseMapItem[],
  (value: BaseMapItem[]) => {
    setBaseMaps(value);
  },
);
watch(
  () => props.defaultBaseMap,
  (value) => {
    setDefaultBaseMap(value);
  },
);
setLocaleDefault({
  map: {
    basemap: {
      title: 'Map basemap',
      setting: 'Setting',
    },
  },
});
const sizeBaseMap = computed(() => {
  return 70;
});
const path = {
  layer: mdiLayersOutline,
};
const show = ref(false);
function onClick(baseMap: BaseMapItem) {
  logHelper(logger, mapId.value, 'control', 'BaseMapControl').debug(
    'onClick',
    baseMap,
  );
  setCurrent(baseMap);
}
function onToggleList() {
  show.value = !show.value;
}
onMounted(() => {
  init(props.baseMaps as BaseMapItem[], props.defaultBaseMap);
});
onBeforeUnmount(() => {
  remove();
});
useToolbarControl(mapId.value, props, {
  id: 'mapBaseMapControl',
  getState() {
    return {
      visible: true,
      title: props.title || trans.value('map.basemap.title'),
      icon: {
        type: 'mdi',
        path: path.layer,
      },
    };
  },
  onClick() {
    onToggleList();
  },
});
</script>
<style scoped>
.base-map-button__title {
  position: absolute;
  padding: 4px;
  bottom: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  overflow: hidden;
  color: var(--map-text-inverse, #fff);
  background-image: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  flex-direction: column;
  align-items: center;
  display: flex;
}

.base-map-button__title > div {
  font-size: 0.6rem;
  line-height: 0.75rem;
}

.base-map-button__content {
  padding: 2px;
}

.base-map-control-setting {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

.base-map-control-setting-item {
  padding: 8px 4px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: unset;
}

.base-map-control-setting-item .map-card {
  box-shadow: unset;
}

.base-map-control-setting-item__title {
  font-size: 0.75rem !important;
  font-weight: 400;
  line-height: 1.25rem;
  letter-spacing: 0.0333333333em !important;
  font-family: 'Roboto', sans-serif !important;

  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;

  width: 100%;
}

.base-map-control-setting-item__active {
  color: var(
    --map-basemap-active-color,
    var(--map-primary-color, #1a73e8)
  ) !important;
  caret-color: var(
    --map-basemap-active-color,
    var(--map-primary-color, #1a73e8)
  ) !important;
}
.clickable {
  cursor: pointer;
}

.clickable {
  position: relative;
}

.clickable:hover::before {
  opacity: 0.04;
}

.clickable:before {
  background-color: currentColor;
  bottom: 0;
  content: '';
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.clickable[disabled='disabled'] {
  cursor: default;
  pointer-events: none;
  opacity: 0.25;
}
</style>
