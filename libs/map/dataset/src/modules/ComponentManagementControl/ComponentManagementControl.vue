<template lang="">
  <component
    v-for="item in components"
    :key="item.id"
    :is="getComponent(item.componentKey)"
    v-bind="item.attr"
    @close="onRemoveComponent(item)"
  ></component>
</template>
<script setup lang="ts">
import {
  defaultMapProps,
  useMap,
  type WithMapPropType,
} from '@hungpvq/vue-map-core';
import { computed, getCurrentInstance, ref, watch } from 'vue';
import { useUniversalRegistry } from '../../registry';
import {
  type ComponentItem,
  useMapDatasetComponent,
} from '../../store/component';
const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { mapId } = useMap(props);
const { getComponent } = useUniversalRegistry(mapId.value);

const instance = getCurrentInstance();
const { getAllComponentIds, getStore, removeComponent } =
  useMapDatasetComponent(mapId.value);
const store = getStore();

function onRemoveComponent(item: ComponentItem) {
  removeComponent(item.id);
}
const storeComponents = computed(() => {
  return getAllComponentIds()?.value || [];
});
const components = ref<ComponentItem[]>([]);
// Watch for changes in components and update the view
watch(
  storeComponents,
  () => {
    components.value = store?.components || [];
    instance?.proxy?.$forceUpdate();
    // Force update to re-render components
  },
  { deep: true },
);
</script>
