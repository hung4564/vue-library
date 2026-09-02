<script lang="ts" setup>
import { type WithMapPropType } from '@hungpvq/map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCached, mdiMagnify, mdiMapMarkerOutline } from '@mdi/js';
import { debounce } from 'lodash';
import { nextTick, ref } from 'vue';
import { defaultMapProps, useMap } from '../../hooks';

import type { MapSimple } from '@hungpvq/map-core';
import { useCoordinate } from '../../extra/crs';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      hideZoom?: boolean;
      hideScale?: boolean;
      hideCoordinates?: boolean;
    }
  >(),
  {
    ...defaultMapProps,
    hideZoom: false,
    hideScale: false,
    hideCoordinates: false,
  },
);
const path = {
  icon: mdiMapMarkerOutline,
  zoom: mdiMagnify,
  change: mdiCached,
};
const scale = ref<HTMLDivElement>();
const currentPoint = ref('');
const lngLat = ref({ latitude: 0, longitude: 0 });
const currentZoom = ref(0);
const isDMS = ref(false);
const { callMap, mapId, moduleContainerProps } = useMap(
  props,
  onInit,
  onDestroy,
);
const { format: formatCoordinate } = useCoordinate(mapId.value);

function onInit(map: MapSimple) {
  currentZoom.value = +map.getZoom().toFixed(2);
  map.on('zoomend', onZoomEnd);
  map.on('mousemove', onMouseMove);
  map.on('move', onMapMove);
  currentZoom.value = +map.getZoom().toFixed(2);

  let center = map.getCenter();
  lngLat.value.latitude = center.lat;
  lngLat.value.longitude = center.lng;
  changePixelValue();
  nextTick(() => {
    updateScale(map, scale.value!);
  });
}
function onDestroy(map: MapSimple) {
  map.off('zoomend', onZoomEnd);
  map.off('mousemove', onMouseMove);
  map.off('move', onMapMove);
}
function onMapMove() {
  callMap((map) => {
    updateScale(map, scale.value!);
  });
}
const onMouseMove = debounce(function (e) {
  let point = [e.lngLat.lng, e.lngLat.lat];
  lngLat.value.latitude = point[1];
  lngLat.value.longitude = point[0];
  changePixelValue();
}, 15);
function changeDisplayTypePixelValue() {
  isDMS.value = !isDMS.value;
  changePixelValue();
}
function changePixelValue() {
  const point = formatCoordinate(lngLat.value, isDMS.value);
  currentPoint.value = point.longitude + ', &nbsp;' + point.latitude;
}
function onZoomEnd() {
  callMap((map) => {
    currentZoom.value = +map.getZoom().toFixed(2);
  });
}

function updateScale(map: MapSimple, container: HTMLElement) {
  if (props.hideScale) return;
  // A horizontal scale is imagined to be present at center of the map
  // container with maximum length (Default) as 100px.
  // Using spherical law of cosines approximation, the real distance is
  // found between the two coordinates.
  const maxWidth = 100;

  const y = map.getContainer().clientHeight / 2;
  const left = map.unproject([0, y]);
  const right = map.unproject([maxWidth, y]);
  const maxMeters = left.distanceTo(right);
  if (maxMeters >= 1000) {
    setScale(container, maxMeters / 1000, 'km');
  } else {
    setScale(container, maxMeters, 'm');
  }
}

function setScale(container: HTMLElement, maxDistance: number, unit: string) {
  const distance = getRoundNum(maxDistance);
  if (container) container.innerHTML = `${distance}&nbsp;${unit}`;
}

function getDecimalRoundNum(d: number) {
  const multiplier = Math.pow(10, Math.ceil(-Math.log(d) / Math.LN10));
  return Math.round(d * multiplier) / multiplier;
}

function getRoundNum(num: number) {
  const pow10 = Math.pow(10, `${Math.floor(num)}`.length - 1);
  let d = num / pow10;

  d =
    d >= 10
      ? 10
      : d >= 5
        ? 5
        : d >= 3
          ? 3
          : d >= 2
            ? 2
            : d >= 1
              ? 1
              : getDecimalRoundNum(d);

  return pow10 * d;
}
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <div class="button-container mouse-coordinates-container">
        <div class="mouse-coordinates-part zoom-part" v-if="!hideZoom">
          <div class="mouse-coordinates-zoom">
            <span title="Current Zoom" class="icon">
              <SvgIcon :size="16" type="mdi" :path="path.zoom" />
            </span>
            <div style="margin-left: 4px">{{ currentZoom }}</div>
          </div>
        </div>
        <div
          class="mouse-coordinates-part coordinates-part"
          v-if="!hideCoordinates"
        >
          <div class="mouse-coordinates-point">
            <div
              style="margin-left: 4px"
              class="selectable"
              v-html="currentPoint"
              :style="{ 'min-width': isDMS ? '220px' : '100px' }"
            ></div>
            <i
              :title="
                isDMS
                  ? 'DMS <=> Latitude, Longitude'
                  : 'Latitude, Longitude <=> DMS'
              "
              style="margin-left: 4px"
              @click="changeDisplayTypePixelValue"
              class="icon icon-clickable"
            >
              <SvgIcon :size="16" type="mdi" :path="path.change" />
            </i>
          </div>
        </div>
        <div class="mouse-coordinates-part scale-part" v-if="!hideScale">
          <div ref="scale" class="scale-custom"></div>
        </div>
      </div>
    </template>
  </ModuleContainer>
</template>
