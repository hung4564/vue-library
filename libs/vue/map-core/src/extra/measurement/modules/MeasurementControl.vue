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
      v-if="measurement_type"
      v-model:show="setting.show"
      :modelValue="coordinates"
      :position="position"
      :maxLength="setting.maxLength"
      :fields="setting.fields"
      :measurementType="measurement_type"
      @update:modelValue="setValue"
      @refresh="handler.init(coordinates)"
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
import { nextTick, ref, watch } from 'vue';

import {
  CoordinatesNumber,
  MapSimple,
  WithMapPropType,
  convertGeometry,
  fitBounds,
  logHelper,
} from '@hungpvq/map-core';
import {
  buildMapCrsCatalog,
  resolveCrsDisplayItems,
} from '@hungpvq/map-core/crs';
import { EventClick } from '@hungpvq/map-core/event';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  FormView,
  MEASUREMENT_CONTROL_LOCALE,
  MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR,
  MEASUREMENT_MAP_VIEW_IMAGE,
  MapMarkerView,
  MeasureAngle,
  MeasureArea,
  MeasureAzimuth,
  MeasureDistance,
  MeasurePoint,
  MeasureRadius,
  MeasurementHandle,
  createMeasurementMapView,
  resolveMeasurementModeToggle,
  resolveMeasurementToolbarStatus,
  type IViewSettingField,
  type MeasureActionItem,
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

const measurement_type = ref<string | undefined>();
const coordinates = ref<CoordinatesNumber[]>([]);
const setting = ref<{
  show: boolean;
  fields: IViewSettingField[];
  maxLength?: number;
}>({
  show: true,
  fields: [],
  maxLength: 0,
});

const handler = MeasurementHandle();

const { callMap, mapId, moduleContainerProps, order } = useMap(
  props,
  onInit,
  onDestroy,
);

const crsHandle = useMapCrsItems(mapId.value);
const displayCrsHandle = useMapCrsDisplayEpsgs(mapId.value);

function getMeasurePointCrsItems() {
  return resolveCrsDisplayItems(
    displayCrsHandle.displayEpsgs.value,
    buildMapCrsCatalog(crsHandle.items.value),
  );
}
const imageHandle = useMapImage(mapId.value);

const { trans, registerLocale } = useLang(mapId.value);

registerLocale('en', MEASUREMENT_CONTROL_LOCALE);

const button_show: MeasureActionItem[] = [
  {
    index: 1,
    type: 'distance',
    title: 'map.measurement.tools.distance',
    icon: path.distance,
    handle: () => onMeasureDistance(),
    isActive: () => measurement_type.value === 'distance',
  },
  {
    index: 2,
    type: 'area',
    title: 'map.measurement.tools.area',
    icon: path.area,
    handle: () => onMeasureArea(),
    isActive: () => measurement_type.value === 'area',
  },
  {
    index: 3,
    type: 'azimuth',
    title: 'map.measurement.tools.azimuth',
    icon: path.azimuth,
    handle: () => onMeasureAzimuth(),
    isActive: () => measurement_type.value === 'azimuth',
  },
  {
    index: 4,
    type: 'angle',
    title: 'map.measurement.tools.angle',
    icon: path.angle,
    handle: () => onMeasureAngle(),
    isActive: () => measurement_type.value === 'angle',
  },
  {
    index: 5,
    type: 'radius',
    title: 'map.measurement.tools.radius',
    icon: path.radius,
    handle: () => onMeasureRadius(),
    isActive: () => measurement_type.value === 'radius',
  },
  {
    index: 6,
    type: 'point',
    title: 'map.measurement.tools.point',
    icon: path.point,
    handle: () => onMeasureMarker(),
    isActive: () => measurement_type.value === 'point',
  },
];

const button_handle: MeasureActionItem[] = [
  {
    index: 1,
    type: 'setting',
    title: 'map.measurement.action.setting',
    icon: path.setting,
    handle: () => toggleSetting(),
    isActive: () => setting.value.show,
    show: ({ status }) => status === 'handle',
  },
  {
    index: 2,
    type: 'fly-to',
    title: 'map.measurement.action.fly-to',
    icon: path.fillBound,
    handle: () => onFlyTo(),
    disabled: ({ coordinates }) => !coordinates || coordinates.length < 1,
    show: ({ status }) => status === 'handle',
  },
  {
    index: 3,
    type: 'clear',
    title: 'map.measurement.action.clear',
    icon: path.clear,
    handle: () => reset(),
    show: ({ status }) => status === 'handle',
  },
  {
    index: 4,
    type: 'close',
    title: 'map.measurement.action.close',
    icon: path.close,
    handle: () => clear(),
    show: ({ status }) => status === 'handle',
  },
];

function toToolbarButton(action: MeasureActionItem): ToolbarButtonConfig {
  return {
    id: action.type,
    order: action.index,

    getState() {
      const status = resolveMeasurementToolbarStatus(measurement_type.value);
      const visible = action.show
        ? action.show({
            handler,
            measurementType: measurement_type.value,
            status,
          })
        : status === 'select';

      return mdiButtonState(action.icon, {
        visible,
        active: action.isActive?.() ?? false,
        disabled: action.disabled
          ? action.disabled({ coordinates: coordinates.value })
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
        measurementType: measurement_type.value,
        coordinates: coordinates.value,
        clear,
        reset,
        onFlyTo,
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

watch([measurement_type, coordinates, () => setting.value.show], () => control.sync(), {
  deep: true,
});

function checkMeasureRun(type: string) {
  reset(false);
  const toggle = resolveMeasurementModeToggle(measurement_type.value, type);
  if (!toggle.start) {
    measurement_type.value = undefined;
    handler.setAction(null);
    return false;
  }
  measurement_type.value = toggle.nextType;
  setting.value.show = true;
  return true;
}

function onMeasureDistance() {
  if (!checkMeasureRun('distance')) return;
  handler.setAction(new MeasureDistance());
  handler.start();
}

function onMeasureArea() {
  if (!checkMeasureRun('area')) return;
  handler.setAction(new MeasureArea());
  handler.start();
}

function onMeasureAzimuth() {
  if (!checkMeasureRun('azimuth')) return;
  handler.setAction(new MeasureAzimuth());
  handler.start();
}

function onMeasureAngle() {
  if (!checkMeasureRun('angle')) return;
  handler.setAction(new MeasureAngle());
  handler.start();
}

function onMeasureRadius() {
  if (!checkMeasureRun('radius')) return;
  handler.setAction(new MeasureRadius());
  handler.start();
}

function onMeasureMarker() {
  if (!checkMeasureRun('point')) return;
  handler.setAction(new MeasurePoint(() => getMeasurePointCrsItems()));
  handler.start();
}

watch(
  [() => crsHandle.items.value, () => displayCrsHandle.displayEpsgs.value],
  () => {
    if (measurement_type.value !== 'point') return;
    const action = handler.action;
    if (action instanceof MeasurePoint) {
      action.setCrsItems(getMeasurePointCrsItems());
      if (coordinates.value.length) handler.init(coordinates.value);
    }
  },
);

function toggleSetting() {
  setting.value.show = !setting.value.show;
}

function onFlyTo() {
  callMap((map) => {
    const geometry = convertGeometry(coordinates.value);
    if (geometry) fitBounds(map, geometry);
  });
}

function reset(restart = true) {
  handler.reset();
  if (restart) nextTick(() => handler.start());
}

function clear() {
  reset(false);
  measurement_type.value = undefined;
  handler.setAction(null);
}

function setValue(coords: CoordinatesNumber[] = []) {
  handler.init(coords);
}

const event = new EventClick().setHandler(onMapClick);
const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  event,
);

function onInit(map: MapSimple) {
  handler.setMapId(map.id!);
  imageHandle.addImage(map.id!, MEASUREMENT_MAP_VIEW_IMAGE.azimuthArrow, imageArrow, {
    sdf: true,
  });
  imageHandle.addImage(map.id!, MEASUREMENT_MAP_VIEW_IMAGE.round, imageRounded, {
    content: [4, 4, 12, 12],
    stretchX: [[6, 10]],
    stretchY: [[6, 10]],
  });

  const mapView = createMeasurementMapView(map);
  mapView.onStart = () => {
    if (!map) {
      return;
    }
    addEventClick();
  };
  mapView.onReset = () => {
    removeEventClick();
  };
  const markerView = new MapMarkerView(map);
  markerView.setColor(MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR);
  markerView.onDragMarker = (p_coordinates) => {
    handler.init(p_coordinates);
  };

  markerView.onRightClickMarker = (p_coordinate, index) => {
    coordinates.value.splice(index, 1);
    handler.init(coordinates.value);
  };

  const formView = new FormView();
  formView.onChangeValue = (value_coordinates) => {
    coordinates.value = (value_coordinates || []).slice();
  };
  formView.onChangeSetting = (_setting = {}) => {
    setting.value.maxLength = _setting.maxLength || 0;
    let fields = _setting.fields;
    if (!fields || fields.length == 0) {
      fields = [
        {
          text: trans.value('map.measurement.no-data.text'),
          value: trans.value('map.measurement.no-data.value'),
        },
      ];
    }
    setting.value.fields = fields.map((x) => ({
      ...x,
      text: x.trans ? trans.value(x.trans, x.params) : x.text,
    }));
  };
  handler.addView(mapView);
  handler.addView(markerView);
  handler.addView(formView);

  logHelper(logger, mapId.value, 'control', 'MeasurementControl').debug(
    'init',
    handler,
  );
}

function onDestroy() {
  handler?.destroy();
  clear();
}
function onMapClick(event: MapMouseEvent) {
  logHelper(logger, mapId.value, 'control', 'MeasurementControl').debug(
    'onMapClick',
    event,
  );
  const newCoordinate: CoordinatesNumber = [
    event.lngLat.lng!,
    event.lngLat.lat!,
  ];
  if (handler.action) handler.add(newCoordinate);
}
</script>
