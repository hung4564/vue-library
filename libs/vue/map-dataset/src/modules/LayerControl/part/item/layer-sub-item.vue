<template lang="">
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
        <template v-for="(menu, i) in extra_menus" :key="i">
          <LayerMenu
            :item="menu"
            :data="item"
            :mapId="mapId"
            :disabled="isMenuItemDisabled(menu, conditionCtx)"
            @click="onLayerAction($event, menu)"
          />
        </template>
        <BaseButton
          v-if="content_menus.length > 0"
          @click.prevent.stop="handleContextClick"
        >
          <SvgIcon size="14" type="mdi" :path="path.menu" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {
  IListViewUI,
  MenuAction,
  MenuContextSource,
} from '@hungpvq/map-dataset';
import {
  createMenuConditionContext,
  isMenuItemDisabled,
  isMenuItemHidden,
} from '@hungpvq/map-dataset';
import { BaseButton, RegistryItem } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDotsVertical } from '@mdi/js';
import { computed } from 'vue';
import { useMenuConditionSource } from '../../../../extra/menu/condition-context';
import LayerMenu from './menu/index.vue';

const path = {
  menu: mdiDotsVertical,
};
const props = defineProps<{
  item: IListViewUI;
  mapId: string;
  readonly?: boolean;
  disabledMove?: boolean;
  disabledCreateGroup?: boolean;
  menuContext?: MenuContextSource;
}>();
const isHasIcon = computed(() => props.item && props.item.icon);
const emit = defineEmits(['click:action', 'click:content-menu']);
const injectedMenuContext = useMenuConditionSource();
const conditionCtx = computed(() =>
  createMenuConditionContext(props.item, {
    mapId: props.mapId,
    context: [
      {
        readonly: props.readonly,
        disabledMove: props.disabledMove,
        disabledCreateGroup: props.disabledCreateGroup,
      },
      injectedMenuContext,
      props.menuContext,
    ],
  }),
);
const button_menus = computed<MenuAction<any>[]>(() => {
  if (!props.item) {
    return [];
  }
  return props.item.getMenus() || [];
});
const extra_menus = computed(() => {
  return button_menus.value
    .filter((x) => x.location !== 'menu')
    .filter((x) => !isMenuItemHidden(x, conditionCtx.value))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const content_menus = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'menu')
    .filter((x) => !isMenuItemHidden(x, conditionCtx.value))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
function onLayerAction(event: MouseEvent, action: MenuAction<IListViewUI>) {
  if (isMenuItemDisabled(action, conditionCtx.value)) return;
  emit('click:action', { event, action, item: props.item });
}
function handleContextClick(event: MouseEvent) {
  emit('click:content-menu', {
    event,
    actions: content_menus.value,
    item: props.item,
  });
}
</script>
