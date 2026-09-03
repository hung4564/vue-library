<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="slotProps">
      <DraggableItemPopup
        v-bind="{ ...slotProps, ...popUpPosition, ...panelBind }"
        v-if="c_show"
        v-model:show="c_show"
        :title="trans('map.measurement.setting.title')"
      >
        <div class="map-measurement-setting">
          <MeasurementSettingFields :fields="fields" />
          <CrsDisplaySettings v-if="measurementType === 'point'" />
          <FieldGeometry
            @update:modelValue="setValue"
            :modelValue="model"
            :maxLength="maxLength"
            @click:fillbound="onFlyTo"
            :title="trans('map.measurement.setting.field.data')"
            :titleActionDownload="trans('map.measurement.action.download')"
            :titleActionFillBound="trans('map.measurement.action.fly-to')"
            :titleActionAddPoint="trans('map.measurement.action.add-point')"
          />
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>

<script setup lang="ts">
import {
  type CoordinatesNumber,
  type DraftCoordinatesNumber,
  fitBounds,
  IViewSettingField,
  toCoordinatesNumberList,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules';
import { useLang } from '../../lang';
import { useRegisterMapControl } from '../../registry';
import FieldGeometry from './setting/field-geometry.vue';
import MeasurementSettingFields from './setting/fields-show.vue';
import { CrsDisplaySettings } from '../../crs';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      maxLength?: number;
      fields?: IViewSettingField[];
      measurementType?: string;
      popUpPosition?: {
        top: number;
        right: number;
        width: number;
        height: number;
      };
    }
  >(),
  {
    ...defaultMapProps,
    maxLength: 0,
    fields: () => [{ text: 'Status', value: 'waiting...' }],
    popUpPosition: () => ({
      top: 50,
      right: 40,
      width: 350,
      height: 300,
    }),
  },
);
const { callMap, moduleContainerProps, mapId } = useMap(props);
const { trans } = useLang(mapId.value);
const model = defineModel<CoordinatesNumber[]>({
  default: () => [],
});
const c_show = defineModel('show', { default: false });
const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapMeasurementSetting',
  panelKind: 'popup',
  title: () => trans.value('map.measurement.setting.title'),
  buttonPosition: () => props.position,
  show: c_show,
  setShow: (value) => {
    c_show.value = value;
  },
  initialPanelPosition: {
    top: props.popUpPosition.top,
    right: props.popUpPosition.right,
  },
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
    maxLength: props.maxLength,
    measurementType: props.measurementType,
  }),
  actions: [
    {
      type: 'mapMeasurementSetting',
      run: () => {
        c_show.value = !c_show.value;
      },
    },
  ],
});
const onFlyTo = (geometry: Geometry | Feature | FeatureCollection) => {
  callMap((map) => {
    fitBounds(map, geometry);
  });
};
function setValue(value: DraftCoordinatesNumber[]) {
  model.value = toCoordinatesNumberList(value);
}
</script>
