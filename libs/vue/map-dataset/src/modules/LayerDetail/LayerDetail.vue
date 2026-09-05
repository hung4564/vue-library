<script>
export default {
  name: 'detail-layer-info',
};
</script>

<script setup>
import { LAYER_DETAIL_LOCALE } from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/vue-map-core';
import { ref } from 'vue';
import { useMapDatasetHighlight } from '../../store';
import TableTdLayer from './table-td-layer.vue';
const props = defineProps({
  item: {},
  view: {},
  fields: {
    type: Array,
    default: () => [],
  },
  popupProps: {
    type: Object,
    default: () => ({}),
  },
});
const { mapId } = useMap();
const { setFeatureHighlight } = useMapDatasetHighlight(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(LAYER_DETAIL_LOCALE);
const emit = defineEmits(['close']);
const show = ref(true);
function handleClose() {
  setFeatureHighlight(undefined, 'detail');
  emit('close');
}
function onUpdateShow(val) {
  show.value = val;
  if (!val) {
    handleClose();
  }
}
const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapLayerDetail',
  panelKind: 'popup',
  title: () => trans.value('map.layer-control.info.title'),
  show,
  setShow: (value) => {
    show.value = value;
    if (!value) handleClose();
  },
  getProps: () => ({
    ...(props.popupProps || {}),
  }),
  actions: [
    {
      type: 'mapLayerDetail',
      run: () => {
        show.value = !show.value;
        if (!show.value) handleClose();
      },
    },
  ],
});
</script>
<template>
  <ModuleContainer v-bind="$attrs">
    <template #draggable="slotProps">
      <DraggableItemPopup
        :show="show"
        @close="handleClose"
        @update:show="onUpdateShow"
        :width="520"
        v-bind="{ ...slotProps, ...popupProps, ...panelBind }"
        :title="trans('map.layer-control.info.title')"
      >
        <template #title>
          {{ trans('map.layer-control.info.title') }}
        </template>
        <div class="table-show-info">
          <div class="table-content">
            <TableTdLayer
              :field="field"
              :label="field.trans ? trans(field.trans) : field.text"
              :item="item"
              :view="view"
              v-for="(field, i) in fields"
              :key="i"
            />
          </div>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
