<script setup lang="ts">
import { WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  LAYER_TYPES,
  LayerHelper,
  loadCreateControlDraft,
  normalizeLayerType,
  reportCreateLayerError,
  resolveCreateControlLayerTypes,
  saveCreateControlDraft,
  suggestLayerName,
  type LayerType,
} from '@hungpvq/map-dataset/create-control';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  MapCommonButton,
  MapControlButton,
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
  useToolbarControl,
} from '@hungpvq/vue-map-core';
import { InputSelect, InputText } from '@hungpvq/vue-map-core/fields';
import { mdiPlus } from '@mdi/js';
import { computed, onMounted, ref, watch, type Component, type Ref } from 'vue';
import { useMapDataset } from '../../store/dataset-api';
import ConfigArchiveSettings from './config/archive-settings.vue';
import ConfigFilegdbSettings from './config/filegdb-settings.vue';
import ConfigFilegdbUpload from './config/filegdb-upload.vue';
import ConfigMbtilesJson from './config/mbtiles-json.vue';
import ConfigNo from './config/no-config.vue';
import ConfigPmtilesJson from './config/pmtiles-json.vue';
import ConfigRasterJson from './config/xyz-json.vue';
import ConfigRasterSettings from './config/xyz-settings.vue';
import ConfigTilejsonJson from './config/tilejson-json.vue';
import GeojsonSettings from './config/geojson-settings.vue';
import GeojsonUpload from './config/geojson-upload.vue';

defineOptions({
  name: 'CreateLayerControl',
});

const props = defineProps<
  WithMapPropType & {
    show: boolean;
    createLayerTypes?: LayerType[];
  }
>();

const { mapId, moduleContainerProps, order } = useMap(props);
const { trans } = useLang(mapId.value);
const { addDataset } = useMapDataset(mapId);
const emit = defineEmits(['update:show']);

const cShow = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit('update:show', value);
  },
});

const allowedTypes = computed(() =>
  resolveCreateControlLayerTypes(props.createLayerTypes),
);

const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapCreateControl',
  panelKind: 'popup',
  title: () => trans.value('map.layer-control.create.title'),
  buttonPosition: () => props.position,
  show: cShow as Ref<boolean>,
  setShow: (value) => {
    cShow.value = value;
  },
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
    createLayerTypes: props.createLayerTypes,
  }),
  actions: [
    {
      type: 'mapCreateControl',
      run: () => {
        cShow.value = !cShow.value;
      },
    },
  ],
});

const { state, control } = useToolbarControl(mapId.value, props, {
  kind: 'single',
  id: 'mapCreateControl',
  getState() {
    return mdiButtonState(mdiPlus, {
      active: cShow.value,
      title: trans.value('map.layer-control.create.title'),
      order: order.value,
    });
  },
  onClick() {
    cShow.value = !cShow.value;
  },
});
watch(cShow, () => control.sync());

function firstAllowedType(): LayerType {
  return allowedTypes.value[0] ?? 'geojson';
}

const initialState = {
  type: firstAllowedType(),
};

const keyRender = ref(1);
const helper = new LayerHelper(initialState.type);

function dataSourceComponent(type: LayerType): Component {
  switch (type) {
    case 'geojson':
      return GeojsonUpload;
    case 'filegdb':
      return ConfigFilegdbUpload;
    case 'xyz':
      return ConfigRasterJson;
    case 'tilejson':
      return ConfigTilejsonJson;
    case 'mbtiles':
      return ConfigMbtilesJson;
    case 'pmtiles':
      return ConfigPmtilesJson;
    default:
      return ConfigNo;
  }
}

function settingsComponent(type: LayerType): Component | undefined {
  switch (type) {
    case 'geojson':
      return GeojsonSettings;
    case 'filegdb':
      return ConfigFilegdbSettings;
    case 'xyz':
      return ConfigRasterSettings;
    case 'tilejson':
    case 'mbtiles':
    case 'pmtiles':
      return ConfigArchiveSettings;
    default:
      return undefined;
  }
}

const form = ref({
  type: initialState.type,
  config: {
    name: suggestLayerName(initialState.type),
    ...helper.default_value,
  } as Record<string, any>,
});

onMounted(() => {
  const draft = loadCreateControlDraft(mapId.value);
  if (!draft) {
    onChangeType(form.value.type);
    return;
  }
  if (draft.type) {
    onChangeType(normalizeLayerType(draft.type));
  }
  if (draft.name) form.value.config.name = draft.name;
  if (draft.crs) form.value.config.crs = draft.crs;
  ensureTypeAllowed(form.value.type);
});

watch(
  () => ({
    type: form.value.type,
    name: form.value.config?.name,
    crs: form.value.config?.crs,
  }),
  (snapshot) => {
    saveCreateControlDraft(mapId.value, {
      type: snapshot.type,
      name: snapshot.name,
      crs: snapshot.crs,
    });
  },
  { deep: true },
);

watch(allowedTypes, () => {
  ensureTypeAllowed(form.value.type);
});

const itemsType = computed(() =>
  allowedTypes.value.map((x) => ({
    value: x,
    text: LAYER_TYPES[x],
  })),
);

const creating = ref(false);
const createError = ref('');
const validationErrors = ref<string[]>([]);

function ensureTypeAllowed(type: LayerType) {
  if (allowedTypes.value.length === 0) return;
  if (!allowedTypes.value.includes(type)) {
    onChangeType(firstAllowedType());
  }
}

function onChangeType(type: unknown) {
  if (typeof type !== 'string') return;

  let layerType = normalizeLayerType(type);
  if (
    allowedTypes.value.length > 0 &&
    !allowedTypes.value.includes(layerType)
  ) {
    layerType = firstAllowedType();
  }

  helper.setType(layerType);
  validationErrors.value = [];
  createError.value = '';

  form.value = {
    type: layerType,
    config: {
      name: suggestLayerName(layerType),
      ...helper.default_value,
    } as Record<string, any>,
  };
  keyRender.value++;
}

async function onAddLayer() {
  const handle = helper.create;
  if (!handle || creating.value) return;
  const errors = helper.validationErrors(form.value.config);
  validationErrors.value = errors;
  if (errors.length) return;
  creating.value = true;
  createError.value = '';
  try {
    addDataset(
      await handle(form.value.config as Record<string, unknown> & { name: string }),
    );
    reset();
    cShow.value = false;
  } catch (err) {
    const mapError = reportCreateLayerError(err, {
      crs:
        typeof form.value.config.crs === 'string'
          ? form.value.config.crs
          : undefined,
      layerType: form.value.type,
      name:
        typeof form.value.config.name === 'string'
          ? form.value.config.name
          : undefined,
    });
    createError.value =
      mapError.message ||
      (mapError.context?.['reason'] === 'too_deep_or_circular_or_large'
        ? trans.value('map.layer-control.create.create-error-data-too-large')
        : trans.value('map.layer-control.create.create-error'));
  } finally {
    creating.value = false;
  }
}

function reset() {
  const type = firstAllowedType();
  helper.setType(type);
  createError.value = '';
  creating.value = false;
  validationErrors.value = [];
  form.value = {
    type,
    config: {
      name: suggestLayerName(type),
      ...helper.default_value,
    } as Record<string, any>,
  };
  keyRender.value++;
}

function close() {
  reset();
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      />
    </template>
    <template #draggable="p">
      <DraggableItemPopup
        v-model:show="cShow"
        v-bind="{ ...p, ...panelBind }"
        :width="400"
        :height="420"
        @close="close"
        :title="trans('map.layer-control.create.title')"
      >
        <div class="create-control-container">
          <div class="form-container create-control-form map-row">
            <div class="map-col-12">
              <InputSelect
                v-model="form.type"
                :items="itemsType"
                @update:model-value="onChangeType"
                :label="trans('map.layer-control.field.layer-type')"
              />
            </div>

            <div class="map-col-12">
              <InputText
                v-model="form.config.name"
                :label="trans('map.layer-control.field.layer-name')"
                required
              />
            </div>

            <div class="map-col-12">
              <div class="create-control-section-label">
                {{ trans('map.layer-control.create.data-source') }}
              </div>
            </div>

            <component
              :is="dataSourceComponent(form.type)"
              v-model="form.config"
              :key="`${keyRender}-data`"
            />

            <template v-if="settingsComponent(form.type)">
              <div class="map-col-12">
                <div class="create-control-section-label">
                  {{ trans('map.layer-control.create.layer-setting') }}
                </div>
              </div>

              <component
                :is="settingsComponent(form.type)"
                v-model="form.config"
                :key="`${keyRender}-settings`"
              />
            </template>
          </div>

          <div class="create-control-actions">
            <div
              v-if="validationErrors.length"
              class="create-control-validation"
            >
              <div
                v-for="key in validationErrors"
                :key="key"
                class="create-control-validation__item"
              >
                {{ trans(`map.layer-control.create.${key}`) }}
              </div>
            </div>
            <div v-if="createError" class="create-control-sample-error">
              {{ createError }}
            </div>
            <div v-if="creating" class="create-control-actions__status">
              {{ trans('map.layer-control.create.creating') }}
            </div>
            <MapControlButton
              :disabled="creating"
              @click="onAddLayer()"
              class="btn-container" variant="filled">
              {{ trans('map.layer-control.create-btn') }}
            </MapControlButton>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
