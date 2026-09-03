<script setup lang="ts">
import { onMounted, Ref, ref, shallowRef } from 'vue';

import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  RegistryItem,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
} from '@hungpvq/vue-map-core';

import { MapSimple } from '@hungpvq/map-core';
import {
  ComponentType,
  findSiblingOrNearestLeaf,
  IDataset,
  IMapboxLayerView,
  isMapboxLayerView,
  STYLE_CONTROL_LOCALE,
} from '@hungpvq/map-dataset';
import { copyByJson } from '@hungpvq/shared';

const emit = defineEmits(['close']);
const props = defineProps<{ item: IDataset }>();
const { mapId, callMap } = useMap();
const { trans, setLocaleDefault } = useLang(mapId.value);

setLocaleDefault(STYLE_CONTROL_LOCALE);

const [show, toggleShow] = useShow(false);
const { panelPosition } = useRegisterMapControl(mapId, {
  id: 'mapStyleControl',
  panelKind: 'sidebar',
  title: () => trans.value('map.style-control.title'),
  show,
  setShow: toggleShow,
  initialPanelPosition: { location: 'right' },
  actions: [
    {
      type: 'mapStyleControl',
      run: () => toggleShow(),
    },
  ],
});
const layer = ref<unknown>();
const layer_map = ref<IMapboxLayerView | undefined>(undefined);
const layer_map_component: Ref<ComponentType> = shallowRef({
  componentKey: '',
});

onMounted(() => {
  toggleShow(true);
  layer_map.value = undefined;
  updateValue();
});

const onClose = () => {
  layer_map.value = undefined;
  layer.value = undefined;
  emit('close');
};

const onUpdateStyle = (value: unknown) => {
  callMap((map: MapSimple) => {
    if (!layer_map.value) {
      return;
    }
    layer_map.value.updateValue(map, value);
  });
  updateValue();
};

const updateValue = () => {
  const layerView = findSiblingOrNearestLeaf<IMapboxLayerView & IDataset>(
    props.item,
    (dataset) => isMapboxLayerView(dataset),
  );
  if (layerView) {
    if (isMapboxLayerView(layerView)) {
      layer_map.value = layerView || undefined;
      layer_map_component.value = layerView.getComponentUpdate();
      layer.value = copyByJson(layerView.getData());
    }
  }
};
</script>
<template>
  <ModuleContainer v-bind="$attrs">
    <template #draggable="p">
      <DraggableItemSideBar
        v-bind="p"
        v-model:show="show"
        v-if="layer_map_component.componentKey"
        @close="onClose"
        :title="trans('map.style-control.title')"
        :location="panelPosition.location || 'right'"
      >
        <template #title>
          <span class="layer-control__title">
            {{ trans('map.style-control.title') }}
          </span>
        </template>
        <div class="style-control">
          <RegistryItem
            :componentKey="layer_map_component.componentKey"
            v-model="layer"
            @update-style="onUpdateStyle"
            :trans="trans"
            :map-id="mapId"
          />
        </div>
      </DraggableItemSideBar>
    </template>
  </ModuleContainer>
</template>
