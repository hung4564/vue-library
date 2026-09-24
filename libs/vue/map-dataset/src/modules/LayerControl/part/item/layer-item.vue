<template>
  <div class="layer-item-container">
    <div class="layer-item__info">
      <div v-if="isHasIcon" class="layer-item__icon">
        <RegistryItem
          v-if="props.item.icon?.componentKey"
          :componentKey="props.item.icon.componentKey"
          v-bind="props.item.icon.attr"
          :data="item"
          :mapId="mapId"
        ></RegistryItem>
      </div>
      <span
        class="layer-item__title"
        :title="item.getName()"
        @click="emit('click', item)"
      >
        <template v-for="(part, i) in nameParts" :key="i">
          <mark v-if="part.match" class="layer-item__search-match">{{
            part.text
          }}</mark>
          <span v-else>{{ part.text }}</span>
        </template>
      </span>
      <div class="v-spacer"></div>
      <div class="layer-item__title-action">
        <slot name="pre-btn" :loading="loading" />
        <DatasetMenus
          :menus="button_menus"
          :data="item"
          :mapId="mapId"
          :locations="['extra', 'menu']"
          :disabled="loading"
          :getGroups="getGroups"
          :menuContext="rowMenuContexts"
        />
        <MapControlButton
          v-if="!item.config.disabled_delete && !props.readonly"
          :disabled="loading"
          @click.stop="onRemove"
          variant="plain"
          size="small"
        >
          <SvgIcon size="14" type="mdi" :path="path.delete" />
        </MapControlButton>
        <slot name="extra-btn" :loading="loading" />
        <template v-if="!showBottom">
          <DatasetMenus
            :menus="button_menus"
            :data="item"
            :mapId="mapId"
            :locations="['bottom']"
            :disabled="loading"
            :getGroups="getGroups"
            :menuContext="rowMenuContexts"
          />
          <MapControlButton
            @click.stop="onToggleLegend()"
            v-if="isHasLegend"
            variant="plain"
            size="small"
          >
            <SvgIcon
              size="14"
              type="mdi"
              :path="legendShow ? path.legendClose : path.legendOpen"
            />
          </MapControlButton>
        </template>
      </div>
    </div>
    <div class="layer-item__action" v-if="showBottom">
      <DatasetMenus
        :menus="button_menus"
        :data="item"
        :mapId="mapId"
        :locations="['prebottom']"
        :disabled="loading"
        :getGroups="getGroups"
        :menuContext="rowMenuContexts"
      />
      <div class="v-spacer"></div>
      <DatasetMenus
        :menus="button_menus"
        :data="item"
        :mapId="mapId"
        :locations="['bottom']"
        :disabled="loading"
        :getGroups="getGroups"
        :menuContext="rowMenuContexts"
      />
      <MapControlButton
        @click.stop="onToggleChildren()"
        v-if="isHasChildren"
        variant="plain"
        size="small"
      >
        <SvgIcon
          size="14"
          type="mdi"
          :path="childrenShow ? path.legendClose : path.legendOpen"
        />
      </MapControlButton>
      <MapControlButton
        @click.stop="onToggleLegend()"
        v-if="isHasLegend"
        variant="plain"
        size="small"
      >
        <SvgIcon
          size="14"
          type="mdi"
          :path="legendShow ? path.legendClose : path.legendOpen"
        />
      </MapControlButton>
    </div>

    <div v-if="isHasLegend && legendShow">
      <RegistryItem
        v-if="props.item.legend?.componentKey"
        :componentKey="props.item.legend.componentKey"
        :data="item"
        v-bind="props.item.legend.attr"
      ></RegistryItem>
    </div>
    <div v-if="isHasChildren && childrenShow" class="layer-item__children">
      <LayerSubItem
        v-for="item in children"
        :key="item.id"
        :item="item"
        :mapId="mapId"
        :readonly="readonly"
        :disabledMove="disabledMove"
        :disabledCreateGroup="disabledCreateGroup"
        :menuContext="menuContext"
        :getGroups="getGroups"
      ></LayerSubItem>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { IListViewUI } from '@hungpvq/map-dataset';
import {
  findAllComponentsByType,
  splitSearchHighlight,
} from '@hungpvq/map-dataset';
import type {
  ListViewGroupOption,
  MenuAction,
  MenuContextSource,
} from '@hungpvq/map-dataset/menu';
import {
  createMenuConditionContext,
  getResolvedMenus,
  partitionMenuActions,
} from '@hungpvq/map-dataset/menu';
import { MapControlButton, RegistryItem, useShow } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDelete, mdiMenuDown, mdiMenuLeft } from '@mdi/js';
import { computed, onMounted, ref, watch } from 'vue';

import { useMenuConditionSource } from '../../../../extra/menu/condition-context';
import DatasetMenus from '../../../../extra/menu/dataset-menus.vue';
import LayerSubItem from './layer-sub-item.vue';
const props = defineProps<{
  item: IListViewUI;
  mapId: string;
  readonly: boolean;
  disabledMove?: boolean;
  disabledCreateGroup?: boolean;
  menuContext?: MenuContextSource;
  searchQuery?: string;
  getGroups?: () => ListViewGroupOption[];
}>();
const emit = defineEmits(['click', 'click:remove']);
const path = {
  delete: mdiDelete,
  legendOpen: mdiMenuLeft,
  legendClose: mdiMenuDown,
};
const loading = ref(false);
const injectedMenuContext = useMenuConditionSource();
const rowMenuContexts = computed(() => [
  {
    readonly: props.readonly,
    disabledMove: props.disabledMove,
    disabledCreateGroup: props.disabledCreateGroup,
  },
  props.menuContext,
]);
const conditionCtx = computed(() =>
  createMenuConditionContext(props.item, {
    mapId: props.mapId,
    context: [injectedMenuContext, ...rowMenuContexts.value],
  }),
);
const onRemove = () => {
  emit('click:remove', props.item);
};
const nameParts = computed(() =>
  splitSearchHighlight(props.item.getName?.() ?? '', props.searchQuery ?? ''),
);
const button_menus = computed<MenuAction[]>(() => {
  if (!props.item) {
    return [];
  }
  return getResolvedMenus(props.item, 'layer');
});
const partitioned = computed(() =>
  partitionMenuActions(button_menus.value, conditionCtx.value),
);
const showBottom = computed(() => {
  return (
    !props.readonly &&
    (!props.item.config.disabled_opacity || partitioned.value.bottom.length > 0)
  );
});

const isHasIcon = computed(() => props.item && props.item.icon);
const isHasLegend = computed(() => props.item && !!props.item.legend);
const [childrenShow, onToggleChildren] = useShow(
  props.item.config.init_show_children ?? false,
);
const [legendShow, onToggleLegend] = useShow(
  props.item.config.init_show_legend ?? false,
);
const isHasChildren = ref(false);
const children = ref<IListViewUI[]>([]);

function refreshChildren() {
  const allComponentsOfType = findAllComponentsByType(
    props.item,
    'list-item',
  ) as IListViewUI[];
  isHasChildren.value = allComponentsOfType.length > 0;
  children.value = allComponentsOfType.sort((a, b) => b.index - a.index) || [];
}

onMounted(refreshChildren);
watch(() => props.item.id, refreshChildren);
</script>
