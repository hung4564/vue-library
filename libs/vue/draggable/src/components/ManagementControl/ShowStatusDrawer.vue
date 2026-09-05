<template>
  <div class="mgmt-groups">
    <div
      v-for="(state, side) in filledSides"
      :key="side"
      class="mgmt-group"
    >
      <div class="mgmt-group__title">
        <span>{{ capitalize(side) }}</span>
        <span class="mgmt__count">{{ state.items.length }}</span>
        <span v-if="state.size" class="mgmt-group__meta"
          >{{ Math.round(state.size) }}px</span
        >
      </div>
      <ItemList
        :items="state.items"
        :show="state.show"
        :containerId="containerId"
      >
        <template #extra="{ item, show }">
          <map-button @click.stop="onOpen(item)" v-if="!show" title="Show">
            <ShowIcon :size="16" />
          </map-button>
          <map-button @click.stop="onClose(item)" v-else title="Hide">
            <HideIcon :size="16" />
          </map-button>
        </template>
      </ItemList>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useIcon } from '../../hook';
import { useDragContainer } from '../../store';
import { DrawerConfig, LocationSideBar } from '../../types';
import MapButton from '../parts/MapButton.vue';
import ItemList from './ItemList.vue';

const props = defineProps<{
  items: Record<LocationSideBar, DrawerConfig>;
  containerId: string;
}>();

const { ShowIcon, HideIcon } = useIcon();
function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
const filledSides = computed(() => {
  const result = {} as Record<string, DrawerConfig>;
  for (const [side, state] of Object.entries(props.items || {})) {
    if (state?.items?.length) result[side] = state;
  }
  return result;
});
const { getItemAction } = useDragContainer(props.containerId);
function onOpen(id: string) {
  getItemAction(id)?.open?.();
}
function onClose(id: string) {
  getItemAction(id)?.close?.();
}
</script>
