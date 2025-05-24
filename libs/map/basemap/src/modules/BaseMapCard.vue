<template lang="">
  <div class="base-map-card">
    <div class="base-map-card__image">
      <map-image :src="current_baseMaps.thumbnail" v-if="current_baseMaps">
      </map-image>
    </div>
    <div class="base-map-card__content">
      <div class="base-map-card__title">
        {{ title || trans('map.basemap.title') }}
      </div>
      <div>
        <InputSelect
          :modelValue="current_baseMaps"
          :items="c_baseMaps"
          returnObject
          itemText="title"
          itemValue="id"
          @update:modelValue="onChangeBaseMap"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { useLang, useMap, InputSelect, MapImage } from '@hungpvq/vue-map-core';
import { useBaseMap } from '../hooks';
import { logger } from '../logger';
import { logHelper } from '@hungpvq/shared-map';
const props = defineProps({
  mapId: { type: String, required: true },
  title: {
    type: String,
    default: '',
  },
});
const { mapId } = useMap(props);
const { trans } = useLang(mapId.value);
const {
  baseMaps: c_baseMaps,
  setCurrent,
  currentBaseMap: current_baseMaps,
  remove,
} = useBaseMap(mapId.value);
const onChangeBaseMap = (base_map: any) => {
  logHelper(logger, mapId, 'control', 'BaseMapCard').debug('onClick', base_map);
  setCurrent(base_map);
};
onBeforeUnmount(() => {
  remove();
});
</script>
<style lang="scss" scoped>
.base-map-card {
  display: flex;
  padding: 10px;
  gap: 10px;
  .base-map-card__image {
    width: 70px;
    height: 70px;
    flex-grow: 0;
    flex-shrink: 0;
  }
  .base-map-card__content {
    flex-grow: 1;
    padding: 4px 0px;
    & > *:not(:first-child) {
      padding-top: 4px;
    }
  }
}
</style>
