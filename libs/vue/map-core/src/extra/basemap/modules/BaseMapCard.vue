<template>
  <div
    class="base-map-card"
    :class="{
      'base-map-card--with-opacity': showOpacity && !showAddForm,
      'base-map-card--adding': showAddForm,
      'base-map-card--with-add': allowAddBasemap && !showAddForm,
    }"
  >
    <template v-if="!showAddForm">
      <div
        class="base-map-card__image"
        :class="{
          'base-map-card__image--placeholder':
            current_baseMaps && isCustomPlaceholder(current_baseMaps),
        }"
      >
        <map-image
          v-if="
            current_baseMaps && !isCustomPlaceholder(current_baseMaps)
          "
          :src="current_baseMaps.thumbnail"
        />
        <button
          v-if="
            allowAddBasemap &&
            current_baseMaps &&
            isCustomBasemapItem(current_baseMaps)
          "
          type="button"
          class="base-map-card__remove"
          :title="trans('map.basemap.remove')"
          :aria-label="trans('map.basemap.remove')"
          @click.stop="onRemoveCurrent"
        >
          <SvgIcon type="mdi" :path="path.remove" size="18" />
        </button>
      </div>
      <div class="base-map-card__select">
        <div class="base-map-card__title">
          {{ title || trans('map.basemap.title') }}
        </div>
        <InputSelect
          :modelValue="current_baseMaps"
          :items="c_baseMaps"
          returnObject
          itemText="title"
          itemValue="id"
          @update:modelValue="onChangeBaseMap"
        />
      </div>
      <div v-if="showOpacity" class="base-map-card__opacity">
        <div class="base-map-card__opacity-label">
          {{ trans('map.basemap.opacity') }}
        </div>
        <MapRangeSlider
          v-model="opacityModel"
          :aria-label="trans('map.basemap.opacity')"
        />
      </div>
      <div v-if="allowAddBasemap" class="base-map-card__add" @click.stop>
        <MapControlButton
          variant="text"
          size="small"
          :title="trans('map.basemap.add')"
          :aria-label="trans('map.basemap.add')"
          @click="showAddForm = true"
        >
          <SvgIcon type="mdi" :path="path.add" size="16" />
          {{ trans('map.basemap.add') }}
        </MapControlButton>
      </div>
    </template>
    <BaseMapAddForm
      v-else
      :map-id="mapId"
      @added="onBasemapAdded"
      @cancel="showAddForm = false"
    />
  </div>
</template>
<script setup lang="ts">
import type { BaseMapItem } from '@hungpvq/map-core/basemap';
import { logHelper } from '@hungpvq/map-core';
import { INIT_BASEMAPS, isCustomBasemapItem, logger } from '@hungpvq/map-core/basemap';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDelete, mdiPlus } from '@mdi/js';
import { computed, onBeforeUnmount, ref } from 'vue';
import MapControlButton from '../../../components/MapControlButton.vue';
import MapImage from '../../../components/MapImage.vue';
import { useLang } from '../../../extra/lang/hook';
import { InputSelect, MapRangeSlider } from '../../../field';
import { useMap } from '../../../hooks/useMap';
import { useBaseMap } from '../hooks/useBaseMap';
import BaseMapAddForm from './BaseMapAddForm.vue';

const props = withDefaults(
  defineProps<{
    mapId: string;
    title?: string;
    /** Show basemap opacity slider. */
    showOpacity?: boolean;
    /** Allow adding a custom basemap via inline form. */
    allowAddBasemap?: boolean;
  }>(),
  {
    title: '',
    showOpacity: false,
    allowAddBasemap: false,
  },
);
const { mapId } = useMap(props);
const { trans } = useLang(mapId.value);
const {
  baseMaps: c_baseMaps,
  setCurrent,
  currentBaseMap: current_baseMaps,
  opacity,
  setOpacity,
  addBaseMap,
  removeBaseMap,
  remove,
} = useBaseMap(mapId.value);
const opacityModel = computed({
  get: () => opacity.value ?? 1,
  set: (value: number) => setOpacity(value),
});
const showAddForm = ref(false);
const path = { add: mdiPlus, remove: mdiDelete };
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
const onChangeBaseMap = (base_map: BaseMapItem | undefined) => {
  if (!base_map) return;
  logHelper(logger, mapId.value, 'control', 'BaseMapCard')
    .with({ fn: 'onChangeBaseMap', span: 'control.event' })
    .debug('onClick', base_map);
  setCurrent(base_map);
};
function onBasemapAdded(item: BaseMapItem) {
  addBaseMap(item);
  setCurrent(item);
  showAddForm.value = false;
  logHelper(logger, mapId.value, 'control', 'BaseMapCard')
    .with({ fn: 'onBasemapAdded', span: 'control.event' })
    .info('Custom basemap added', { id: item.id, type: item.type });
}
function onRemoveCurrent() {
  const current = current_baseMaps.value;
  if (!current || !isCustomBasemapItem(current)) return;
  removeBaseMap(current.id);
  logHelper(logger, mapId.value, 'control', 'BaseMapCard')
    .with({ fn: 'onRemoveCurrent', span: 'control.event' })
    .info('Custom basemap removed', { id: current.id });
}
onBeforeUnmount(() => {
  remove();
});
</script>
