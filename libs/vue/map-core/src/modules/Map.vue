<script setup lang="ts">
import type { ButtonInMobile, MapSimple } from '@hungpvq/map-core';
import { bindMapKeyboardShortcuts } from '@hungpvq/map-core';
import '@hungpvq/map-core';
import { useBreakpoints } from '@hungpvq/shared-core';
import { DraggableContainer } from '@hungpvq/vue-draggable';
import { MapOptions } from 'maplibre-gl';
import { computed, onMounted, onUnmounted, provide, reactive, ref } from 'vue';
import MapErrorToast from '../components/MapErrorToast.vue';
import ActionControl from '../extra/event/modules/ActionControl.vue';
import { useMapInstance } from '../hooks/useMapInstance';

const breakpoints = useBreakpoints({
  mobile: 0,
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
});

const props = withDefaults(
  defineProps<{
    mapboxAccessToken?: string;
    initOptions?: Partial<MapOptions>;
    dragId?: string;
    mapId?: string;
    /** Bind Esc / `/` map shortcuts (default true). */
    keyboardShortcuts?: boolean;
    /** On viewports ≤640px: `button` unchanged, `toolbar` merge into ToolbarControl, `menu` cap groups at ½×½ map. */
    buttonInMobile?: ButtonInMobile;
  }>(),
  {
    mapboxAccessToken: '',
    initOptions: () => ({
      attributionControl: false,
      zoomControl: false,
    }),
    keyboardShortcuts: true,
    buttonInMobile: 'button',
  },
);

const emit = defineEmits<{
  (_e: 'map-loaded', _map: MapSimple): void;
  (_e: 'map-destroy', _map: MapSimple): void;
  (_e: 'error', _error: Error): void;
}>();

const { mapContainer, isSupport, loaded, id } = useMapInstance(props, emit);

let unbindShortcuts: (() => void) | undefined;
onMounted(() => {
  if (props.keyboardShortcuts === false) return;
  unbindShortcuts = bindMapKeyboardShortcuts({ mapId: id.value });
});
onUnmounted(() => {
  unbindShortcuts?.();
  unbindShortcuts = undefined;
});

const draggableTo = computed(() => {
  return `map-draggable-${id.value}`;
});
const rightBottomTo = computed(() => {
  return `bottom-right-${id.value}`;
});
const leftBottomTo = computed(() => {
  return `bottom-left-${id.value}`;
});
const rightTopTo = computed(() => {
  return `top-right-${id.value}`;
});
const leftTopTo = computed(() => {
  return `top-left-${id.value}`;
});

const isMobile = breakpoints.smallerOrEqual('tablet');

provide<string>('$map.dragId', props.dragId || draggableTo.value);
provide<string>('$map.id', id.value);
provide('$map.buttonInMobile', computed(() => props.buttonInMobile ?? 'button'));
provide('$map.isMobile', isMobile);

const loadedDrag = ref(false);

function onDragLoadDone() {
  loadedDrag.value = true;
}
type OrderKey = string;
const orderCounters = reactive<Record<OrderKey, number>>({});

function registerModuleOrder(key: OrderKey) {
  if (orderCounters[key] === undefined) {
    orderCounters[key] = 0;
  }
  return orderCounters[key]++;
}

provide('$map.registerModuleOrder', registerModuleOrder);
</script>
<template>
  <div v-if="!isSupport" class="">
    <div class="not-support-map">
      <p class="">
        Trình duyệt của bạn không hỗ trợ hiển thị bản đồ, vui lòng đổi trình
        duyệt hoặc cập nhật bản mới để xem.
      </p>
    </div>
  </div>
  <div
    v-else
    class="map-container"
    :mapId="id"
    :class="{ 'map-mobile-container': isMobile }"
  >
    <div class="map-viewer">
      <div ref="mapContainer" class="map-content" :id="id"></div>
      <template v-if="!props.dragId">
        <div class="right-bottom-container" :id="rightBottomTo" />
        <div class="left-bottom-container" :id="leftBottomTo" />
        <div class="right-top-container" :id="rightTopTo" />
        <div class="left-top-container" :id="leftTopTo" />
        <draggable-container
          v-if="loaded"
          class="drag-container"
          :container-id="draggableTo"
          @init="onDragLoadDone"
        >
        </draggable-container>
      </template>
      <slot v-if="loaded && loadedDrag" />
      <ActionControl v-if="loaded && loadedDrag" />
      <MapErrorToast />
    </div>
  </div>
</template>
