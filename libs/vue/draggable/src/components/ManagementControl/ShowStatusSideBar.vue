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
        </template>
      </ItemList>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useIcon } from '../../hook';
import { useDragContainer } from '../../store';
import { LocationSideBar, SidebarConfig } from '../../types';
import MapButton from '../parts/MapButton.vue';
import ItemList from './ItemList.vue';

const props = defineProps<{
  items: Record<LocationSideBar, SidebarConfig>;
  containerId: string;
}>();

const { ShowIcon } = useIcon();
function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
const filledSides = computed(() => {
  const result = {} as Record<string, SidebarConfig>;
  for (const [side, state] of Object.entries(props.items || {})) {
    if (state?.items?.length) result[side] = state;
  }
  return result;
});
const { getItemAction } = useDragContainer(props.containerId);
function onOpen(id: string) {
  getItemAction(id).open?.();
}
</script>
