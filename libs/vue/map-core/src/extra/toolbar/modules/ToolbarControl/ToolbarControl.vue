<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { MapControlButtonState, WithMapPropType } from '@hungpvq/map-core';
import { defaultMapProps, useMap } from '../../../../hooks';
import MapCommonButton from '../../../../components/MapCommonButton.vue';
import MapControlGroupButton from '../../../../components/MapControlGroupButton.vue';
import ModuleContainer from '../../../../modules/ModuleContainer/ModuleContainer.vue';
import { useMapToolbar } from '../../store';
const props = withDefaults(
  defineProps<Omit<WithMapPropType, 'controlLayout' | 'controlVisible'>>(),
  {
    ...defaultMapProps,
  },
);
const { moduleContainerProps, mapId } = useMap(props);
const buttons = ref<MapControlButtonState[]>([]);
const store = useMapToolbar(mapId.value);
onMounted(() => {
  const unsub = store.subscribe(() => {
    buttons.value = store.getAll();
  });
  buttons.value = store.getAll();

  onUnmounted(unsub);
});
const groupedButtons = computed(() => {
  const map = new Map<string, MapControlButtonState[]>();

  for (const btn of buttons.value) {
    if (!btn.visible) continue;
    const key = btn.group ?? btn.id;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(btn);
  }

  return Array.from(map.entries());
});
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton row>
        <MapControlGroupButton
          v-for="[group, groupButtons] in groupedButtons"
          :key="group"
          row
        >
          <MapCommonButton
            v-for="btn in groupButtons"
            :key="btn.id"
            :option="btn"
            @click="btn.action($event)"
          ></MapCommonButton>
        </MapControlGroupButton>
      </MapControlGroupButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
