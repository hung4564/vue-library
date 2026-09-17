<template>
  <div
    v-if="hasAnything"
    class="dataset-menus"
    :class="rootClass"
  >
    <DatasetMenuButton
      v-for="(menu, i) in inlineMenus"
      :key="menu.id || `inline-${i}`"
      :item="menu"
      :data="data"
      :mapId="mapId"
      :disabled="disabled || isDisabled(menu)"
      @click="onInlineClick(menu, $event)"
    />
    <MapControlButton
      v-if="overflowMenus.length > 0"
      variant="plain"
      size="small"
      :disabled="disabled"
      aria-label="Open menu"
      aria-haspopup="menu"
      @click.prevent.stop="openOverflow"
    >
      <SvgIcon size="14" type="mdi" :path="mdiDotsVertical" />
    </MapControlButton>
    <ContextMenu ref="contextMenuRef">
      <ul class="context-menu layer-context-menu dataset-menus__context">
        <template
          v-for="(option, index) in overflowMenus"
          :key="option.id || index"
        >
          <RegistryItem
            v-if="isMenuItemCustomComponent(option)"
            :componentKey="option.componentMenuKey"
            :item="option"
            :data="data"
            :mapId="mapId"
            :getGroups="getGroups"
            :disabled="disabled || isDisabled(option)"
            :location="getMenuItemLocation(option)"
            @close="closeOverflow"
          />
          <li
            v-else
            class="layer-context-menu__item"
            :class="[
              option.class,
              option.type === 'divider' ? 'layer-context-menu__divider' : '',
              isDisabled(option) ? 'is-disabled' : '',
            ]"
            @click.stop="onOverflowClick(option, $event)"
          >
            <template v-if="option.type === 'divider'">
              <div class="layer-context-menu__divider-line" />
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
    </ContextMenu>
  </div>
</template>

<script setup lang="ts">
import type { IDataset } from '@hungpvq/map-dataset';
import type {
  ListViewGroupOption,
  MenuAction,
  MenuActionLocation,
  MenuContextSource,
} from '@hungpvq/map-dataset/menu';
import {
  createMenuConditionContext,
  getMenuItemLocation,
  handleMenuAction,
  isMenuItemCustomComponent,
  isMenuItemDisabled,
  partitionMenuActions,
} from '@hungpvq/map-dataset/menu';
import { MapControlButton, RegistryItem } from '@hungpvq/vue-map-core';
import { ContextMenu } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCircleSmall, mdiDotsVertical } from '@mdi/js';
import { computed, ref } from 'vue';
import { useMenuConditionSource } from './condition-context';
import DatasetMenuButton from './dataset-menu-button.vue';

defineOptions({ name: 'DatasetMenus' });

const props = withDefaults(
  defineProps<{
    menus: MenuAction[];
    data: IDataset;
    mapId?: string;
    value?: unknown;
    /** Which locations to show after partition. Default: extra + menu (row). */
    locations?: MenuActionLocation[];
    disabled?: boolean;
    class?: string;
    getGroups?: () => ListViewGroupOption[];
    /** Extra condition context merged with inject (e.g. readonly flags). */
    menuContext?: MenuContextSource | MenuContextSource[];
  }>(),
  {
    locations: () => ['extra', 'menu'],
  },
);

const injectedMenuContext = useMenuConditionSource();
const conditionCtx = computed(() =>
  createMenuConditionContext(props.data, {
    mapId: props.mapId,
    context: [
      injectedMenuContext,
      ...(Array.isArray(props.menuContext)
        ? props.menuContext
        : props.menuContext
          ? [props.menuContext]
          : []),
    ],
  }),
);

const partitioned = computed(() =>
  partitionMenuActions(props.menus, conditionCtx.value),
);

const locationSet = computed(() => new Set(props.locations));

const inlineMenus = computed(() => {
  const list: MenuAction[] = [];
  for (const loc of props.locations) {
    if (loc === 'menu') continue;
    list.push(...partitioned.value[loc]);
  }
  return list;
});

const overflowMenus = computed(() =>
  locationSet.value.has('menu') ? partitioned.value.menu : [],
);

const hasAnything = computed(
  () => inlineMenus.value.length > 0 || overflowMenus.value.length > 0,
);

const rootClass = computed(() => props.class);

const contextMenuRef = ref<{
  open: (event?: MouseEvent) => void;
  close: () => void;
} | null>(null);

function isDisabled(option: MenuAction) {
  return isMenuItemDisabled(option, conditionCtx.value);
}

function runAction(menu: MenuAction, event: MouseEvent) {
  if (menu.type === 'divider') return;
  if (props.disabled || isDisabled(menu)) return;
  handleMenuAction(menu, {
    event,
    layer: props.data,
    mapId: props.mapId ?? '',
    value: props.value,
  });
}

function onInlineClick(menu: MenuAction, event: MouseEvent) {
  runAction(menu, event);
}

function openOverflow(event: MouseEvent) {
  contextMenuRef.value?.open(event);
}

function closeOverflow() {
  contextMenuRef.value?.close();
}

function onOverflowClick(menu: MenuAction, event: MouseEvent) {
  runAction(menu, event);
  closeOverflow();
}
</script>
