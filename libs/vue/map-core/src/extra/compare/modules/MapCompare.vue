<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { useBreakpoints } from '@hungpvq/shared-core';
import type { MapSimple } from '@hungpvq/map-core';
import { DraggableContainer } from '@hungpvq/vue-draggable';
import syncMove from '@mapbox/mapbox-gl-sync-move';
import { debounce } from 'lodash';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  provide,
  ref,
} from 'vue';
import Map from '../../../modules/Map.vue';
import { getMap, useMapContainer } from '../../../store/store';
import ActionControl from '../../event/modules/ActionControl.vue';
import { useMapMittStore } from '../../mitt';
import { initStoreMapCompare } from '../store';
import {
  MapCompareSetting,
  MittTypeMapCompare,
  MittTypeMapCompareEventKey,
} from '@hungpvq/map-core';
import { MapCompareSwiper, MapCompareSwiperVertical } from '@hungpvq/map-core';
const breakpoints = useBreakpoints({
  mobile: 0, // optional
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
});
const props = defineProps({
  mapboxAccessToken: {
    type: String,
    default: '',
  },
  initOptions: {
    type: Object,
    default: () => ({
      attributionControl: false,
      zoomControl: false,
    }),
  },
  dragId: { type: String },
});
function isWebglSupported() {
  if (window.WebGLRenderingContext) {
    const canvas = document.createElement('canvas');
    try {
      // Note that { failIfMajorPerformanceCaveat: true } can be passed as a second argument
      // to canvas.getContext(), causing the check to fail if hardware rendering is not available. See
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
      // for more details.
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (context && typeof context.getParameter == 'function') {
        return true;
      }
    } catch (e) {
      // WebGL is supported, but disabled
    }
    return false;
  }
  // WebGL not supported
  return false;
}
const emit = defineEmits(['map-loaded', 'map-destroy']);
const countMap = ref(2);
const isSupport = ref(isWebglSupported());
const loaded = ref(false);
const id = ref(getUUIDv4());
const store = useMapContainer(id.value);
onMounted(() => {
  nextTick(() => {
    onResize();
    window.addEventListener('resize', onResize);
  });
});

function onResize() {
  if (resizeSplit) {
    resizeSplit();
  }
}
onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  destroy();
});
let maps: MapSimple[] = [];
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
provide<string>('$map.dragId', props.dragId || draggableTo.value);
provide<string>('$map.id', id.value);
const isMobile = breakpoints.smallerOrEqual('tablet');

function onMapLoad(map: MapSimple, index: number) {
  maps[index] = map;
  initCompare();
}
function onMapDestroy(map: MapSimple, index: number) {
  delete maps[index];
}
let clearSplit: (() => void) | undefined = undefined;
let clearSync: (() => void) | undefined = undefined;
let resizeSplit: (() => void) | undefined = undefined;
const swiperRef = ref(null);
const mapsRef = ref<any[]>([]);
const containerRef = ref<any[]>([]);
const setting = ref<{
  compare?: boolean;
  split?: boolean;
  sync?: boolean;
  vertical?: boolean;
}>({
  compare: true,
  split: true,
  sync: true,
  vertical: false,
});
const isUseSwiper = computed(() => {
  return setting.value.compare && setting.value.split;
});
function initCompare() {
  if (!maps) return;
  if (
    Array.from({ length: countMap.value }, (_, i) => i).some((i) => !maps[i])
  ) {
    return;
  }
  loaded.value = true;
  nextTick(() => {
    emit('map-loaded', {
      id: id.value,
      maps: maps,
    });
  });
  maps.forEach((map) => {
    if (map) {
      map.resize();
    }
  });
  store.initMaps(maps);
  initStoreMapCompare(id.value);
  setupCompare();
  const emitter = useMapMittStore<MittTypeMapCompare>(id.value);
  emitter.on(MittTypeMapCompareEventKey.set, updateSetting);
}
function updateSetting(p_setting: MapCompareSetting) {
  setting.value = p_setting;
  setupCompare();
}
function destroy() {
  if (clearSplit) {
    clearSplit();
  }
  if (clearSync) {
    clearSync();
  }
  store.removeMap();
  nextTick(() => {
    maps = [];
  });
}
function setupCompare() {
  if (clearSplit) {
    clearSplit();
  }
  if (clearSync) {
    clearSync();
  }
  countMap.value = setting.value.compare ? 2 : 1;
  if (isUseSwiper.value && swiperRef.value) {
    const swiper = setting.value.vertical
      ? MapCompareSwiperVertical(
          swiperRef.value,
          mapsRef.value?.[0].$el,
          mapsRef.value?.[1].$el,
        )
      : MapCompareSwiper(
          swiperRef.value,
          mapsRef.value?.[0].$el,
          mapsRef.value?.[1].$el,
        );
    clearSplit = swiper.clear;
    resizeSplit = swiper.resize;
  }
  if (setting.value.sync) {
    clearSync = syncMove(maps);
  }
  maps.forEach((map) => {
    if (map) {
      map.resize();
    }
  });
}
let observer: any;
const handleResize = debounce((_entry) => {
  getMap(id.value, (map) => {
    map.resize();
  });
  if (resizeSplit) {
    resizeSplit();
  }
}, 200); // 200ms debounce
onMounted(() => {
  observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      handleResize(entry);
    }
  });

  if (containerRef.value) {
    observer.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (observer && containerRef.value) {
    observer.unobserve(containerRef.value);
  }
});
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
    class="map-compare-container"
    :mapId="id"
    :class="{
      'map-mobile-container': isMobile,
    }"
  >
    <div class="map-viewer" ref="containerRef">
      <div
        class="map-compare__container"
        :class="{
          'map-compare__split-vertical': isUseSwiper && !setting.vertical,
          'map-compare__split-horizontal': isUseSwiper && setting.vertical,
        }"
      >
        <Map
          v-for="key in countMap"
          :key="key"
          v-bind="$attrs"
          class="map-compare__item"
          :dragId="draggableTo"
          ref="mapsRef"
          @map-loaded="onMapLoad($event, key - 1)"
          @map-destroy="onMapDestroy($event, key - 1)"
          :initOptions="initOptions"
        >
          <slot :name="`map-${key - 1}`" v-if="loaded" />
        </Map>
        <div class="map-compare__swiper" v-if="isUseSwiper" ref="swiperRef">
          <div class="compare-swiper-icon"></div>
        </div>
      </div>
      <template v-if="!props.dragId">
        <div class="right-bottom-container" :id="rightBottomTo" />
        <div class="left-bottom-container" :id="leftBottomTo" />
        <div class="right-top-container" :id="rightTopTo" />
        <div class="left-top-container" :id="leftTopTo" />
        <draggable-container class="drag-container" :container-id="draggableTo">
        </draggable-container>
      </template>
      <slot v-if="loaded" />
      <ActionControl :mapId="id" v-if="loaded" />
    </div>
  </div>
</template>
