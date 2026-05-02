<template>
  <div class="show-status">
    <div v-for="(state, side) in items" :key="side" class="side-block">
      <div class="side-title">
        Sidebar {{ capitalize(side) }} ({{ state.items.length }} item{{
          state.items.length !== 1 ? 's' : ''
        }})
      </div>
      <ItemList
        :items="state.items"
        :show="state.show"
        :containerId="containerId"
      >
        <template #extra="{ item, show }">
          <map-button @click="onOpen(item)" v-if="!show">
            <ShowIcon :size="16" />
          </map-button>
        </template>
      </ItemList>
    </div>
  </div>
</template>

<script setup lang="ts">
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
const { getItemAction } = useDragContainer(props.containerId);
function onOpen(id: string) {
  getItemAction(id).open?.();
}
</script>

<style scoped>
.show-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.side-title {
  text-transform: capitalize;
  font-weight: bold;
}
</style>
