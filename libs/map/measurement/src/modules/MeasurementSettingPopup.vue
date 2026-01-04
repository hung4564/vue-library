<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="props">
      <DraggableItemPopup
        v-bind="Object.assign(props, popUpPosition)"
        v-if="c_show"
        v-model:show="c_show"
        :title="trans('map.measurement.setting.title')"
      >
        <div class="setting-container">
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
import { CoordinatesNumber, fitBounds } from '@hungpvq/shared-map';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  defaultMapProps,
  ModuleContainer,
  useLang,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import FieldGeometry from './setting/field-geometry.vue';
import MeasurementSettingFields from './setting/fields-show.vue';
import { IViewSettingField } from './types';
const emit = defineEmits(['update:modelValue']);
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      modelValue?: (CoordinatesNumber | [null, null])[];
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
const model = defineModel<(CoordinatesNumber | [null, null])[]>({
  default: [[0, 0]],
});
const c_show = defineModel('show', { default: false });
const onFlyTo = (geometry: Geometry | Feature | FeatureCollection) => {
  callMap((map) => {
    fitBounds(map, geometry);
  });
};
function setValue(value: (CoordinatesNumber | [null, null])[]) {
  emit('update:modelValue', value);
}
</script>
<style scoped>
.setting-container {
  padding: 8px;
}
.field-container {
  padding: 12px;
}
</style>
