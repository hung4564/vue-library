<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton row>
        <template v-for="(btn, id) in state">
          <MapCommonButton
            :key="id"
            v-if="btn?.visible"
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
      @update:modelValue="setValue"
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
  convertGeometry,
  fitBounds,
  logHelper,
} from '@hungpvq/shared-map';

import {
  EventClick,
  MapCommonButton,
  MapControlGroupButton,
  ModuleContainer,
  ToolbarButtonConfig,
  WithMapPropType,
  defaultMapProps,
  useEventMap,
  useLang,
  useMap,
  useMapCrsItems,
  useMapImage,
  useToolbarControl,
} from '@hungpvq/vue-map-core';

import {
  mdiClose,
  mdiCogOutline,
  mdiCrosshairsGps,
  mdiDeleteOutline,
  mdiMapMarkerOutline,
  mdiRuler,
  mdiRulerSquareCompass,
  mdiTableHeadersEye,
} from '@mdi/js';

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

const DEFAULT_COLOR_HIGHLIGHT = '#004E98';

const path = {
  distance: mdiRuler,
  area: mdiRulerSquareCompass,
  azimuth: mdiTableHeadersEye,
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

const { callMap, mapId, moduleContainerProps } = useMap(
  props,
  onInit,
  onDestroy,
);

const crsHandle = useMapCrsItems(mapId.value);
const imageHandle = useMapImage(mapId.value);

const { trans, setLocaleDefault } = useLang(mapId.value);

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
      const status: 'select' | 'handle' = measurement_type.value
        ? 'handle'
        : 'select';
      const visible = action.show
        ? action.show({
            handler,
            measurementType: measurement_type.value,
            status,
          })
        : status === 'select';

      return {
        visible,

        active: action.isActive?.() ?? false,

        disabled: action.disabled
          ? action.disabled({ coordinates: coordinates.value })
          : false,

        title: trans.value(action.title),

        icon: {
          type: 'mdi',
          path: action.icon,
        },
      };
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
  moduleOrder: 1,
  buttons: [...button_show, ...button_handle, ...(props.actions || [])].map(
    toToolbarButton,
  ),
});

watch([measurement_type, coordinates], () => control.sync(), { deep: true });

function checkMeasureRun(type: string) {
  reset(false);
  if (measurement_type.value === type) {
    measurement_type.value = undefined;
    handler.setAction(null);
    return false;
  }
  measurement_type.value = type;
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

function onMeasureMarker() {
  if (!checkMeasureRun('point')) return;
  handler.setAction(new MeasurePoint(crsHandle.items.value));
  handler.start();
}

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
