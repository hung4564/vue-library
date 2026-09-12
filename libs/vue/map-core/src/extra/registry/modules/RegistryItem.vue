<template lang="">
  <component :is="resolvedComponent" v-bind="$attrs" :mapId="mapId"></component>
</template>
<script lang="ts" setup>
import { computed, markRaw, type Component } from 'vue';
import { useMap } from '../../../hooks';
import { useUniversalRegistry } from '../plugin';

const props = defineProps<{
  componentKey?: string;
  mapId?: string;
  defaultComponent?: Component;
}>();
const { mapId } = useMap(props);
defineOptions({
  name: 'registry-item',
  inheritAttrs: false,
});
const { getComponent } = useUniversalRegistry(mapId.value);

function asRawComponent(comp: Component | undefined) {
  if (!comp || typeof comp !== 'object') return comp;
  return markRaw(comp);
}

const resolvedComponent = computed(() => {
  if (!props.componentKey) {
    return asRawComponent(props.defaultComponent);
  }
  return (
    asRawComponent(getComponent(props.componentKey)) ??
    asRawComponent(props.defaultComponent)
  );
});
</script>
