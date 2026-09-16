<script setup lang="ts">
import {
  GeoLocateSession,
  MAP_ACTION_LOCALE,
  type GeoLocateControlOptions,
  type GeoLocateUiState,
  type MapSimple,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiCrosshairsGps, mdiCrosshairsOff } from '@mdi/js';
import { ref, watch } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';

const props = withDefaults(
  defineProps<WithMapPropType & GeoLocateControlOptions>(),
  {
    ...defaultMapProps,
    trackUserLocation: true,
    followUserLocation: true,
    showAccuracyCircle: true,
    showUserHeading: true,
    showUserLocation: true,
  },
);

const emit = defineEmits<{
  geolocate: [position: GeolocationPosition];
  error: [payload: { message: string; code?: number }];
  trackuserlocationstart: [];
  trackuserlocationend: [];
}>();

const { mapId, callMap, moduleContainerProps, order } = useMap(
  { ...props, controlId: 'mapGeoLocateControl' },
  undefined,
  onDestroy,
);
const { trans, setLocaleDefault } = useLang(mapId.value);

setLocaleDefault(MAP_ACTION_LOCALE);

const ui = ref<GeoLocateUiState>({
  watchState: 'OFF',
  active: false,
  locating: false,
  disabled: false,
  errorMessage: null,
  errorCode: null,
  background: false,
});

let session: GeoLocateSession | undefined;

watch(
  () =>
    [
      props.trackUserLocation,
      props.followUserLocation,
      props.showAccuracyCircle,
      props.showUserHeading,
      props.showUserLocation,
      props.fitBoundsOptions,
      props.positionOptions,
      props.geolocation,
    ] as const,
  () => {
    session?.destroy();
    session = undefined;
    ui.value = {
      watchState: 'OFF',
      active: false,
      locating: false,
      disabled: false,
      errorMessage: null,
      errorCode: null,
      background: false,
    };
  },
);

function sessionOptions() {
  return {
    trackUserLocation: props.trackUserLocation,
    followUserLocation: props.followUserLocation,
    showAccuracyCircle: props.showAccuracyCircle,
    showUserHeading: props.showUserHeading,
    showUserLocation: props.showUserLocation,
    fitBoundsOptions: props.fitBoundsOptions,
    positionOptions: props.positionOptions,
    geolocation: props.geolocation,
  };
}

function errorTitle(state: GeoLocateUiState) {
  if (state.errorCode === 1) {
    return trans.value('map.action.geolocate-control-permission-denied');
  }
  if (state.errorCode === 3) {
    return trans.value('map.action.geolocate-control-timeout');
  }
  return (
    state.errorMessage ||
    trans.value('map.action.geolocate-control-location-not-available')
  );
}

function getSession(map: MapSimple) {
  if (!session) {
    session = new GeoLocateSession({
      map,
      mapId: mapId.value,
      ...sessionOptions(),
      onStateChange(next) {
        ui.value = next;
      },
      onGeolocate: (position) => emit('geolocate', position),
      onError: (payload) => emit('error', payload),
      onTrackUserLocationStart: () => emit('trackuserlocationstart'),
      onTrackUserLocationEnd: () => emit('trackuserlocationend'),
    });
  }
  return session;
}

function onDestroy() {
  session?.destroy();
  session = undefined;
}

function onClick() {
  GeoLocateSession.primeDeviceOrientationPermission();
  callMap((map) => {
    getSession(map).toggle();
  });
}

useRegisterMapControl(mapId, {
  id: 'mapGeoLocateControl',
  panelKind: 'button',
  buttonPosition: () => props.position,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
    ...sessionOptions(),
  }),
  actions: [
    {
      type: 'mapGeoLocateControl',
      run: () => {
        onClick();
      },
    },
  ],
});
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapGeoLocateControl',
  getState() {
    const error = ui.value.errorMessage;
    const background = ui.value.background;
    return mdiButtonState(error ? mdiCrosshairsOff : mdiCrosshairsGps, {
      visible: true,
      active: ui.value.active,
      disabled: ui.value.disabled,
      loading: ui.value.locating,
      title: error
        ? errorTitle(ui.value)
        : background
          ? trans.value('map.action.geolocate-control-tracking-background')
          : trans.value('map.action.geolocate-control-find-my-location'),
      order: order.value,
    });
  },
  onClick() {
    onClick();
  },
});

watch(ui, () => control.sync(), { deep: true });
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
