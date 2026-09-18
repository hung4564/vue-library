<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton row class="map-measurement-control">
        <template v-for="(btn, id) in state">
          <MapCommonButton
            v-if="btn?.visible != false"
            :key="id"
            :option="btn"
            @click.stop="control.onAction(id, $event)"
          />
        </template>
      </MapControlGroupButton>
    </template>

    <slot />

    <MeasurementSettingPopup
      v-if="ui.measurementType"
      v-model:show="settingShow"
      :modelValue="ui.coordinates"
      :position="position"
      :maxLength="ui.setting.maxLength"
      :fields="ui.setting.fields"
      :measurementType="ui.measurementType"
      @update:modelValue="session.setCoordinates"
      @refresh="session.setCoordinates(ui.coordinates)"
    />
  </ModuleContainer>
</template>

<script lang="ts">
export default {
  name: 'measurement-control',
};
</script>

<script setup lang="ts">
import { MapMouseEvent } from 'maplibre-gl';
import { computed, nextTick, reactive, watch } from 'vue';

import {
  MapSimple,
  WithMapPropType,
  logHelper,
} from '@hungpvq/map-core';
import {
  buildMapCrsCatalog,
  resolveCrsDisplayItems,
} from '@hungpvq/map-core/crs';
import { EventClick } from '@hungpvq/map-core/event';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  MEASUREMENT_CONTROL_LOCALE,
  MEASUREMENT_MAP_VIEW_IMAGE,
  createMeasurementSession,
  resolveMeasurementToolbarStatus,
  type MeasureActionItem,
  type MeasurementModeType,
  type MeasurementUiState,
} from '@hungpvq/map-core/measurement';

import MapCommonButton from '../../../components/MapCommonButton.vue';
import MapControlGroupButton from '../../../components/MapControlGroupButton.vue';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useMapCrsDisplayEpsgs, useMapCrsItems } from '../../crs/hooks/useMapCrsItems';
import { useEventMap } from '../../event/hook/useEvent';
import { useMapImage } from '../../image/store';
import { useLang } from '../../lang/hook';
import { useRegisterMapControl } from '../../registry/useRegisterMapControl';
import { type ToolbarButtonConfig } from '@hungpvq/map-core/toolbar';
import { useToolbarControl } from '../../toolbar/helper';

import {
  mdiAngleAcute,
  mdiClose,
  mdiCogOutline,
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiMapMarkerOutline,
  mdiRadiusOutline,
  mdiRuler,
  mdiRulerSquareCompass,
  mdiTableHeadersEye,
} from '@mdi/js';

import { logger } from '../logger';
import MeasurementSettingPopup from './MeasurementSettingPopup.vue';

import imageArrow from './img/arrow.png';
import imageRounded from './img/rounded.png';

const path = {
  distance: mdiRuler,
  area: mdiRulerSquareCompass,
  azimuth: mdiTableHeadersEye,
  angle: mdiAngleAcute,
  radius: mdiRadiusOutline,
  point: mdiMapMarkerOutline,
  clear: mdiDeleteOutline,
  close: mdiClose,
  setting: mdiCogOutline,
  fillBound: mdiCrosshairsGps,
};

interface Props extends WithMapPropType {
  actions?: MeasureActionItem[];
}

const props = withDefaults(defineProps<Props>(), {
  ...defaultMapProps,
  actions: () => [],
});

const ui = reactive<MeasurementUiState>({
  measurementType: undefined,
  coordinates: [],
  setting: { show: true, fields: [], maxLength: 0 },
});

const { callMap, mapId, moduleContainerProps, order } = useMap(
  props,
  onInit,
  onDestroy,
);

const crsHandle = useMapCrsItems(mapId.value);
const displayCrsHandle = useMapCrsDisplayEpsgs(mapId.value);
const imageHandle = useMapImage(mapId.value);
const { trans, registerLocale } = useLang(mapId.value);
registerLocale('en', MEASUREMENT_CONTROL_LOCALE);

function getMeasurePointCrsItems() {
  return resolveCrsDisplayItems(
    displayCrsHandle.displayEpsgs.value,
    buildMapCrsCatalog(crsHandle.items.value),
  );
}

const event = new EventClick().setHandler(onMapClick);
const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  event,
);

const session = createMeasurementSession({
  callMap,
  getMeasurePointCrsItems,
  translate: (key, params) => trans.value(key, params),
  scheduleRestart: (fn) => {
    void nextTick(fn);
  },
  onEventClickActive: (active) => {
    if (active) addEventClick();
    else removeEventClick();
  },
  onStateChange: (next) => {
    ui.measurementType = next.measurementType;
    ui.coordinates = next.coordinates;
    ui.setting.show = next.setting.show;
    ui.setting.maxLength = next.setting.maxLength;
    ui.setting.fields = next.setting.fields;
  },
});

const settingShow = computed({
  get: () => ui.setting.show,
  set: (v: boolean) => session.setSettingShow(v),
});

const handler = session.getHandler();

function startMode(type: MeasurementModeType) {
  session.startMode(type);
}

const button_show: MeasureActionItem[] = [
  {
    index: 1,
    type: 'distance',
    title: 'map.measurement.tools.distance',
    icon: path.distance,
    handle: () => startMode('distance'),
    isActive: () => ui.measurementType === 'distance',
  },
  {
    index: 2,
    type: 'area',
    title: 'map.measurement.tools.area',
    icon: path.area,
    handle: () => startMode('area'),
    isActive: () => ui.measurementType === 'area',
  },
  {
    index: 3,
    type: 'azimuth',
    title: 'map.measurement.tools.azimuth',
    icon: path.azimuth,
    handle: () => startMode('azimuth'),
    isActive: () => ui.measurementType === 'azimuth',
  },
  {
    index: 4,
    type: 'angle',
    title: 'map.measurement.tools.angle',
    icon: path.angle,
    handle: () => startMode('angle'),
    isActive: () => ui.measurementType === 'angle',
  },
  {
    index: 5,
    type: 'radius',
    title: 'map.measurement.tools.radius',
    icon: path.radius,
    handle: () => startMode('radius'),
    isActive: () => ui.measurementType === 'radius',
  },
  {
    index: 6,
    type: 'point',
    title: 'map.measurement.tools.point',
    icon: path.point,
    handle: () => startMode('point'),
    isActive: () => ui.measurementType === 'point',
  },
];

const button_handle: MeasureActionItem[] = [
  {
    index: 1,
    type: 'setting',
    title: 'map.measurement.action.setting',
    icon: path.setting,
    handle: () => session.toggleSetting(),
    isActive: () => ui.setting.show,
    show: ({ status }) => status === 'handle',
  },
  {
    index: 2,
    type: 'fly-to',
    title: 'map.measurement.action.fly-to',
    icon: path.fillBound,
    handle: () => session.flyTo(),
    disabled: ({ coordinates }) => !coordinates || coordinates.length < 1,
    show: ({ status }) => status === 'handle',
  },
  {
    index: 3,
    type: 'clear',
    title: 'map.measurement.action.clear',
    icon: path.clear,
    handle: () => session.reset(),
    show: ({ status }) => status === 'handle',
  },
  {
    index: 4,
    type: 'close',
    title: 'map.measurement.action.close',
    icon: path.close,
    handle: () => session.clear(),
    show: ({ status }) => status === 'handle',
  },
];

function toToolbarButton(action: MeasureActionItem): ToolbarButtonConfig {
  return {
    id: action.type,
    order: action.index,
    getState() {
      const status = resolveMeasurementToolbarStatus(ui.measurementType);
      const visible = action.show
        ? action.show({
            handler,
            measurementType: ui.measurementType,
            status,
          })
        : status === 'select';

      return mdiButtonState(action.icon, {
        visible,
        active: action.isActive?.() ?? false,
        disabled: action.disabled
          ? action.disabled({ coordinates: ui.coordinates })
          : false,
        title: trans.value(action.title),
      });
    },
    async onClick() {
      logHelper(logger, mapId.value, 'control', 'MeasurementControl').debug(
        'callAction',
        action,
      );
      action.handle({
        handler,
        measurementType: ui.measurementType,
        coordinates: ui.coordinates,
        clear: () => session.clear(),
        reset: (...args) => session.reset(...args),
        onFlyTo: () => session.flyTo(),
      });
      control.sync();
    },
  };
}

const { state, control } = useToolbarControl(mapId.value, props, {
  moduleId: 'mapMeasurementControl',
  kind: 'module',
  order: order.value,
  orientation: 'row',
  buttons: [...button_show, ...button_handle, ...(props.actions || [])].map(
    toToolbarButton,
  ),
});

useRegisterMapControl(mapId, {
  id: 'mapMeasurementControl',
  panelKind: 'button',
  buttonPosition: () => props.position,
  defaultActionType: 'distance',
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: () =>
    [...button_show, ...button_handle, ...(props.actions || [])].map(
      (action) => ({
        type: action.type,
        run: (e) => control.onAction(action.type, e as MouseEvent),
      }),
    ),
});

watch(
  [() => ui.measurementType, () => ui.coordinates, () => ui.setting.show],
  () => control.sync(),
  { deep: true },
);

watch(
  [() => crsHandle.items.value, () => displayCrsHandle.displayEpsgs.value],
  () => session.refreshPointCrs(),
);

function onInit(map: MapSimple) {
  imageHandle.addImage(map.id!, MEASUREMENT_MAP_VIEW_IMAGE.azimuthArrow, imageArrow, {
    sdf: true,
  });
  imageHandle.addImage(map.id!, MEASUREMENT_MAP_VIEW_IMAGE.round, imageRounded, {
    content: [4, 4, 12, 12],
    stretchX: [[6, 10]],
    stretchY: [[6, 10]],
  });
  session.attachToMap(map);
  logHelper(logger, mapId.value, 'control', 'MeasurementControl').debug(
    'init',
    handler,
  );
}

function onDestroy() {
  session.destroy();
}

function onMapClick(event: MapMouseEvent) {
  logHelper(logger, mapId.value, 'control', 'MeasurementControl').debug(
    'onMapClick',
    event,
  );
  session.addMapClick(event.lngLat.lng ?? 0, event.lngLat.lat ?? 0);
}
</script>
