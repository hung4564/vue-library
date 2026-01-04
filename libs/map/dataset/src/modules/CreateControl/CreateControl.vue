<script setup lang="ts">
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  InputSelect,
  InputText,
  ModuleContainer,
  useLang,
  useMap,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import { computed, onMounted, ref } from 'vue';
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
const { trans } = useLang(mapId.value);
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

const initialState = {
  type: 'geojson' as LayerType,
};

const keyRender = ref(1);
const helper = new LayerHelper(initialState.type);
const form = ref({
  type: initialState.type,
  config: { name: '', ...helper.default_value } as Record<string, any>,
});

const itemsType = (Object.keys(LAYER_TYPES) as Array<LayerType>).map((x) => ({
  value: x,
  text: LAYER_TYPES[x],
}));

function onChangeType(type: unknown) {
  if (typeof type !== 'string') return;
  const layerType = type as LayerType;
  helper.setType(layerType);
  form.value = {
    type: layerType,
    config: {
      name: form.value.config.name,
      ...helper.default_value,
    } as Record<string, any>,
  };
}

function onAddLayer() {
  const handle = helper.create;
  if (!handle) {
    return;
  }
  if (!helper.validate(form.value.config)) {
    return;
  }
  const layer = handle(form.value.config);
  addDataset(layer);
  reset();
  cShow.value = false;
}

function reset() {
  helper.setType(initialState.type);
  form.value = {
    type: initialState.type,
    config: { name: '', ...helper.default_value } as Record<string, any>,
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
        v-bind="p"
        :width="400"
        :height="300"
        @close="close"
        :title="trans('map.layer-control.create.title')"
      >
        <div class="create-control-container">
          <div class="form-container">
            <component
              :is="helper.component()"
              v-model="form.config"
              class="create-control-form"
              :key="keyRender"
            >
              <div class="map-col-12">
                <InputText
                  v-model="form.config.name"
                  :label="trans('map.layer-control.field.name')"
                />
              </div>
              <div class="map-col-12">
                <InputSelect
                  v-model="form.type"
                  :items="itemsType"
                  @update:model-value="onChangeType"
                  :label="trans('map.layer-control.field.type')"
                />
              </div>
            </component>
          </div>

          <BaseButton @click="onAddLayer()" class="btn-container">
            {{ trans('map.layer-control.create-btn') }}
          </BaseButton>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
<style scoped>
.create-control-container {
  padding: 8px 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.create-control-form {
  flex-grow: 1;
  overflow: auto;
}

.create-control-container .form-container {
  overflow: auto;
  height: 100%;
  padding: 8px;
}
.create-control-container .btn-container {
  padding: 8px;
}
</style>
