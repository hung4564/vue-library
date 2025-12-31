<script setup lang="ts">
import { toValue, tryOnMounted, tryOnUnmounted } from '@hungpvq/shared';
import { useGeolocation } from '@hungpvq/shared-core';
import type { MapSimple } from '@hungpvq/shared-map';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCrosshairsGps, mdiCrosshairsOff } from '@mdi/js';
import { LngLatLike, MapLibreEvent, Marker } from 'maplibre-gl';
import { computed, ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import MapControlButton from '../../components/MapControlButton.vue';
import { useLang, useToolbarControl } from '../../extra';
import { defaultMapProps, useMap, type WithMapPropType } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';

const { coords, error, resume, pause } = useGeolocation({
  immediate: false,
});

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});

const { mapId, callMap, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);

setLocaleDefault({
  map: {
    action: {
      'geolocate-control-find-my-location': 'Find my location',
      'geolocate-control-location-not-available': 'Location not available',
    },
  },
});

const active = ref(false);
const center = ref<LngLatLike>();
const p_accuracy = ref(0);
let p_dotElement: HTMLElement,
  p_circleElement: HTMLElement,
  p_userLocationDotMarker = ref<Marker | undefined>(undefined),
  _accuracyCircleMarker = ref<Marker | undefined>(undefined);

const iconGeolocate = computed(() => {
  if (error.value) return mdiCrosshairsOff;
  return mdiCrosshairsGps;
});

const tooltipGeolocate = computed(() => {
  const str = error.value
    ? error.value.message ||
      trans.value('map.action.geolocate-control-location-not-available')
    : trans.value('map.action.geolocate-control-find-my-location');
  return str;
});

watch(coords, (value) => {
  if (
    value.longitude == Number.POSITIVE_INFINITY ||
    value.latitude == Number.POSITIVE_INFINITY
  ) {
    return;
  }
  center.value = [value.longitude, value.latitude];
  p_accuracy.value = value.accuracy;
  if (center.value) onAddUi();
});

async function onClick() {
  callMap((map) => {
    if (!active.value) {
      active.value = true;
      resume().then((position) => {
        if (position) {
          const coords: GeolocationCoordinates = position.coords;
          const lngLat: LngLatLike = [coords.longitude, coords.latitude];
          map.flyTo({
            center: lngLat,
            zoom: 14,
          });
        }
      });
      return;
    }
    if (isOutOfMapMaxBounds(map, toValue(coords))) {
      map.flyTo({
        center: center.value,
        zoom: 14,
      });
      return;
    }
    pause();
    active.value = false;
    center.value = undefined;
    onDestroy();
  });
}

tryOnUnmounted(() => {
  onDestroy();
});

function onDestroy() {
  callMap((map) => {
    map.off('zoom', onZoom);
  });
  if (p_userLocationDotMarker.value) {
    p_userLocationDotMarker.value.remove();
  }
  if (_accuracyCircleMarker.value) {
    _accuracyCircleMarker.value.remove();
  }
}

tryOnMounted(() => {
  if (!p_dotElement) {
    p_dotElement = DOMcreate('div', 'mapboxgl-user-location');

    p_dotElement.classList.add('mapboxgl-user-location');
    p_dotElement.appendChild(DOMcreate('div', 'mapboxgl-user-location-dot'));
    p_dotElement.appendChild(
      DOMcreate('div', 'mapboxgl-user-location-heading'),
    );
  }
  if (!p_circleElement) {
    p_circleElement = DOMcreate(
      'div',
      'mapboxgl-user-location-accuracy-circle',
    );
  }
});

function onAddUi() {
  callMap((map) => {
    if (!p_userLocationDotMarker.value) {
      p_userLocationDotMarker.value = new Marker({
        element: p_dotElement,
        rotationAlignment: 'map',
        pitchAlignment: 'map',
      })
        .setLngLat(center.value!)
        .addTo(map);
    } else {
      p_userLocationDotMarker.value.setLngLat(center.value!).addTo(map);
    }

    if (!_accuracyCircleMarker.value) {
      _accuracyCircleMarker.value = new Marker({
        element: p_circleElement,
        pitchAlignment: 'map',
      })
        .setLngLat(center.value!)
        .addTo(map);
    } else {
      _accuracyCircleMarker.value.setLngLat(center.value!).addTo(map);
    }

    map.on('zoom', onZoom);
    updateCircleRadius(map);
  });
}

function updateCircleRadius(map: MapSimple) {
  if (!p_accuracy.value || p_accuracy.value <= 1) {
    p_circleElement.style.width = '1px';
    p_circleElement.style.height = '1px';
    return;
  }
  const y = map.getContainer().getBoundingClientRect().height / 2;
  const a = map.unproject([0, y]);
  const b = map.unproject([100, y]);
  const metersPerPixel = a.distanceTo(b) / 100;
  const circleDiameter = Math.ceil((2.0 * p_accuracy.value) / metersPerPixel);
  p_circleElement.style.width = `${circleDiameter}px`;
  p_circleElement.style.height = `${circleDiameter}px`;
}

function onZoom(event: MapLibreEvent) {
  updateCircleRadius(event.target as MapSimple);
}

const DOMcreate = function (
  tagName: string,
  className: string,
  container?: HTMLElement,
) {
  const el = window.document.createElement(tagName);
  if (className !== undefined) el.className = className;
  if (container) container.appendChild(el);
  return el;
};

function isOutOfMapMaxBounds(
  map: MapSimple,
  coordinates: GeolocationCoordinates,
) {
  const bounds = map.getBounds();
  return (
    bounds &&
    (coordinates.longitude < bounds.getWest() ||
      coordinates.longitude > bounds.getEast() ||
      coordinates.latitude < bounds.getSouth() ||
      coordinates.latitude > bounds.getNorth())
  );
}
const { state, control } = useToolbarControl(mapId.value, props.controlLayout, {
  id: 'mapGeoLocateControl',
  getState() {
    const tooltipGeolocate = error.value
      ? error.value.message ||
        trans.value('map.action.geolocate-control-location-not-available')
      : trans.value('map.action.geolocate-control-find-my-location');
    return {
      visible: true,
      active: active.value,
      title: tooltipGeolocate,
      disabled: !!error.value,
      icon: {
        type: 'mdi',
        path: error.value ? mdiCrosshairsOff : mdiCrosshairsGps,
      },
    };
  },
  onClick() {
    onClick();
  },
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton v-if="state" :option="state" @click="control.onAction">
      </MapCommonButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
<style>
.mapboxgl-user-location-accuracy-circle {
  background-color: #1da1f233;
  border-radius: 100%;
  height: 1px;
  width: 1px;
}
</style>
