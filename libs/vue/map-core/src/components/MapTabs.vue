<script lang="ts">
export default {
  name: 'MapTabs',
};
</script>
<script setup lang="ts">
import { computed, useSlots } from 'vue';

import type { MapTabItem } from './map-tabs';
import MapControlButton from './MapControlButton.vue';

export type { MapTabItem } from './map-tabs';

const props = withDefaults(
  defineProps<{
    items: MapTabItem[];
    modelValue: string;
    /** When false, render only the tab bar (no pane host). */
    withPanes?: boolean;
  }>(),
  {
    withPanes: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [id: string];
}>();

const slots = useSlots();

const activeId = computed(() => {
  if (props.items.some((item) => item.id === props.modelValue)) {
    return props.modelValue;
  }
  return props.items[0]?.id ?? '';
});

function select(id: string) {
  if (id !== props.modelValue) emit('update:modelValue', id);
}

const hasPanes = computed(
  () =>
    props.withPanes &&
    props.items.some((item) => typeof slots[item.id] === 'function'),
);
</script>

<template>
  <div
    class="map-tabs-root"
    :class="{ 'map-tabs-root--bar-only': !hasPanes }"
  >
    <div
      class="map-tabs"
      role="tablist"
    >
      <MapControlButton
        v-for="item in items"
        :key="item.id"
        role="tab"
        :aria-selected="activeId === item.id"
        variant="text"
        size="small"
        :active="activeId === item.id"
        @click="select(item.id)"
      >
        {{ item.label }}
      </MapControlButton>
    </div>
    <div
      v-if="hasPanes"
      class="map-tabs__panes"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="map-tabs__pane"
        role="tabpanel"
        :hidden="activeId !== item.id"
      >
        <slot :name="item.id" />
      </div>
    </div>
  </div>
</template>
