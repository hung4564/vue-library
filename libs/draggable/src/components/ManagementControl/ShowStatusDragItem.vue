<template>
  <div class="show-status">
    <ItemList :items="items" :itemShows="itemShows" :containerId="containerId">
      <template #extra="{ item, show }">
        <map-button @click="onHighLight(item)" v-if="show">
          <HighlightIcon :size="16" />
        </map-button>
        <map-button @click="onOpen(item)" v-if="!show">
          <ShowIcon :size="16" />
        </map-button>
        <map-button @click="onClose(item)" v-else>
          <HideIcon :size="16" />
        </map-button>
      </template>
    </ItemList>
  </div>
</template>

<script setup lang="ts">
import { useIcon } from '../../hook';
import { useDragContainer } from '../../store';
import MapButton from '../parts/MapButton.vue';
import ItemList from './ItemList.vue';

const { HighlightIcon, ShowIcon, HideIcon } = useIcon();
const props = defineProps<{
  items: string[];
  itemShows: string[];
  containerId: string;
}>();
const { getItemAction } = useDragContainer(props.containerId);
function onHighLight(id: string) {
  getItemAction(id).setHighLight?.();
}
function onOpen(id: string) {
  getItemAction(id).open?.();
}
function onClose(id: string) {
  getItemAction(id).close?.();
}
</script>
