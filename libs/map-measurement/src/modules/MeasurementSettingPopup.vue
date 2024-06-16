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

<script setup>
import { DraggableItemPopup } from '@hungpv97/vue-draggable';
import {
  ModuleContainer,
  fitBounds,
  useLang,
  useMap,
  withMapProps,
} from '@hungpv97/vue-map-core';
import FieldGeometry from './setting/field-geometry.vue';
import MeasurementSettingFields from './setting/fields-show.vue';
const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  ...withMapProps,
  modelValue: Array,
  maxLength: { type: Number, default: 0 },
  fields: {
    type: Array,
    default: () => [{ text: 'Status', value: 'waiting...' }],
  },
  popUpPosition: {
    type: Object,
    default: () => ({
      top: 50,
      right: 40,
      width: 350,
      height: 300,
    }),
  },
});
const { callMap, moduleContainerProps, mapId } = useMap(props);
const { trans } = useLang(mapId.value);
const model = defineModel({ default: [[0, 0]] });
const c_show = defineModel('show', { default: false });
const onFlyTo = (geometry) => {
  callMap((map) => {
    fitBounds(map, geometry);
  });
};
function setValue(value) {
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
