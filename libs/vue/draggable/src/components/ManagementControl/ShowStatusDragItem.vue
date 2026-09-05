<template>
  <div class="mgmt-groups">
    <ItemList :items="items" :itemShows="itemShows" :containerId="containerId">
      <template #extra="{ item, show }">
        <map-button @click.stop="onHighLight(item)" v-if="show" title="Highlight">
          <HighlightIcon :size="16" />
        </map-button>
        <map-button @click.stop="onOpen(item)" v-if="!show" title="Show">
          <ShowIcon :size="16" />
        </map-button>
        <map-button @click.stop="onClose(item)" v-else title="Hide">
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
