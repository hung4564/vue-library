<template>
  <div class="layer-sub-item-container">
    <div class="layer-sub-item__info">
      <div v-if="isHasIcon" class="layer-sub-item__icon">
        <RegistryItem
          v-if="props.item.icon?.componentKey"
          :componentKey="props.item.icon.componentKey"
          v-bind="props.item.icon.attr"
          :data="item"
          :mapId="mapId"
        ></RegistryItem>
      </div>
      <span class="layer-sub-item__title" :title="item.getName()">
        <span>{{ item.getName() }}</span>
      </span>
      <div class="layer-sub-item__title-action">
        <slot name="pre-btn" />
        <DatasetMenus
          :menus="button_menus"
          :data="item"
          :mapId="mapId"
          :locations="['extra', 'menu']"
          :getGroups="getGroups"
          :menuContext="rowMenuContexts"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { IListViewUI } from '@hungpvq/map-dataset';
import type {
  ListViewGroupOption,
  MenuAction,
  MenuContextSource,
} from '@hungpvq/map-dataset/menu';
import { getResolvedMenus } from '@hungpvq/map-dataset/menu';
import { RegistryItem } from '@hungpvq/vue-map-core';
import { computed } from 'vue';

import DatasetMenus from '../../../../extra/menu/dataset-menus.vue';

const props = defineProps<{
  item: IListViewUI;
  mapId: string;
  readonly?: boolean;
  disabledMove?: boolean;
  disabledCreateGroup?: boolean;
  menuContext?: MenuContextSource;
  getGroups?: () => ListViewGroupOption[];
}>();
const isHasIcon = computed(() => props.item && props.item.icon);
const rowMenuContexts = computed(() => [
  {
    readonly: props.readonly,
    disabledMove: props.disabledMove,
    disabledCreateGroup: props.disabledCreateGroup,
  },
  props.menuContext,
]);
const button_menus = computed<MenuAction[]>(() => {
  if (!props.item) {
    return [];
  }
  return getResolvedMenus(props.item, 'layer');
});
</script>
