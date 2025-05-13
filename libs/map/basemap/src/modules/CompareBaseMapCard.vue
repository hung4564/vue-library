<template lang="">
  <div class="base-map-card">
    <div class="base-map-card__image">
      <map-image v-if="current_baseMaps">
        <div
          class="base-map-item-image-container"
          :class="{ _vertical: setting.vertical }"
        >
          <map-image
            v-for="(current_baseMap, i) in current_baseMaps"
            :src="current_baseMap.value?.thumbnail"
            :key="i"
            class="base-map-item-image"
          ></map-image>
        </div>
      </map-image>
    </div>
    <div class="base-map-card__content">
      <div
        v-for="(baseMaps, i) in c_items_baseMaps"
        :key="i"
        class="base-map-card__item"
      >
        <div>#{{ i + 1 }}</div>
        <div>
          <InputSelect
            :modelValue="current_baseMaps[i].value"
            :items="baseMaps.value"
            returnObject
            itemText="title"
            itemValue="id"
            @update:modelValue="onChangeBaseMap(i, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  getMapCompareSetting,
  InputSelect,
  MapImage,
  store as storeMap,
  useMap,
} from '@hungpvq/vue-map-core';
import { computed, ref, onBeforeUnmount } from 'vue';
import { useBaseMap } from '../hooks';
const props = defineProps({
  mapId: { type: String, required: true },
  title: {
    type: String,
    default: '',
  },
});
const { mapId } = useMap(props);
const setting = getMapCompareSetting(mapId.value);
const mapIds = ref<string[]>(
  storeMap.actions
    .getMapStore(mapId.value)
    ?.maps.map((x: { id: any }) => x.id) || [],
);
const current_baseMaps = computed(() => {
  return mapStoreUseBaseMap.value.map(
    (x: { currentBaseMap: any }) => x.currentBaseMap,
  );
});
const c_items_baseMaps = computed(() => {
  return mapStoreUseBaseMap.value.map((x) => x.baseMaps);
});
const mapStoreUseBaseMap = computed(() => {
  return mapIds.value.map((mapId) => {
    return useBaseMap(mapId);
  });
});
const onChangeBaseMap = (i: number, base_map: any) => {
  mapStoreUseBaseMap.value[i].setCurrent(base_map);
};
onBeforeUnmount(() => {
  return mapStoreUseBaseMap.value.map((x) => x.remove());
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
}
</style>
<style scoped>
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
.base-map-card__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  flex: 1 1 auto;
  div {
    flex: 1 1 auto;
  }
  div:first-child {
    flex: 0 0 auto;
  }
}
.base-map-card__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1 1 auto;
}
</style>
