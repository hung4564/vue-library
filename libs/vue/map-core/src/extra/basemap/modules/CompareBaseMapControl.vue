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
    <template #draggable="slotProps">
      <DraggableItemPopup
        v-if="show"
        v-bind="{ ...slotProps, ...panelBind }"
        :height="sizeBaseMap * 2 + 48 + 10 + 40"
        v-model:show="show"
        :is-resizable="false"
        :title="trans('map.basemap.setting')"
        :width="sizeBaseMap * 3 + 24"
      >
        <div class="map-compare-basemap-panel">
          <div class="map-compare-basemap-tabs">
            <div
              v-for="(baseMaps, i) in c_items_baseMaps"
              :key="i"
              class="map-compare-basemap-tab"
              :class="{ _active: currentTab == i }"
              @click="currentTab = i"
            >
              #{{ i + 1 }}
            </div>
          </div>
          <div class="map-compare-basemap-list">
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
import {
  type BaseMapItem,
  type WithMapPropType,
  BASEMAP_CONTROL_LOCALE,
  INIT_BASEMAPS,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiLayersOutline } from '@mdi/js';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  MapCard,
  MapControlButton,
  MapIcon,
  MapImage,
} from '../../../components';
import { getMapCompareSetting } from '../../../extra/compare';
import { useLang } from '../../../extra/lang';
import { useRegisterMapControl } from '../../../extra/registry';
import { defaultMapProps, useMap } from '../../../hooks';
import { ModuleContainer } from '../../../modules';
import { getMaps } from '../../../store/store';
import { useBaseMap } from '../hooks';

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
    baseMaps: () => INIT_BASEMAPS,
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

setLocaleDefault(BASEMAP_CONTROL_LOCALE);

const sizeBaseMap = computed(() => 70);

const path = {
  layer: mdiLayersOutline,
};

const show = ref(false);
function setShow(value: boolean) {
  show.value = value;
}

function onClick(i: number, baseMap: BaseMapItem) {
  mapStoreUseBaseMap.value[i].setCurrent(baseMap);
}

function onToggleList() {
  show.value = !show.value;
}

const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapCompareBaseMapControl',
  panelKind: 'popup',
  title: () => props.title || trans.value('map.basemap.title'),
  buttonPosition: () => props.position,
  show,
  setShow,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
    title: props.title,
    defaultBaseMap: props.defaultBaseMap,
    controlIcon: props.controlIcon,
  }),
  actions: [
    {
      type: 'mapCompareBaseMapControl',
      run: () => onToggleList(),
    },
  ],
});

onMounted(() => {
  mapStoreUseBaseMap.value.forEach((c) => {
    c.init(props.baseMaps, props.defaultBaseMap);
  });
});

onBeforeUnmount(() => {
  mapStoreUseBaseMap.value.forEach((x) => x.remove());
});
</script>
