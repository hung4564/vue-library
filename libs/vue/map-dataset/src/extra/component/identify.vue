<template>
  <BaseButton
    v-if="!isMenuLocation"
    class="menu-item"
    :class="{ _active: isActive }"
    :active="isActive"
    :title="title"
    :disabled="disabled"
    @click.stop="onToggle"
  >
    <SvgIcon size="14" type="mdi" :path="iconPath" />
  </BaseButton>
  <li
    v-else
    class="layer-context-menu__item"
    :class="{ _active: isActive, 'is-disabled': disabled }"
    @click.stop="onToggle"
  >
    <div class="layer-context-menu__item-icon">
      <SvgIcon size="16" type="mdi" :path="iconPath" />
    </div>
    <span>{{ title }}</span>
  </li>
</template>

<script setup lang="ts">
import { IDENTIFY_CONTROL, isListIdentifyActive, subscribeIdentifyScope, toggleListIdentifyScope } from '@hungpvq/map-dataset/identify';
import { resolveMenuItemLocation } from '@hungpvq/map-dataset/menu';
import { BaseButton, UniversalRegistry } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCursorPointer } from '@mdi/js';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { WithLayerItemMenuComponentType } from './types';

const props = defineProps<WithLayerItemMenuComponentType>();
const emit = defineEmits<{ close: [] }>();

const resolvedLocation = computed(() =>
  resolveMenuItemLocation(props.item, props.location),
);

const isMenuLocation = computed(() => resolvedLocation.value === 'menu');

const title = computed(() =>
  props.item.type === 'item' && 'name' in props.item && props.item.name
    ? props.item.name
    : 'Identify',
);

const iconPath = computed(() =>
  props.item.type === 'item' && 'icon' in props.item && props.item.icon
    ? props.item.icon
    : mdiCursorPointer,
);

const isActive = ref(false);

function syncActive() {
  isActive.value = isListIdentifyActive(props.mapId, props.data);
}

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  syncActive();
  unsubscribe = subscribeIdentifyScope(props.mapId, syncActive);
});

onUnmounted(() => {
  unsubscribe?.();
});

function onToggle() {
  if (props.disabled) return;
  const result = toggleListIdentifyScope(props.mapId, props.data);
  UniversalRegistry.runControlAction(
    props.mapId,
    IDENTIFY_CONTROL.id,
    IDENTIFY_CONTROL.actionSetScoped,
    result,
  );
  syncActive();
  if (isMenuLocation.value) {
    emit('close');
  }
}
</script>
