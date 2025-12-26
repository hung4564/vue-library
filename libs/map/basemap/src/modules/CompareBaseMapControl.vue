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
              <map-image>
                <div
                  class="base-map-item-image-container"
                  :class="{ _vertical: setting?.vertical }"
                >
                  <map-image
                    v-for="(current_baseMap, i) in current_baseMaps"
                    :src="current_baseMap.value?.thumbnail"
                    :key="i"
                    class="base-map-item-image"
                  ></map-image>
                </div>
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
        :height="sizeBaseMap * 2 + 48 + 10 + 40"
        v-model:show="show"
        :is-resizable="false"
        :title="trans('map.basemap.setting')"
        :width="sizeBaseMap * 3 + 24"
      >
        <div class="control-container">
          <div class="tabs-container">
            <div
              v-for="(baseMaps, i) in c_items_baseMaps"
              :key="i"
              class="tab-item"
              :class="{ _active: currentTab == i }"
              @click="currentTab = i"
            >
              #{{ i + 1 }}
            </div>
          </div>
          <div class="basemap-container">
            <div class="base-map-control-setting">
              <div
                v-for="baseMap in c_items_baseMaps[currentTab].value"
                :key="baseMap.id"
                class="clickable base-map-control-setting-item"
                :class="{
                  'base-map-control-setting-item__active':
                    current_baseMaps &&
                    current_baseMaps[currentTab] &&
                    current_baseMaps[currentTab].value &&
                    baseMap.id == current_baseMaps[currentTab].value?.id,
                }"
                :style="{ width: sizeBaseMap + 'px' }"
                :title="baseMap.title"
                @click="onClick(currentTab, baseMap)"
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
                  style="font-size: 14px"
                >
                  {{ baseMap.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
<script lang="ts" setup>
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  defaultMapProps,
  getMapCompareSetting,
  getMaps,
  MapCard,
  MapControlButton,
  MapIcon,
  MapImage,
  ModuleContainer,
  useLang,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiLayersOutline } from '@mdi/js';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useBaseMap } from '../hooks';
import type { BaseMapItem } from '../types';
import defaultbasemap from './basemap';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      baseMaps?: BaseMapItem[];
      title?: string;
      defaultBaseMap?: string;
      controlIcon?: string;
    }
  >(),
  {
    ...defaultMapProps,
    baseMaps: () => defaultbasemap as BaseMapItem[],
    title: '',
    defaultBaseMap: 'Open Street Map',
    controlIcon: '',
  },
);

const { mapId, moduleContainerProps } = useMap(props);
const setting = getMapCompareSetting(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
const currentTab = ref(0);
const mapIds = ref<string[]>(getMaps(mapId.value).map((x) => x.id));

const mapStoreUseBaseMap = computed(() => {
  return mapIds.value.map((id) => {
    return useBaseMap(id);
  });
});

const current_baseMaps = computed(() => {
  return mapStoreUseBaseMap.value.map((x) => x.currentBaseMap);
});

const c_items_baseMaps = computed(() => {
  return mapStoreUseBaseMap.value.map((x) => x.baseMaps);
});

watch(
  () => props.baseMaps,
  (value) => {
    if (value) {
      mapStoreUseBaseMap.value.forEach((c) => {
        c.setBaseMaps(value);
      });
    }
  },
);

watch(
  () => props.defaultBaseMap,
  (value) => {
    if (value) {
      mapStoreUseBaseMap.value.forEach((c) => {
        c.setDefaultBaseMap(value);
      });
    }
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

const sizeBaseMap = computed(() => 70);

const path = {
  layer: mdiLayersOutline,
};

const show = ref(false);

function onClick(i: number, baseMap: BaseMapItem) {
  mapStoreUseBaseMap.value[i].setCurrent(baseMap);
}

function onToggleList() {
  show.value = !show.value;
}

onMounted(() => {
  mapStoreUseBaseMap.value.forEach((c) => {
    c.init(props.baseMaps, props.defaultBaseMap);
  });
});

onBeforeUnmount(() => {
  mapStoreUseBaseMap.value.forEach((x) => x.remove());
});
</script>
<style scoped>
.base-map-button__title {
  position: absolute;
  padding-bottom: 4px;
  bottom: 0;
  width: 100%;
  text-align: center;
  overflow: hidden;
  color: var(--map-card-text, var(--map-text-primary, #333));
  background-image: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.base-map-button__title > div {
  font-size: 0.6rem;
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
.base-map-item-image-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
}
.base-map-item-image-container .base-map-item-image {
  flex: 1 1 auto;
}
.base-map-item-image-container._vertical {
  flex-direction: column;
}
</style>
<style scoped>
.tabs-container {
  display: flex;
  border-bottom-width: thin;
  border-bottom-color: var(--map-divider-color, #eeeeee);
  border-bottom-style: solid;
}
.tab-item {
  flex-grow: 1;
  padding: 8px 16px;
  text-align: center;
}
</style>
<style scoped>
.basemap-container {
  overflow: auto;
  flex: 1 1 auto;
}
.control-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}
.tabs-container {
  flex: 0 0 auto;
}
</style>
