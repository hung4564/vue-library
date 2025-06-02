<template lang="">
  <component
    v-for="item in components"
    :key="item.id"
    :is="item.component()"
    v-bind="item.attr"
    @close="onRemoveComponent(item)"
  ></component>
</template>
<script setup lang="ts">
import { useMap, withMapProps } from '@hungpvq/vue-map-core';
import { computed, getCurrentInstance, ref, watch } from 'vue';
import {
  type ComponentItem,
  useMapDatasetComponent,
} from '../../store/component';

const instance = getCurrentInstance();
const props = defineProps({
  ...withMapProps,
});
const { mapId } = useMap(props);
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
