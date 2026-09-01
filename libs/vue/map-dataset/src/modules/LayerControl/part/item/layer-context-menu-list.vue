<template>
  <ul class="context-menu layer-context-menu">
    <template v-for="(option, index) in visibleItems" :key="option.id || index">
      <RegistryItem
        v-if="isMenuItemCustomComponent(option)"
        :componentKey="option.componentMenuKey"
        :item="option"
        :data="view"
        :mapId="mapId"
        :getGroups="getGroups"
        :disabled="isDisabled(option)"
        @close="emit('close')"
      />
      <li
        v-else
        class="layer-context-menu__item"
        :class="[
          option.class,
          option.type === 'divider' ? 'layer-context-menu__divider' : '',
          isDisabled(option) ? 'is-disabled' : '',
        ]"
        @click.stop="onClick(option, $event)"
      >
        <template v-if="option.type === 'divider'">
          <div class="layer-context-menu__divider-line"></div>
        </template>
        <template v-else>
          <div class="layer-context-menu__item-icon">
            <SvgIcon
              size="16"
              type="mdi"
              :path="('icon' in option && option.icon) || mdiCircleSmall"
            />
          </div>
          <span>{{ 'name' in option ? option.name : '' }}</span>
        </template>
      </li>
    </template>
  </ul>
</template>
<script setup lang="ts">
import type {
  IListViewUI,
  ListViewGroupOption,
  MenuAction,
} from '@hungpvq/map-dataset';
import {
  createMenuConditionContext,
  isMenuItemCustomComponent,
  isMenuItemDisabled,
  isMenuItemHidden,
} from '@hungpvq/map-dataset';
import { RegistryItem } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCircleSmall } from '@mdi/js';
import { computed } from 'vue';
import { useMenuConditionSource } from '../../../../extra/menu/condition-context';

defineOptions({ name: 'LayerContextMenuList' });

const props = defineProps<{
  items: MenuAction<IListViewUI>[];
  view?: IListViewUI;
  mapId?: string;
  getGroups?: () => ListViewGroupOption[];
}>();

const emit = defineEmits<{
  select: [payload: { action: MenuAction<IListViewUI>; event: MouseEvent }];
  close: [];
}>();

const injectedMenuContext = useMenuConditionSource();
const conditionCtx = computed(() =>
  props.view
    ? createMenuConditionContext(props.view, {
        mapId: props.mapId,
        context: [injectedMenuContext],
      })
    : undefined,
);

const visibleItems = computed(() => {
  if (!conditionCtx.value) return props.items;
  return props.items.filter((item) => !isMenuItemHidden(item, conditionCtx.value!));
});

function isDisabled(option: MenuAction<IListViewUI>) {
  if (!conditionCtx.value) return false;
  return isMenuItemDisabled(option, conditionCtx.value);
}

function onClick(option: MenuAction<IListViewUI>, event: MouseEvent) {
  if (option.type === 'divider') return;
  if (isDisabled(option)) return;
  emit('select', { action: option, event });
}
</script>
