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
import { fitBounds } from '@hungpvq/shared-map';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  defaultMapProps,
  ModuleContainer,
  useLang,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import FieldGeometry from './setting/field-geometry.vue';
import MeasurementSettingFields from './setting/fields-show.vue';
import { IViewSettingField } from './types';
const emit = defineEmits(['update:modelValue']);
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      modelValue?: [number, number][]; // hoặc cụ thể hơn nếu bạn có kiểu
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
const model = defineModel({ default: [[0, 0]] });
const c_show = defineModel('show', { default: false });
const onFlyTo = (geometry: any) => {
  callMap((map) => {
    fitBounds(map, geometry);
  });
};
function setValue(value: { value: [number, number][] }) {
  emit('update:modelValue', value.value);
}
</script>
<style scoped>
.setting-container {
  padding: 8px;
  color: #fff;
}
.field-container {
  padding: 12px;
}
</style>
