<script setup lang="ts">
import { WithMapPropType } from '@hungpvq/map-core';
import { CREATE_CONTROL_LOCALE, suggestLayerName } from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  InputSelect,
  InputText,
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/vue-map-core';
import { computed, onMounted, ref, type Ref } from 'vue';
import { useMapDataset } from '../../store';
import { LAYER_TYPES, LayerHelper, LayerType } from './helper';

defineOptions({
  name: 'CreateLayerControl',
});

const props = defineProps<
  WithMapPropType & {
    show: boolean;
  }
>();

const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(CREATE_CONTROL_LOCALE);
const { addDataset } = useMapDataset(mapId.value);
const emit = defineEmits(['update:show']);

const cShow = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit('update:show', value);
  },
});

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

const initialState = {
  type: 'vector' as LayerType,
};

const keyRender = ref(1);
const helper = new LayerHelper(initialState.type);

const form = ref({
  type: initialState.type,
  config: {
    name: suggestLayerName(initialState.type),
    ...helper.default_value,
  } as Record<string, any>,
});

const itemsType = (Object.keys(LAYER_TYPES) as Array<LayerType>).map((x) => ({
  value: x,
  text: LAYER_TYPES[x],
}));

const creating = ref(false);
const createError = ref('');

function onChangeType(type: unknown) {
  if (typeof type !== 'string') return;

  const layerType = type as LayerType;
  const prevSuggested = suggestLayerName(form.value.type);
  const keepName =
    form.value.config.name && form.value.config.name !== prevSuggested;

  helper.setType(layerType);

  form.value = {
    type: layerType,
    config: {
      name: keepName ? form.value.config.name : suggestLayerName(layerType),
      ...helper.default_value,
    } as Record<string, any>,
  };
  keyRender.value++;
}

async function onAddLayer() {
  const handle = helper.create;
  if (!handle || creating.value) return;
  if (!helper.validate(form.value.config)) return;
  creating.value = true;
  createError.value = '';
  try {
    addDataset(await handle(form.value.config));
    reset();
    cShow.value = false;
  } catch (err) {
    createError.value =
      err instanceof Error
        ? err.message
        : trans.value('map.layer-control.create.create-error');
  } finally {
    creating.value = false;
  }
}

function reset() {
  helper.setType(initialState.type);
  createError.value = '';
  creating.value = false;
  form.value = {
    type: initialState.type,
    config: {
      name: suggestLayerName(initialState.type),
      ...helper.default_value,
    } as Record<string, any>,
  };
  keyRender.value++;
}

function close() {
  reset();
}

onMounted(() => {
  onChangeType(form.value.type);
});
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
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
              :is="helper.dataSourceComponent()"
              v-model="form.config"
              :key="`${keyRender}-data`"
            />

            <template v-if="helper.hasLayerSettings">
              <div class="map-col-12">
                <div class="create-control-section-label">
                  {{ trans('map.layer-control.create.layer-setting') }}
                </div>
              </div>

              <component
                :is="helper.settingsComponent()"
                v-model="form.config"
                :key="`${keyRender}-settings`"
              />
            </template>
          </div>

          <div v-if="creating" class="create-control-status">
            {{ trans('map.layer-control.create.creating') }}
          </div>
          <div v-if="createError" class="create-control-sample-error">
            {{ createError }}
          </div>
          <BaseButton
            :disabled="creating"
            @click="onAddLayer()"
            class="btn-container"
          >
            {{ trans('map.layer-control.create-btn') }}
          </BaseButton>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
