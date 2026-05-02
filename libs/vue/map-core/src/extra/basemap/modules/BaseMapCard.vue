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
import type { BaseMapItem } from '@hungpvq/map-core';
import { logHelper } from '@hungpvq/map-core';
import { onBeforeUnmount } from 'vue';
import { MapImage } from '../../../components';
import { useLang } from '../../../extra/lang';
import { InputSelect } from '../../../field';
import { useMap } from '../../../hooks';
import { useBaseMap } from '../hooks';
import { logger } from '../logger';
const props = defineProps<{
  mapId: string;
  title?: string;
}>();
const { mapId } = useMap(props);
const { trans } = useLang(mapId.value);
const {
  baseMaps: c_baseMaps,
  setCurrent,
  currentBaseMap: current_baseMaps,
  remove,
} = useBaseMap(mapId.value);
const onChangeBaseMap = (base_map: BaseMapItem) => {
  logHelper(logger, mapId.value, 'control', 'BaseMapCard').debug(
    'onClick',
    base_map,
  );
  setCurrent(base_map);
};
onBeforeUnmount(() => {
  remove();
});
</script>
