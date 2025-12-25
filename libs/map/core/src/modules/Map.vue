<script setup lang="ts">
import { useBreakpoints } from '@hungpvq/shared-core';
import type { MapSimple } from '@hungpvq/shared-map';
import { DraggableContainer } from '@hungpvq/vue-draggable';
import { MapOptions } from 'maplibre-gl';
import { computed, provide, ref } from 'vue';
import ActionControl from '../extra/event/modules/ActionControl.vue';
import { useMapInstance } from '../hooks/useMapInstance';

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
  mapId: { type: String },
});

const emit = defineEmits<{
  (_e: 'map-loaded', _map: MapSimple): void;
  (_e: 'map-destroy', _map: MapSimple): void;
  (_e: 'error', _error: Error): void;
}>();

const { mapContainer, isSupport, loaded, id } = useMapInstance(props, emit);

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
const loadedDrag = ref(false);
function onDragLoadDone(e: any) {
  loadedDrag.value = true;
}
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
    </div>
  </div>
</template>
<style lang="scss">
.btn-close {
  overflow: hidden;
  position: absolute;
  border: none;
  padding: 0;
  width: 2em;
  height: 2em;
  right: 4px;
  border-radius: 50%;
  background: transparent;
  font: inherit;
  text-indent: 100%;
  cursor: pointer;

  &:focus {
    outline: solid 0 transparent;
    box-shadow: 0 0 0 2px #8ed0f9;
  }

  &:hover {
    background: rgba(29, 161, 142, 0.1);
  }

  &:before,
  &:after {
    position: absolute;
    top: 15%;
    left: calc(50% - 0.0625em);
    width: 0.125em;
    height: 70%;
    border-radius: 0.125em;
    transform: rotate(45deg);
    background: currentcolor;
    content: '';
  }

  &:after {
    transform: rotate(-45deg);
  }
}
@import 'maplibre-gl/dist/maplibre-gl.css';
@import '../styles/themes.css';
.draggable-container * {
  pointer-events: all;
}

.mapboxgl-ctrl-logo {
  display: none !important;
  visibility: hidden;
}

.map-container {
  .button-group-container {
    border-radius: 50%;
  }

  .clickable {
    cursor: pointer;
  }

  .clickable {
    position: relative;
  }

  .clickable:hover::before {
    opacity: 0.04;
  }

  .clickable:before {
    background-color: currentColor;
    bottom: 0;
    content: '';
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  }

  .clickable[disabled='disabled'] {
    cursor: default;
    pointer-events: none;
    opacity: 0.25;
  }
}

.map-compare-container,
.map-container {
  .map-control-button,
  .button-group-container > .button-group-sheet {
    box-shadow:
      0 3px 1px -2px rgba(0, 0, 0, 0.2),
      0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 1px 5px 0 rgba(0, 0, 0, 0.12);
  }

  .button-group-container .map-control-button {
    box-shadow: none;
  }

  .card-container .map-control-button {
    box-shadow: none;
  }

  .right-bottom-container,
  .right-top-container,
  .left-bottom-container,
  .left-top-container {
    pointer-events: none;
    z-index: 2;
    position: absolute;

    & > * {
      clear: both;
    }

    & > .button-container,
    & > .button-custom-container {
      pointer-events: all;
    }
  }

  .right-bottom-container {
    bottom: 0;
    right: 0;

    & > .button-container,
    & > .button-custom-container {
      margin: 0 10px 10px 0;
      float: right;
      clear: both;
    }
  }

  .left-bottom-container {
    bottom: 0;
    left: 0;

    & > .button-container,
    & > .button-custom-container {
      margin: 0 0 10px 10px;
      float: left;
    }
  }

  .left-top-container {
    top: 0;
    left: 0;

    & > .button-container,
    & > .button-custom-container {
      margin: 10px 0 0 10px;
      float: left;
    }
  }

  .right-top-container {
    top: 0;
    right: 0;

    & > .button-container,
    & > .button-custom-container {
      margin: 10px 10px 0 0;
      float: right;
    }
  }
  .pointer {
    cursor: pointer;
  }
  .map-row {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .map-co,
  .map-col-6,
  .map-col-12 {
    box-sizing: border-box;
    width: 100%;
  }
  .map-col {
    flex-basis: 0;
    flex-grow: 1;
    max-width: 100%;
  }
  .map-col-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .map-col-6 {
    flex: 0 0 calc(50% - 6px);
    max-width: 50%;
  }
}
</style>
<style scoped lang="scss">
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f7f5f2;
}

.not-support-map {
  width: 100%;
  height: 100%;
  display: flex;
  align-content: center;
  justify-items: center;
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

.map-container .drag-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 800;
  width: 100%;
}
</style>

<style lang="scss">
.context-menu {
  z-index: 900;
  width: 100%;
  border-bottom-width: 0px;
  padding: 0;
  margin: 0;
  background-color: var(--map-card-bg, var(--map-surface-color, #ffffff));
  color: var(--map-card-text, var(--map-text-primary, #333));
  li {
    display: flex;
    cursor: pointer;
    padding: 5px 10px;
    align-items: center;
    width: 100%;
    min-height: 40px;
  }
}
.hungpvq-draggable-card {
  background-color: var(--map-card-bg, var(--map-surface-color, #ffffff));
  color: var(--map-card-text, var(--map-text-primary, #333));
  box-shadow: var(--map-shadow-1, 0 1px 3px rgba(0, 0, 0, 0.12));
  border-radius: 4px;
  overflow: hidden;
}
</style>
