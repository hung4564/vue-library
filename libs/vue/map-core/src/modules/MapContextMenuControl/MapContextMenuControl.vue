<script lang="ts">
export default {
  name: 'MapContextMenuControl',
};
</script>
<script setup lang="ts">
import {
  copyMapPointCoords,
  createDefaultMapContextMenuItems,
  createMapMenuItemProps,
  EventContextMenu,
  filterVisibleMapMenuItems,
  formatMapContextCoords,
  handleMapMenuAction,
  resolveMapMenuCondition,
  type MapContextMenuItem,
  type MapContextMenuTarget,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { ContextMenu } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronRight, mdiMapMarkerOutline } from '@mdi/js';
import type { MapMouseEvent } from 'maplibre-gl';
import { computed, ref, watch } from 'vue';
import { useEventMap } from '../../extra/event';
import { defaultMapProps, useMap } from '../../hooks';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      items?: MapContextMenuItem[];
      include?: string[];
      exclude?: string[];
      extra?: MapContextMenuItem[];
      prepend?: MapContextMenuItem[];
      showCoords?: boolean;
      enabled?: boolean;
      zoomDelta?: number;
    }
  >(),
  {
    ...defaultMapProps,
    showCoords: true,
    enabled: true,
    zoomDelta: 2,
  },
);

const emit = defineEmits<{
  open: [target: MapContextMenuTarget];
  close: [];
  select: [payload: { item: MapContextMenuItem; target: MapContextMenuTarget }];
}>();

const { mapId } = useMap(props);
const menuRef = ref<{ open: (event: MouseEvent) => void; close: () => void }>();
const target = ref<MapContextMenuTarget>();

const event = new EventContextMenu().setHandler(onContextMenu);
const { add, remove } = useEventMap(mapId.value, event, false);

watch(
  () => props.enabled,
  (enabled) => {
    if (enabled) add();
    else remove();
  },
  { immediate: true },
);

const sourceItems = computed(() => {
  void target.value;
  if (props.items?.length) {
    return [
      ...(props.prepend ?? []),
      ...props.items,
      ...(props.extra ?? []),
    ];
  }
  return createDefaultMapContextMenuItems({
    include: props.include,
    exclude: props.exclude,
    extra: props.extra,
    prepend: props.prepend,
    zoomDelta: props.zoomDelta,
    mapId: mapId.value,
  });
});

const visibleItems = computed(() => {
  if (!target.value) return sourceItems.value;
  return filterVisibleMapMenuItems(sourceItems.value, target.value);
});

const coordsLabel = computed(() => {
  if (!target.value) return '';
  return formatMapContextCoords(target.value.lngLat.lng, target.value.lngLat.lat);
});

function onContextMenu(e: MapMouseEvent) {
  const next: MapContextMenuTarget = {
    lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat },
    point: { x: e.point.x, y: e.point.y },
    mapId: mapId.value,
  };
  target.value = next;
  emit('open', next);
  const mouse = e.originalEvent;
  if (mouse instanceof MouseEvent) {
    menuRef.value?.open(mouse);
  }
}

function onCopyCoords() {
  if (!target.value) return;
  void copyMapPointCoords(target.value);
}

function onSelect(item: MapContextMenuItem, event: MouseEvent) {
  if (!target.value || item.type !== 'item') return;
  if (resolveMapMenuCondition(item.disabled, target.value)) return;
  handleMapMenuAction(item, createMapMenuItemProps(target.value, event));
  emit('select', { item, target: target.value });
  if (!item.children?.length) {
    menuRef.value?.close();
    emit('close');
  }
}

function isDisabled(item: MapContextMenuItem) {
  if (!target.value || item.type !== 'item') return false;
  return resolveMapMenuCondition(item.disabled, target.value);
}
</script>

<template>
  <ContextMenu ref="menuRef">
    <ul class="context-menu map-context-menu" v-if="target">
      <li
        v-if="showCoords"
        class="map-context-menu__coords"
        @click.stop="onCopyCoords"
      >
        <div class="map-context-menu__coords-icon">
          <SvgIcon :size="16" type="mdi" :path="mdiMapMarkerOutline" />
        </div>
        <span class="map-context-menu__label">{{ coordsLabel }}</span>
      </li>
      <template v-for="(item, index) in visibleItems" :key="item.id || index">
        <li v-if="item.type === 'header'" class="map-context-menu__header">
          {{ item.name }}
        </li>
        <li
          v-else-if="item.type === 'divider'"
          class="map-context-menu__divider"
        >
          <div class="map-context-menu__divider-line" />
        </li>
        <li
          v-else
          class="map-context-menu__item"
          :class="{
            'is-disabled': isDisabled(item),
            'map-context-menu__item--has-children': !!item.children?.length,
          }"
          @click.stop="onSelect(item, $event)"
        >
          <div class="map-context-menu__item-icon">
            <SvgIcon
              v-if="item.icon"
              :size="16"
              type="mdi"
              :path="item.icon"
            />
          </div>
          <span class="map-context-menu__label">{{ item.name }}</span>
          <div v-if="item.children?.length" class="map-context-menu__chevron">
            <SvgIcon :size="16" type="mdi" :path="mdiChevronRight" />
          </div>
          <ul
            v-if="item.children?.length"
            class="context-menu map-context-menu map-context-menu__submenu"
          >
            <template
              v-for="(child, childIndex) in item.children"
              :key="child.id || childIndex"
            >
              <li
                v-if="child.type === 'header'"
                class="map-context-menu__header"
              >
                {{ child.name }}
              </li>
              <li
                v-else-if="child.type === 'divider'"
                class="map-context-menu__divider"
              >
                <div class="map-context-menu__divider-line" />
              </li>
              <li
                v-else
                class="map-context-menu__item"
                :class="{ 'is-disabled': isDisabled(child) }"
                @click.stop="onSelect(child, $event)"
              >
                <div class="map-context-menu__item-icon">
                  <SvgIcon
                    v-if="'icon' in child && child.icon"
                    :size="16"
                    type="mdi"
                    :path="child.icon"
                  />
                </div>
                <span v-if="'name' in child" class="map-context-menu__label">{{
                  child.name
                }}</span>
              </li>
            </template>
          </ul>
        </li>
      </template>
    </ul>
  </ContextMenu>
</template>
