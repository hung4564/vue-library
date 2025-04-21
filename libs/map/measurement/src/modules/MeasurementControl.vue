<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton row v-if="!measurement_type">
        <MapControlButton
          :tooltip="trans('map.measurement.tools.distance')"
          @click="onMeasureDistance()"
          :active="measurement_type == 'distance'"
        >
          <SvgIcon :size="18" type="mdi" :path="path.distance" />
        </MapControlButton>
        <MapControlButton
          :tooltip="trans('map.measurement.tools.area')"
          @click="onMeasureArea()"
          :active="measurement_type == 'area'"
        >
          <SvgIcon :size="18" type="mdi" :path="path.area" />
        </MapControlButton>
        <MapControlButton
          :tooltip="trans('map.measurement.tools.azimuth')"
          @click="onMeasureAzimuth()"
          :active="measurement_type == 'azimuth'"
        >
          <SvgIcon :size="18" type="mdi" :path="path.azimuth" />
        </MapControlButton>
        <MapControlButton
          :tooltip="trans('map.measurement.tools.point')"
          @click="onMeasureMarker()"
          :active="measurement_type == 'point'"
        >
          <SvgIcon :size="18" type="mdi" :path="path.point" />
        </MapControlButton>
      </MapControlGroupButton>

      <MapControlGroupButton v-else row>
        <!-- <MapControlButton
          :tooltip="trans('map.measurement.action.add')"
          @click="addToLayerControl()"
          :disabled="!coordinates || coordinates.length < 1"
        >
          <SvgIcon :size="18" type="mdi" :path="path.add" />
        </MapControlButton> -->
        <MapControlButton
          :tooltip="trans('map.measurement.action.setting')"
          @click="toggleSetting()"
          :active="setting.show"
        >
          <SvgIcon :size="18" type="mdi" :path="path.setting" />
        </MapControlButton>
        <MapControlButton
          :disabled="!coordinates || coordinates.length < 1"
          :tooltip="trans('map.measurement.action.fly-to')"
          @click="onFlyTo()"
        >
          <SvgIcon :size="18" type="mdi" :path="path.fillBound" />
        </MapControlButton>
        <MapControlButton
          :tooltip="trans('map.measurement.action.clear')"
          @click="reset()"
        >
          <SvgIcon :size="18" type="mdi" :path="path.clear" />
        </MapControlButton>
        <MapControlButton
          :tooltip="trans('map.measurement.action.close')"
          @click="clear()"
        >
          <SvgIcon :size="18" type="mdi" :path="path.close" />
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
<script lang="ts" setup>
import { CoordinatesNumber, MapSimple } from '@hungpvq/shared-map';
import {
  EventClick,
  MapControlButton,
  MapControlGroupButton,
  ModuleContainer,
  convertGeometry,
  crsStore,
  fitBounds,
  imageStore,
  setEventMap,
  useLang,
  useMap,
  withMapProps,
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
import { MapMouseEvent } from 'mapbox-gl';
import { nextTick, ref } from 'vue';
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
const { getCrsItems } = crsStore;
const { addImage } = imageStore;
let handler = MeasurementHandle();
const DEFAULT_COLOR_HIGHLIGHT = '#004E98';
const props = defineProps({
  ...withMapProps,
});
const measurement_type = ref<string | undefined>('');
const coordinates = ref<CoordinatesNumber[]>([]);
const setting = ref<{
  show: boolean;
  fields?: IViewSettingField[];
  maxLength?: number;
}>({ show: true, maxLength: 0, fields: [] });
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
const { callMap, mapId, moduleContainerProps } = useMap(
  props,
  onInit,
  onDestroy
);
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
const event = new EventClick().setHandler(onMapClick);

function onInit(map: MapSimple) {
  addImage(map.id!, 'azimuth-arrow', imageArrow, { sdf: true });
  addImage(map.id!, 'measurment-round', imageRounded, {
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
    }
  );
  const { add: addEventClick, remove: removeEventClick } = setEventMap(
    map.id,
    event
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
}
function onDestroy() {
  if (handler) {
    handler.destroy();
  }
  clear();
}
function onMapClick(event: MapMouseEvent) {
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
  handler.setAction(new MeasurePoint(getCrsItems(mapId.value)));
  handler.start();
}
function toggleSetting() {
  setting.value.show = !setting.value.show;
}
function onFlyTo() {
  callMap((map) => {
    fitBounds(map, convertGeometry(coordinates.value));
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
