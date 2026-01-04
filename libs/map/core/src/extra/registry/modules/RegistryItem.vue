<template lang="">
  <component :is="resolvedComponent" v-bind="$attrs" :mapId="mapId"></component>
</template>
<script lang="ts" setup>
import { computed, type Component } from 'vue';
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
const resolvedComponent = computed(() => {
  if (!props.componentKey) {
    return props.defaultComponent;
  }
  return getComponent(props.componentKey) ?? props.defaultComponent;
});
</script>
<style lang=""></style>
