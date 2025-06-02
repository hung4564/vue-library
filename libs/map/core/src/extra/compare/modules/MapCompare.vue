<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { useBreakpoints } from '@hungpvq/shared-core';
import type { MapSimple } from '@hungpvq/shared-map';
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
} from '../types';
import { MapCompareSwiper, MapCompareSwiperVertical } from './helper';
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
const handleResize = debounce((entry) => {
  const { width, height } = entry.contentRect;
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
<style scoped>
.not-support-map {
  width: 100%;
  height: 100%;
  display: flex;
  align-content: center;
  justify-items: center;
}
</style>
<style scoped lang="scss">
.map-compare-container {
  position: relative;
  min-height: 100%;
  height: 100%;
  width: 100%;
  flex-direction: column;
  box-sizing: border-box;
  flex: 1 1 auto;
  .map-compare__container {
    position: relative;
    display: flex;
    overflow: hidden;
    height: 100%;
    width: 100%;
    .map-compare__item {
      flex: 1 1 auto;
      height: 100%;
    }
  }
  .map-compare__split-vertical {
    .map-compare__item {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    .map-compare__swiper {
      background-color: #fff;
      position: absolute;
      width: 2px;
      height: 100%;
      z-index: 1;
      .compare-swiper-icon {
        background-color: #3887be;
        box-shadow: inset 0 0 0 2px #fff;
        display: inline-block;
        border-radius: 50%;
        position: absolute;
        width: 40px;
        height: 40px;
        top: 50%;
        left: -20px;
        margin: -20px 1px 0;
        color: #fff;
        cursor: ew-resize;
        background-size: 40px;
        background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiICAgd2lkdGg9IjYwIiAgIGhlaWdodD0iNjAiICAgdmVyc2lvbj0iMS4xIiAgIHZpZXdCb3g9IjAgMCA2MCA2MCIgICBpZD0ic3ZnNTQzNCIgICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkxK2RldmVsK29zeG1lbnUgcjEyOTExIiAgIHNvZGlwb2RpOmRvY25hbWU9Imwtci5zdmciPiAgPG1ldGFkYXRhICAgICBpZD0ibWV0YWRhdGE1NDQ0Ij4gICAgPHJkZjpSREY+ICAgICAgPGNjOldvcmsgICAgICAgICByZGY6YWJvdXQ9IiI+ICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4gICAgICAgIDxkYzp0eXBlICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+ICAgICAgPC9jYzpXb3JrPiAgICA8L3JkZjpSREY+ICA8L21ldGFkYXRhPiAgPGRlZnMgICAgIGlkPSJkZWZzNTQ0MiIgLz4gIDxzb2RpcG9kaTpuYW1lZHZpZXcgICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIgICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IiAgICAgYm9yZGVyb3BhY2l0eT0iMSIgICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiICAgICBncmlkdG9sZXJhbmNlPSIxMCIgICAgIGd1aWRldG9sZXJhbmNlPSIxMCIgICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIgICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTI4NiIgICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijc1MSIgICAgIGlkPSJuYW1lZHZpZXc1NDQwIiAgICAgc2hvd2dyaWQ9InRydWUiICAgICBpbmtzY2FwZTp6b29tPSI0IiAgICAgaW5rc2NhcGU6Y3g9IjI1Ljg4OTgzMSIgICAgIGlua3NjYXBlOmN5PSIzNC4zODE4MzMiICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMCIgICAgIGlua3NjYXBlOndpbmRvdy15PSIyMyIgICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJzdmc1NDM0IiAgICAgaW5rc2NhcGU6b2JqZWN0LW5vZGVzPSJ0cnVlIiAgICAgaW5rc2NhcGU6c25hcC1zbW9vdGgtbm9kZXM9InRydWUiPiAgICA8aW5rc2NhcGU6Z3JpZCAgICAgICB0eXBlPSJ4eWdyaWQiICAgICAgIGlkPSJncmlkNTk4OSIgLz4gIDwvc29kaXBvZGk6bmFtZWR2aWV3PiAgPHBhdGggICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjFweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2Utb3BhY2l0eToxIiAgICAgZD0iTSAyNSAyNCBMIDE2IDMwIEwgMjUgMzYgTCAyNSAyNCB6IE0gMzUgMjQgTCAzNSAzNiBMIDQ0IDMwIEwgMzUgMjQgeiAiICAgICBpZD0icGF0aDU5OTUiIC8+PC9zdmc+);
      }
    }
  }
  .map-compare__split-horizontal {
    .map-compare__item {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    .map-compare__swiper {
      background-color: #fff;
      position: absolute;
      height: 4px;
      width: 100%;
      z-index: 1;
      .compare-swiper-icon {
        transform: rotate(90deg);
        transform-origin: center center;
        background-color: #3887be;
        box-shadow: inset 0 0 0 2px #fff;
        display: inline-block;
        border-radius: 50%;
        position: absolute;
        width: 40px;
        height: 40px;
        left: 50%;
        margin: -20px 1px 0;
        color: #fff;
        cursor: n-resize;
        background-size: 40px;
        background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiICAgd2lkdGg9IjYwIiAgIGhlaWdodD0iNjAiICAgdmVyc2lvbj0iMS4xIiAgIHZpZXdCb3g9IjAgMCA2MCA2MCIgICBpZD0ic3ZnNTQzNCIgICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkxK2RldmVsK29zeG1lbnUgcjEyOTExIiAgIHNvZGlwb2RpOmRvY25hbWU9Imwtci5zdmciPiAgPG1ldGFkYXRhICAgICBpZD0ibWV0YWRhdGE1NDQ0Ij4gICAgPHJkZjpSREY+ICAgICAgPGNjOldvcmsgICAgICAgICByZGY6YWJvdXQ9IiI+ICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4gICAgICAgIDxkYzp0eXBlICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+ICAgICAgPC9jYzpXb3JrPiAgICA8L3JkZjpSREY+ICA8L21ldGFkYXRhPiAgPGRlZnMgICAgIGlkPSJkZWZzNTQ0MiIgLz4gIDxzb2RpcG9kaTpuYW1lZHZpZXcgICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIgICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IiAgICAgYm9yZGVyb3BhY2l0eT0iMSIgICAgIG9iamVjdHRvbGVyYW5jZT0iMTAiICAgICBncmlkdG9sZXJhbmNlPSIxMCIgICAgIGd1aWRldG9sZXJhbmNlPSIxMCIgICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIgICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTI4NiIgICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijc1MSIgICAgIGlkPSJuYW1lZHZpZXc1NDQwIiAgICAgc2hvd2dyaWQ9InRydWUiICAgICBpbmtzY2FwZTp6b29tPSI0IiAgICAgaW5rc2NhcGU6Y3g9IjI1Ljg4OTgzMSIgICAgIGlua3NjYXBlOmN5PSIzNC4zODE4MzMiICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMCIgICAgIGlua3NjYXBlOndpbmRvdy15PSIyMyIgICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJzdmc1NDM0IiAgICAgaW5rc2NhcGU6b2JqZWN0LW5vZGVzPSJ0cnVlIiAgICAgaW5rc2NhcGU6c25hcC1zbW9vdGgtbm9kZXM9InRydWUiPiAgICA8aW5rc2NhcGU6Z3JpZCAgICAgICB0eXBlPSJ4eWdyaWQiICAgICAgIGlkPSJncmlkNTk4OSIgLz4gIDwvc29kaXBvZGk6bmFtZWR2aWV3PiAgPHBhdGggICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjFweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2Utb3BhY2l0eToxIiAgICAgZD0iTSAyNSAyNCBMIDE2IDMwIEwgMjUgMzYgTCAyNSAyNCB6IE0gMzUgMjQgTCAzNSAzNiBMIDQ0IDMwIEwgMzUgMjQgeiAiICAgICBpZD0icGF0aDU5OTUiIC8+PC9zdmc+);
      }
    }
  }
}
</style>

<style scoped lang="scss">
.map-compare-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f7f5f2;
}
.map-viewer {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

.map-content {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.map-compare-container .drag-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 800;
  width: 100%;
}
</style>
