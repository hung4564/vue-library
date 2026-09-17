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
          <FieldPointCrs
            v-if="measurementType === 'point'"
            :fields="fields"
            @change="emit('refresh')"
          />
          <MeasurementSettingFields v-else :fields="fields" />

          <div v-if="showSettingsSection" class="map-measurement-setting__prefs">
            <InputSelect
              v-if="showDistanceUnit"
              :model-value="distanceUnit"
              :label="trans('map.measurement.field.unit-distance')"
              :items="distanceUnitItems"
              @update:model-value="onDistanceUnitChange"
            />
            <InputSelect
              v-if="showAreaUnit"
              :model-value="areaUnit"
              :label="trans('map.measurement.field.unit-area')"
              :items="areaUnitItems"
              @update:model-value="onAreaUnitChange"
            />
            <div
              v-if="
                showVertexLabelToggle ||
                showEdgeLabelToggle ||
                showResultLabelToggle
              "
              class="map-measurement-setting__toggles"
            >
              <InputCheckbox
                v-if="showVertexLabelToggle"
                :label="trans('map.measurement.field.label-vertex')"
                :model-value="labelPrefs.showVertexLabels"
                @update:model-value="
                  onLabelToggle('showVertexLabels', !!$event)
                "
              />
              <InputCheckbox
                v-if="showEdgeLabelToggle"
                :label="trans('map.measurement.field.label-edge')"
                :model-value="labelPrefs.showEdgeLabels"
                @update:model-value="
                  onLabelToggle('showEdgeLabels', !!$event)
                "
              />
              <InputCheckbox
                v-if="showResultLabelToggle"
                :label="trans('map.measurement.field.label-result')"
                :model-value="labelPrefs.showResultLabel"
                @update:model-value="
                  onLabelToggle('showResultLabel', !!$event)
                "
              />
            </div>
            <CrsDisplaySettings
              v-if="measurementType === 'point'"
              compact
              @change="emit('refresh')"
            />
          </div>

          <div class="map-measurement-setting__geometry">
            <FieldGeometry
              @update:modelValue="setValue"
              :modelValue="model"
              :maxLength="maxLength"
              @click:fillbound="onFlyTo"
              title=""
              :titleActionDownload="trans('map.measurement.action.download')"
              :titleActionFillBound="trans('map.measurement.action.fly-to')"
              :titleActionAddPoint="trans('map.measurement.action.add-point')"
            />
          </div>
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
  toCoordinatesNumberList,
  type WithMapPropType,
} from '@hungpvq/map-core';
import {
  getMeasurementAreaUnit,
  getMeasurementDistanceUnit,
  getMeasurementLabelPrefs,
  getMeasurementSettingUiFlags,
  setMeasurementAreaUnit,
  setMeasurementDistanceUnit,
  setMeasurementLabelPrefs,
  type AreaUnit,
  type DistanceUnit,
  type IViewSettingField,
  type MeasurementLabelPrefs,
} from '@hungpvq/map-core/measurement';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { computed, ref, watch } from 'vue';
import { InputCheckbox, InputSelect } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useLang } from '../../lang/hook';
import { useRegisterMapControl } from '../../registry/useRegisterMapControl';
import CrsDisplaySettings from '../../crs/modules/CrsDisplaySettings/CrsDisplaySettings.vue';
import FieldGeometry from './setting/field-geometry.vue';
import FieldPointCrs from './setting/field-point-crs.vue';
import MeasurementSettingFields from './setting/fields-show.vue';

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
const emit = defineEmits<{
  refresh: [];
}>();

function clearDocumentSelection() {
  if (typeof window === 'undefined') return;
  const selection = window.getSelection?.();
  selection?.removeAllRanges?.();
}

watch(
  c_show,
  (open) => {
    if (!open) return;
    clearDocumentSelection();
    requestAnimationFrame(clearDocumentSelection);
  },
  { flush: 'post' },
);

const uiFlags = computed(() =>
  getMeasurementSettingUiFlags(props.measurementType),
);
const showDistanceUnit = computed(() => uiFlags.value.showDistanceUnit);
const showAreaUnit = computed(() => uiFlags.value.showAreaUnit);
const showVertexLabelToggle = computed(
  () => uiFlags.value.showVertexLabelToggle,
);
const showEdgeLabelToggle = computed(() => uiFlags.value.showEdgeLabelToggle);
const showResultLabelToggle = computed(
  () => uiFlags.value.showResultLabelToggle,
);
const showSettingsSection = computed(
  () =>
    showDistanceUnit.value ||
    showAreaUnit.value ||
    showVertexLabelToggle.value ||
    showEdgeLabelToggle.value ||
    showResultLabelToggle.value ||
    props.measurementType === 'point',
);

const distanceUnit = ref<DistanceUnit>(getMeasurementDistanceUnit());
const areaUnit = ref<AreaUnit>(getMeasurementAreaUnit());
const labelPrefs = ref(getMeasurementLabelPrefs());

const distanceUnitItems = computed(() => [
  { value: 'auto', text: trans.value('map.measurement.unit.auto') },
  { value: 'm', text: trans.value('map.measurement.unit.meter') },
  { value: 'km', text: trans.value('map.measurement.unit.kilometer') },
  { value: 'ft', text: trans.value('map.measurement.unit.foot') },
  { value: 'mi', text: trans.value('map.measurement.unit.mile') },
]);

const areaUnitItems = computed(() => [
  { value: 'auto', text: trans.value('map.measurement.unit.auto') },
  { value: 'm2', text: trans.value('map.measurement.unit.square-meter') },
  {
    value: 'km2',
    text: trans.value('map.measurement.unit.square-kilometer'),
  },
  { value: 'ha', text: trans.value('map.measurement.unit.hecta') },
  { value: 'acre', text: trans.value('map.measurement.unit.acre') },
]);

function onDistanceUnitChange(
  value: string | number | { value: string; text: string } | undefined,
) {
  const raw =
    value && typeof value === 'object' && 'value' in value
      ? value.value
      : value;
  const unit = String(raw ?? '') as DistanceUnit;
  distanceUnit.value = unit;
  setMeasurementDistanceUnit(unit);
  emit('refresh');
}

function onAreaUnitChange(
  value: string | number | { value: string; text: string } | undefined,
) {
  const raw =
    value && typeof value === 'object' && 'value' in value
      ? value.value
      : value;
  const unit = String(raw ?? '') as AreaUnit;
  areaUnit.value = unit;
  setMeasurementAreaUnit(unit);
  emit('refresh');
}

function onLabelToggle(key: keyof MeasurementLabelPrefs, checked: boolean) {
  setMeasurementLabelPrefs({ [key]: checked });
  labelPrefs.value = getMeasurementLabelPrefs();
  emit('refresh');
}

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
