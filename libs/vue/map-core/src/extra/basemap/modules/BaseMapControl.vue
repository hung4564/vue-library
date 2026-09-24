<template>
  <ModuleContainer v-bind="moduleContainerProps" :btnWidth="70">
    <template #btn>
      <MapControlButton v-if="current_baseMaps" :tooltip="title" :active="show">
        <template #content>
          <map-card
            class="clickable base-map-button__container"
            :class="{ 'base-map-button__container--active': show }"
            height="70px"
            width="70px"
            @click.stop="onToggleList"
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
        :height="popupHeight"
        v-model:show="show"
        :is-resizable="false"
        :title="
          showAddForm ? trans('map.basemap.add') : trans('map.basemap.setting')
        "
        :width="showAddForm ? 280 : sizeBaseMap * 3 + 24"
      >
        <div class="base-map-control-setting">
          <template v-if="!showAddForm">
            <div
              v-for="baseMap in c_baseMaps"
              :key="baseMap.id"
              class="clickable base-map-control-setting-item"
              :class="{
                'base-map-control-setting-item--active':
                  current_baseMaps && baseMap.id == current_baseMaps.id,
              }"
              :style="{ width: sizeBaseMap + 'px' }"
              :title="baseMap.title"
              @click="onClick(baseMap)"
            >
              <div
                class="base-map-control-setting-item__thumb"
                :class="{
                  'base-map-control-setting-item__thumb--placeholder':
                    isCustomPlaceholder(baseMap),
                }"
                :style="{
                  width: sizeBaseMap - 34 + 'px',
                  height: sizeBaseMap - 34 + 'px',
                }"
              >
                <map-image
                  v-if="!isCustomPlaceholder(baseMap)"
                  :src="baseMap.thumbnail"
                />
                <button
                  v-if="allowAddBasemap && isCustomBasemapItem(baseMap)"
                  type="button"
                  class="base-map-control-setting-item__remove"
                  :title="trans('map.basemap.remove')"
                  :aria-label="trans('map.basemap.remove')"
                  @click.stop="onRemoveBasemap(baseMap)"
                >
                  <SvgIcon type="mdi" :path="path.remove" size="18" />
                </button>
              </div>
              <div class="base-map-control-setting-item__title">
                {{ baseMap.title }}
              </div>
            </div>
            <button
              v-if="allowAddBasemap"
              type="button"
              class="clickable base-map-control-setting-item base-map-control-setting-item--add"
              :style="{ width: sizeBaseMap + 'px' }"
              :title="trans('map.basemap.add')"
              :aria-label="trans('map.basemap.add')"
              @click.stop="showAddForm = true"
            >
              <div
                class="base-map-control-setting-item__thumb base-map-control-setting-item__thumb--add"
                :style="{
                  width: sizeBaseMap - 34 + 'px',
                  height: sizeBaseMap - 34 + 'px',
                }"
              >
                <SvgIcon type="mdi" :path="path.add" size="22" />
              </div>
              <div class="base-map-control-setting-item__title">
                {{ trans('map.basemap.add') }}
              </div>
            </button>
            <div
              v-if="showOpacity"
              class="base-map-control-setting__opacity"
              @click.stop
            >
              <MapRangeSlider
                v-model="opacityModel"
                :aria-label="trans('map.basemap.opacity')"
              />
            </div>
          </template>
          <BaseMapAddForm
            v-else
            :map-id="mapId"
            :show-heading="false"
            @added="onBasemapAdded"
            @cancel="showAddForm = false"
          />
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>
<script lang="ts" setup>
import { logHelper, type WithMapPropType } from '@hungpvq/map-core';
import type { BaseMapItem } from '@hungpvq/map-core/basemap';
import {
  INIT_BASEMAPS,
  isCustomBasemapItem,
  logger,
} from '@hungpvq/map-core/basemap';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDelete, mdiLayersOutline, mdiPlus } from '@mdi/js';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import MapCard from '../../../components/MapCard.vue';
import MapControlButton from '../../../components/MapControlButton.vue';
import MapIcon from '../../../components/MapIcon.vue';
import MapImage from '../../../components/MapImage.vue';
import { useLang } from '../../../extra/lang/hook';
import { useRegisterMapControl } from '../../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../../extra/toolbar/helper';
import { MapRangeSlider } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useBaseMap } from '../hooks/useBaseMap';
import BaseMapAddForm from './BaseMapAddForm.vue';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      baseMaps?: BaseMapItem[]; // hoặc cụ thể hơn nếu có kiểu
      title?: string;
      defaultBaseMap?: string;
      controlIcon?: string;
      /** Show basemap opacity slider in the settings popup. */
      showOpacity?: boolean;
      /** Allow adding a custom basemap via popup form. */
      allowAddBasemap?: boolean;
    }
  >(),
  {
    ...defaultMapProps,
    baseMaps: () => INIT_BASEMAPS,
    title: '',
    defaultBaseMap: 'Open Street Map',
    controlIcon: '',
    showOpacity: false,
    allowAddBasemap: false,
  },
);
const { mapId, moduleContainerProps, order } = useMap(props);
const { trans } = useLang(mapId.value);
const {
  setBaseMaps,
  baseMaps: c_baseMaps,
  setDefaultBaseMap,
  setCurrent,
  currentBaseMap: current_baseMaps,
  opacity,
  setOpacity,
  addBaseMap,
  removeBaseMap,
  remove,
  init,
} = useBaseMap(mapId.value);
const opacityModel = computed({
  get: () => opacity.value ?? 1,
  set: (value: number) => setOpacity(value),
});
const noneThumb = computed(
  () =>
    c_baseMaps.value.find((b) => b.type === 'no-basemap')?.thumbnail ||
    INIT_BASEMAPS.find((b) => b.type === 'no-basemap')?.thumbnail ||
    '',
);
function isCustomPlaceholder(baseMap: BaseMapItem): boolean {
  if (!isCustomBasemapItem(baseMap)) return false;
  const thumb = (baseMap.thumbnail || '').trim();
  if (!thumb) return true;
  return thumb === noneThumb.value;
}
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
const sizeBaseMap = computed(() => {
  return 70;
});
const path = {
  layer: mdiLayersOutline,
  add: mdiPlus,
  remove: mdiDelete,
};
const show = ref(false);
const showAddForm = ref(false);
const popupHeight = computed(() => {
  // Header (~48) + fields + sticky actions; tall enough to avoid outer scroll.
  if (showAddForm.value) return 420;
  const tileCount = c_baseMaps.value.length + (props.allowAddBasemap ? 1 : 0);
  return (
    sizeBaseMap.value * (Math.floor(tileCount / 3) + 1) +
    48 +
    10 +
    (props.showOpacity ? 40 : 0)
  );
});
function setShow(value: boolean) {
  show.value = value;
  if (!value) showAddForm.value = false;
}
function onClick(baseMap: BaseMapItem) {
  logHelper(logger, mapId.value, 'control', 'BaseMapControl')
    .with({ fn: 'onClick', span: 'control.event' })
    .debug('onClick', baseMap);
  setCurrent(baseMap);
}
function onBasemapAdded(item: BaseMapItem) {
  addBaseMap(item);
  setCurrent(item);
  showAddForm.value = false;
  logHelper(logger, mapId.value, 'control', 'BaseMapControl')
    .with({ fn: 'onBasemapAdded', span: 'control.event' })
    .info('Custom basemap added', { id: item.id, type: item.type });
}
function onRemoveBasemap(baseMap: BaseMapItem) {
  if (!isCustomBasemapItem(baseMap)) return;
  removeBaseMap(baseMap.id);
  logHelper(logger, mapId.value, 'control', 'BaseMapControl')
    .with({ fn: 'onRemoveBasemap', span: 'control.event' })
    .info('Custom basemap removed', { id: baseMap.id });
}
function onToggleList() {
  show.value = !show.value;
  if (!show.value) showAddForm.value = false;
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
    showOpacity: props.showOpacity,
    allowAddBasemap: props.allowAddBasemap,
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
const { control } = useToolbarControl(mapId.value, props, {
  id: 'mapBaseMapControl',
  getState() {
    return mdiButtonState(path.layer, {
      visible: true,
      active: show.value,
      order: order.value,
      title: props.title || trans.value('map.basemap.title'),
    });
  },
  onClick() {
    onToggleList();
  },
});
watch(show, () => control.sync());
</script>
