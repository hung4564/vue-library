<template lang="">
  <div class="layer-sub-item-container">
    <div class="layer-sub-item__info">
      <LayerItemIcon class="layer-sub-item__icon" :item="{ item }" />
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
            @click="onLayerAction(menu)"
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
import { BaseButton } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDotsVertical } from '@mdi/js';
import { computed } from 'vue';
import type { MenuAction } from '../../../../interfaces';
import type { IListViewUI } from '../../../../model';
import LayerItemIcon from './layer-item-icon.vue';
import LayerMenu from './menu/index.vue';

const path = {
  menu: mdiDotsVertical,
};
const props = defineProps<{
  item: IListViewUI;
  mapId: string;
}>();
const emit = defineEmits(['click:action', 'click:content-menu']);
const button_menus = computed<MenuAction<any>[]>(() => {
  if (!props.item) {
    return [];
  }
  return props.item.getMenus() || [];
});
const extra_menus = computed(() => {
  return button_menus.value
    .filter((x) => x.location !== 'menu')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const content_menus = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'menu')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
function onLayerAction(action: MenuAction<IListViewUI>) {
  emit('click:action', { action, item: props.item });
}
function handleContextClick(event: MouseEvent) {
  emit('click:content-menu', {
    event,
    actions: content_menus.value,
    item: props.item,
  });
}
</script>
<style lang="scss" scoped>
.layer-sub-item {
  &__info {
    width: 100%;
    display: flex;
    align-items: center;
  }
  &__icon {
    flex-grow: 0;
    flex-shrink: 0;
    width: 25px;
    display: flex;
    align-items: center;
  }
  &__title {
    display: inline-block;
    text-align: left;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.75rem !important;
    font-weight: 400;
    line-height: 1.25rem;
    letter-spacing: 0.0333333333em !important;
  }
  &__title-action {
    display: flex;
    flex: 0;
    align-items: center;
  }
}
</style>
