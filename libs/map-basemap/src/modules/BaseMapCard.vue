<template lang="">
  <div class="base-map-card">
    <div class="base-map-card__image">
      <map-image :src="current_baseMaps.thumbnail" v-if="current_baseMaps">
      </map-image>
    </div>
    <div class="base-map-card__content">
      <div>
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
import { useLang, useMap, InputSelect, MapImage } from '@hungpvq/vue-map-core';
import { useBaseMap } from '../hooks';
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
} = useBaseMap(mapId.value);
const onChangeBaseMap = (base_map: any) => {
  setCurrent(base_map);
};
</script>
<style lang="scss" scoped>
.base-map-card {
  display: flex;
  padding: 10px;
  .base-map-card__image {
    width: 70px;
    height: 70px;
    flex-grow: 0;
    flex-shrink: 0;
  }
  .base-map-card__content {
    flex-grow: 1;
    padding: 4px 10px;
    & > *:not(:first-child) {
      padding-top: 4px;
    }
  }
}
</style>
