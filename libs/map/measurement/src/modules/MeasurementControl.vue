<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton row v-if="!measurement_type">
        <MapControlButton
          v-for="action in cButtonShowAction"
          :key="action.type"
          :tooltip="trans(action.title)"
          @click="callAction(action)"
          :active="action.isActive ? action.isActive() : false"
          :disabled="action.disabled ? action.disabled({ coordinates }) : false"
        >
          <SvgIcon :size="18" type="mdi" :path="action.icon" />
        </MapControlButton>
      </MapControlGroupButton>

      <MapControlGroupButton v-else row>
        <MapControlButton
          v-for="action in cButtonHandleAction"
          :key="action.title"
          :tooltip="trans(action.title)"
          :active="action.isActive ? action.isActive() : false"
          :disabled="action.disabled ? action.disabled({ coordinates }) : false"
          @click="callAction(action)"
        >
          <SvgIcon :size="18" type="mdi" :path="action.icon" />
        </MapControlButton>
      </MapControlGroupButton>
    </template>

    <slot />
    <MeasurementSettingPopup
      :modelValue="coordinates"
      v-if="measurement_type"
      v-model:show="setting.show"
      :position="position"
      @update:modelValue="setValue"
      :maxLength="setting.maxLength"
      :fields="setting.fields"
    />
  </ModuleContainer>
</template>
<script lang="ts">
export default {
  name: 'measurement-control',
};
</script>
<script lang="ts" setup>
import {
  CoordinatesNumber,
  MapSimple,
  convertGeometry,
  fitBounds,
  logHelper,
} from '@hungpvq/shared-map';
import {
  EventClick,
  MapControlButton,
  MapControlGroupButton,
  ModuleContainer,
  WithMapPropType,
  defaultMapProps,
  useEventMap,
  useLang,
  useMap,
  useMapCrsItems,
  useMapImage,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiClose,
  mdiCogOutline,
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiMapMarkerOutline,
  mdiPlus,
  mdiRuler,
  mdiRulerSquareCompass,
  mdiTableHeadersEye,
} from '@mdi/js';
import { MapMouseEvent } from 'maplibre-gl';
import { computed, nextTick, ref } from 'vue';
import { logger } from '../logger';
import { MeasureActionItem } from '../types';
import MeasurementSettingPopup from './MeasurementSettingPopup.vue';
import {
  MapMarkerView,
  MapView,
  MeasureArea,
  MeasureAzimuth,
  MeasureDistance,
  MeasurePoint,
  MeasurementHandle,
} from './helper';
import { FormView } from './helper/_viewForm';
import imageArrow from './img/arrow.png';
import imageRounded from './img/rounded.png';
import { IViewSettingField } from './types';
let handler = MeasurementHandle();
const DEFAULT_COLOR_HIGHLIGHT = '#004E98';
interface Props extends WithMapPropType {
  actions?: MeasureActionItem[];
}

const path = {
  add: mdiPlus,
  fillBound: mdiCrosshairsGps,
  distance: mdiRuler,
  area: mdiRulerSquareCompass,
  azimuth: mdiTableHeadersEye,
  point: mdiMapMarkerOutline,
  clear: mdiDeleteOutline,
  close: mdiClose,
  setting: mdiCogOutline,
};

const button_show: MeasureActionItem[] = [
  {
    index: 1,
    title: 'map.measurement.tools.distance',
    handle: () => onMeasureDistance(),
    icon: path.distance,
    type: 'distance',
    isActive: () => measurement_type.value === 'distance',
  },
  {
    index: 2,
    title: 'map.measurement.tools.area',
    handle: () => onMeasureArea(),
    icon: path.area,
    type: 'area',
    isActive: () => measurement_type.value === 'area',
  },
  {
    index: 3,
    title: 'map.measurement.tools.azimuth',
    handle: () => onMeasureAzimuth(),
    icon: path.azimuth,
    type: 'azimuth',
    isActive: () => measurement_type.value === 'azimuth',
  },
  {
    index: 4,
    title: 'map.measurement.tools.point',
    handle: () => onMeasureMarker(),
    icon: path.point,
    type: 'point',
    isActive: () => measurement_type.value === 'point',
  },
];
const button_handle: MeasureActionItem[] = [
  {
    index: 1,
    title: 'map.measurement.action.setting',
    handle: () => toggleSetting(),
    icon: path.setting,
    type: 'setting',
    isActive: () => setting.value.show,
  },
  {
    index: 2,
    title: 'map.measurement.action.fly-to',
    handle: () => onFlyTo(),
    icon: path.fillBound,
    disabled: (ctx: { coordinates?: CoordinatesNumber[] }) =>
      !ctx.coordinates || ctx.coordinates.length < 1,
    type: 'fly-to',
  },
  {
    index: 3,
    title: 'map.measurement.action.clear',
    handle: () => reset(),
    icon: path.clear,
    type: 'clear',
  },
  {
    index: 4,
    title: 'map.measurement.action.close',
    handle: () => clear(),
    icon: path.close,
    type: 'close',
  },
];
const props = withDefaults(defineProps<Props>(), {
  ...defaultMapProps,
  actions: () => [],
});
function callAction(action: MeasureActionItem) {
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
}
const cButtonShowAction = computed<MeasureActionItem[]>(() => {
  return [
    ...button_show,
    ...(props.actions || []).filter((x) => {
      return (
        !x.show ||
        x.show({
          handler,
          measurementType: measurement_type.value,
          status: 'select',
        })
      );
    }),
  ].sort((a, b) => {
    return (a.index || 0) - (b.index || 0);
  });
});
const cButtonHandleAction = computed<MeasureActionItem[]>(() => {
  return [
    ...button_handle,
    ...(props.actions || []).filter((x) => {
      return (
        !x.show ||
        x.show({
          handler,
          measurementType: measurement_type.value,
          status: 'handle',
        })
      );
    }),
  ].sort((a, b) => {
    return (a.index || 0) - (b.index || 0);
  });
});
const measurement_type = ref<string | undefined>('');
const coordinates = ref<CoordinatesNumber[]>([]);
const setting = ref<{
  show: boolean;
  fields: IViewSettingField[];
  maxLength?: number;
}>({ show: true, maxLength: 0, fields: [] });
const { callMap, mapId, moduleContainerProps } = useMap(
  props,
  onInit,
  onDestroy,
);
const crsHandle = useMapCrsItems(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
const imageHandle = useMapImage(mapId.value);
setLocaleDefault({
  map: {
    measurement: {
      action: {
        clear: 'Clear',
        close: 'Close',
        setting: 'Setting',
        download: 'Download',
        'add-point': 'Add point',
        'fly-to': 'Fill bound',
        add: 'Add',
      },
      title: 'Measurement',
      result: 'Measurement Result',
      field: {
        'unit-distance': 'Unit distance',
        'unit-area': 'Unit area',
      },
      tools: {
        point: 'Measure Point',
        distance: 'Measure Distance',
        area: 'Measure Area',
        azimuth: 'Measure azimuth',
      },
      unit: {
        meter: 'Meter',
        kilometer: 'Kilometer',
        'square-meter': 'Square Meter',
        hecta: 'Hecta',
        'square-kilometer': 'Square Kilometer',
      },
      setting: {
        title: 'Setting',
        field: {
          data: 'Data',
        },
        point: 'Point',
        distance: 'Distance',
        area: 'Area',
        azimuth: 'Azimuthị',
      },
      'no-data': {
        text: 'Status',
        value: 'Waiting...',
      },
    },
  },
});
const event = new EventClick().setHandler(onMapClick);

const { add: addEventClick, remove: removeEventClick } = useEventMap(
  mapId.value,
  event,
);
function onInit(map: MapSimple) {
  handler.setMapId(map.id!);
  imageHandle.addImage(map.id!, 'azimuth-arrow', imageArrow, { sdf: true });
  imageHandle.addImage(map.id!, 'measurment-round', imageRounded, {
    content: [4, 4, 12, 12],
    stretchX: [[6, 10]],
    stretchY: [[6, 10]],
  });

  let mapView = new MapView(map);
  mapView.init(
    [
      {
        type: 'line', // For outline
        paint: {
          'line-color': DEFAULT_COLOR_HIGHLIGHT,
          'line-width': 2,
        },
      },
      {
        type: 'fill', // For outline
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': DEFAULT_COLOR_HIGHLIGHT,
          'fill-opacity': 0.3,
        },
      },

      {
        type: 'symbol',
        filter: ['has', 'rotation'],
        paint: { 'icon-color': DEFAULT_COLOR_HIGHLIGHT },
        layout: {
          'icon-size': 1.2,
          'icon-rotate': {
            type: 'identity',
            property: 'rotation',
          },
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          // 'icon-ignore-placement': true,
          'icon-image': 'azimuth-arrow',
          visibility: 'visible',
        },
      },
      // {
      //   type: 'circle',
      //   filter: ['==', '$type', 'Point'],
      //   paint: {
      //     'circle-radius': 4,
      //     'circle-color': vm.color,
      //     'circle-stroke-color': 'black',
      //     'circle-stroke-width': 0.5,
      //   },
      // },
      {
        type: 'symbol',
        filter: ['all', ['has', 'is_label'], ['==', '$type', 'Point']],
        layout: {
          'text-field': '{text}',
          'text-offset': [
            'case',
            ['to-boolean', ['get', 'is_center']],
            ['literal', [0, 0]],
            ['literal', [0, 2]],
          ],
          'text-size': 14,
          'text-allow-overlap': true,
          'icon-allow-overlap': true,
          'icon-image': 'measurment-round',
          'icon-text-fit': 'both',
        },
        paint: {
          'text-color': '#fff',
          'text-halo-color': DEFAULT_COLOR_HIGHLIGHT,
          'text-halo-width': 2,
        },
      },
    ],
    {
      data: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      },
    },
  );
  mapView.onStart = () => {
    if (!map) {
      return;
    }
    addEventClick();
  };
  mapView.onReset = () => {
    removeEventClick();
  };
  let markerView = new MapMarkerView(map);
  markerView.setColor(DEFAULT_COLOR_HIGHLIGHT);
  markerView.onDragMarker = (p_coordinates) => {
    handler.init(p_coordinates);
  };

  markerView.onRightClickMarker = (p_coordinate, index) => {
    coordinates.value.splice(index, 1);
    handler.init(coordinates.value);
  };

  let formView = new FormView();
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
      text: x.trans ? trans.value(x.trans) : x.text,
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
  if (handler) {
    handler.destroy();
  }
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
function checkMeasureRun(type: string) {
  reset(false);
  if (measurement_type.value == type) {
    measurement_type.value = undefined;
    handler.setAction(null);
    return false;
  }
  measurement_type.value = type;
  return true;
}
function onMeasureDistance() {
  if (!checkMeasureRun('distance')) return;
  logHelper(logger, mapId.value, 'control', 'MeasurementControl').debug(
    'setAction',
    'distance',
  );
  handler.setAction(new MeasureDistance());
  handler.start();
}
function onMeasureArea() {
  if (!checkMeasureRun('area')) return;
  logHelper(logger, mapId.value, 'control', 'MeasurementControl').debug(
    'setAction',
    'area',
  );
  handler.setAction(new MeasureArea());
  handler.start();
}
function onMeasureAzimuth() {
  if (!checkMeasureRun('azimuth')) return;
  logHelper(logger, mapId.value, 'control', 'MeasurementControl').debug(
    'setAction',
    'azimuth',
  );
  handler.setAction(new MeasureAzimuth());
  handler.start();
}
function onMeasureMarker() {
  if (!checkMeasureRun('point')) return;
  logHelper(logger, mapId.value, 'control', 'MeasurementControl').debug(
    'setAction',
    'point',
  );
  handler.setAction(new MeasurePoint(crsHandle.items.value));
  handler.start();
}
function toggleSetting() {
  setting.value.show = !setting.value.show;
}
function onFlyTo() {
  callMap((map) => {
    if (!coordinates.value) {
      return;
    }
    const geometry = convertGeometry(coordinates.value);
    if (!geometry) {
      return;
    }
    fitBounds(map, geometry);
  });
}
function reset(restart = true) {
  if (handler) {
    handler.reset();
    if (restart)
      nextTick(() => {
        handler.start();
      });
  }
}
function clear() {
  reset(false);
  measurement_type.value = undefined;
  if (handler) handler.setAction(null);
}
function setValue(coordinates = []) {
  if (handler) handler.init(coordinates);
}
</script>
<style lang=""></style>
