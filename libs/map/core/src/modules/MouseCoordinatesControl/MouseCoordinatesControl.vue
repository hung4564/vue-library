<script lang="ts" setup>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCached, mdiMagnify, mdiMapMarkerOutline } from '@mdi/js';
import { debounce } from 'lodash';
import { computed, nextTick, ref } from 'vue';
import { useMap, withMapProps } from '../../hooks';

import { CrsItem, crsStore, useCoordinate } from '../../extra/crs';
import type { MapSimple } from '@hungpvq/shared-map';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const { getCrsItems, setCrs, getCrs, getCrsItem } = crsStore;
const props = defineProps({
  ...withMapProps,
  hideZoom: Boolean,
  hideCrsSelect: Boolean,
  hideScale: Boolean,
  hideCoordinates: Boolean,
});
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
  onDestroy
);
const { format: formatCoordinate } = useCoordinate(mapId.value);

const crsItems = computed(() => {
  return getCrsItems(mapId.value);
});
const p_crs = ref<string>(getCrs(mapId.value));
const p_crsItem = ref<CrsItem | undefined>(getCrsItem(mapId.value));
const crs = computed({
  get() {
    return p_crs.value;
  },
  set(value) {
    p_crs.value = value;
    p_crsItem.value = crsItems.value.find((x) => x.epsg == value);
    return setCrs(mapId.value, value!);
  },
});
const isCrsDegree = computed(() => {
  return p_crsItem.value?.unit === 'degree';
});
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
              <SvgIcon :size="14" type="mdi" :path="path.zoom" />
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
              v-if="isCrsDegree"
              :title="
                isDMS
                  ? 'DMS <=> Latitude, Longitude'
                  : 'Latitude, Longitude <=> DMS'
              "
              style="margin-left: 4px"
              @click="changeDisplayTypePixelValue"
              class="icon icon-clickable"
            >
              <SvgIcon :size="14" type="mdi" :path="path.change" />
            </i>
          </div>
        </div>
        <div class="mouse-coordinates-part crs-part" v-if="!hideCrsSelect">
          <div class="mouse-coordinates-point">
            <select v-model="crs" class="crs-select" style="width: 70px">
              <option
                :value="item.epsg"
                :key="item.epsg"
                v-for="item in crsItems"
              >
                {{ item.name || item.epsg }}
              </option>
            </select>
          </div>
        </div>
        <div class="mouse-coordinates-part scale-part" v-if="!hideScale">
          <div ref="scale" class="scale-custom"></div>
        </div>
      </div>
    </template>
  </ModuleContainer>
</template>
<style lang="scss">
.map-mobile-container {
  .coordinates-part {
    order: 1;
  }
  .mouse-coordinates-container {
    flex-direction: column;
    gap: 8px;
    & > div {
      flex-grow: 0 !important;
      margin: 0 !important;
    }
  }

  .mouse-coordinates-container {
    flex-direction: column;
    justify-content: right;
    align-items: flex-end;

    .mouse-coordinates,
    .crs-coordinates {
      flex-grow: 0;
      margin-top: 8px;
      margin-right: 0;

      select {
        text-align: center;
      }
    }

    .mouse-coordinates-point {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    .scale-custom,
    .zoom-coordinates {
      min-width: 80px;
      text-align: center;
    }

    .zoom-coordinates {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
<style scoped lang="scss">
.icon-clickable {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 8px;
}

.icon-clickable:hover,
.icon-clickable:focus {
  filter: brightness(1.1);
}

.icon-clickable:active {
  filter: brightness(0.8);
}

.mouse-coordinates-container {
  display: flex;
  letter-spacing: 0.5px;
  pointer-events: all;

  .icon {
    display: flex;
    align-items: center;
  }

  & > div {
    flex-grow: 1;
    display: flex;
    padding-right: 8px;
    padding-left: 8px;
    margin-right: 8px;
  }

  .crs-coordinates {
    select {
      border-style: none;
      background: transparent;
      appearance: none;
      /* for Firefox */
      -moz-appearance: none;
      /* for Chrome */
      -webkit-appearance: none;

      &:focus {
        outline: none;
      }
    }

    select::-ms-expand {
      display: none;
    }

    display: flex;
    padding-right: 8px;
    padding-left: 8px;
    margin-right: 8px;
  }

  .mouse-coordinates-zoom,
  .mouse-coordinates-point {
    flex-grow: 0;
    display: flex;
  }

  .scale-custom {
    flex-grow: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 75px;
  }
}
.mouse-coordinates-part {
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
    0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
  background-color: hsla(0, 0%, 100%, 0.7529411764705882);
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  padding: 4px;
}
.crs-select {
  background-color: transparent;
}
</style>
