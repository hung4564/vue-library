<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="props">
      <DraggableItemPopup
        v-bind="Object.assign(props, popUpPosition)"
        v-if="c_show"
        v-model:show="c_show"
        :title="trans('map.measurement.setting.title')"
      >
        <div class="map-measurement-setting">
          <MeasurementSettingFields :fields="fields" />
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
import FieldGeometry from './setting/field-geometry.vue';
import MeasurementSettingFields from './setting/fields-show.vue';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      maxLength?: number;
      fields?: IViewSettingField[];
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
const onFlyTo = (geometry: Geometry | Feature | FeatureCollection) => {
  callMap((map) => {
    fitBounds(map, geometry);
  });
};
function setValue(value: DraftCoordinatesNumber[]) {
  model.value = toCoordinatesNumberList(value);
}
</script>
