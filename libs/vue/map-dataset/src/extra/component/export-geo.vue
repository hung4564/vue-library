<template>
  <li
    class="layer-context-menu__item layer-context-menu__item--has-children"
    :class="{ 'is-open': open, 'is-disabled': disabled }"
    @click.stop="onToggle"
  >
    <div class="layer-context-menu__item-icon">
      <SvgIcon
        size="16"
        type="mdi"
        :path="('icon' in item && item.icon) || mdiDownload"
      />
    </div>
    <span>{{ 'name' in item ? item.name : 'Export' }}</span>
    <div class="layer-context-menu__chevron">
      <SvgIcon size="16" type="mdi" :path="mdiChevronRight" />
    </div>
    <ul class="context-menu layer-context-menu layer-context-menu--submenu">
      <li
        v-for="(child, index) in children"
        :key="child.id || index"
        class="layer-context-menu__item"
        @click.stop="onChildClick(child, $event)"
      >
        <div class="layer-context-menu__item-icon">
          <SvgIcon
            size="16"
            type="mdi"
            :path="('icon' in child && child.icon) || mdiDownload"
          />
        </div>
        <span>{{ 'name' in child ? child.name : '' }}</span>
      </li>
    </ul>
  </li>
</template>
<script setup lang="ts">
import type { MenuAction } from '@hungpvq/map-dataset';
import {
  createExportGeoSubmenu,
  getExportGeoMenuOptions,
  handleMenuAction,
} from '@hungpvq/map-dataset';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronRight, mdiDownload } from '@mdi/js';
import { computed, ref } from 'vue';
import type { WithLayerItemMenuComponentType } from './types';

defineOptions({ name: 'LayerActionExportGeo' });

const props = defineProps<WithLayerItemMenuComponentType>();

const emit = defineEmits<{
  close: [];
}>();

const open = ref(false);

const children = computed(() =>
  createExportGeoSubmenu(getExportGeoMenuOptions(props.item)),
);

function onToggle() {
  if (props.disabled) return;
  open.value = !open.value;
}

function onChildClick(action: MenuAction, event: MouseEvent) {
  if (!props.data || props.disabled) return;
  handleMenuAction(action, {
    event,
    layer: props.data,
    mapId: props.mapId,
    value: props.data,
  });
  open.value = false;
  emit('close');
}
</script>
