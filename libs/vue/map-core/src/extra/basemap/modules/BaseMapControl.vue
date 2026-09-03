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
                  <map-icon v-if="controlIcon">
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
import type { BaseMapItem } from '@hungpvq/map-core';
import {
  BASEMAP_CONTROL_LOCALE,
  INIT_BASEMAPS,
  logHelper,
  type WithMapPropType,
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
import { useLang } from '../../../extra/lang';
import { useRegisterMapControl } from '../../../extra/registry';
import { useToolbarControl } from '../../../extra/toolbar';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules';
import { useBaseMap } from '../hooks';
import { logger } from '../logger';
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
    baseMaps: () => INIT_BASEMAPS,
    title: '',
    defaultBaseMap: 'Open Street Map',
    controlIcon: '',
  },
);
const { mapId, moduleContainerProps, order } = useMap(props);
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
setLocaleDefault(BASEMAP_CONTROL_LOCALE);
const sizeBaseMap = computed(() => {
  return 70;
});
const path = {
  layer: mdiLayersOutline,
};
const show = ref(false);
function setShow(value: boolean) {
  show.value = value;
}
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
const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapBaseMapControl',
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
      type: 'mapBaseMapControl',
      run: () => onToggleList(),
    },
  ],
});
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
      order: order.value,
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
