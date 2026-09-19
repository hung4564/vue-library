<script lang="ts">
export default {
  name: 'detail-layer-info',
};
</script>

<script setup lang="ts">
import {
  type FieldFeaturesDef,
  type IDataset,
} from '@hungpvq/map-dataset';
import {
  bindHighlightMittBridge,
  emitHighlightDetailClose,
} from '@hungpvq/map-dataset/highlight';
import {
  filterLayerDetailHeaderMenus,
  getItemMenuHost,
  getResolvedMenus,
  MENU_CONTROL_ID,
} from '@hungpvq/map-dataset/menu';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/vue-map-core';
import { computed, onUnmounted, ref } from 'vue';
import { provideMenuConditionContext } from '../../extra/menu/condition-context';
import DatasetMenus from '../../extra/menu/dataset-menus.vue';
import TableTdLayer from './table-td-layer.vue';

const props = withDefaults(
  defineProps<{
    item?: Record<string, unknown>;
    view?: IDataset;
    fields?: FieldFeaturesDef;
    popupProps?: Record<string, unknown>;
  }>(),
  {
    fields: () => [],
    popupProps: () => ({}),
  },
);

const emit = defineEmits<{ close: [] }>();
const { mapId } = useMap();
const { trans } = useLang(mapId.value);
const unbindMittBridge = bindHighlightMittBridge(mapId.value);
const show = ref(true);
/** Popup `close()` emits both `update:show(false)` and `close` — dismiss once. */
let closed = false;

provideMenuConditionContext(() => ({
  control: MENU_CONTROL_ID.layerDetail,
}));

const itemMenuHost = computed(() =>
  props.view ? getItemMenuHost(props.view) : undefined,
);

const layerTitleMenus = computed(() => {
  if (!props.view) return [];
  return filterLayerDetailHeaderMenus(getResolvedMenus(props.view, 'layer'), {
    hasFeatureItem: props.item != null,
  });
});

const itemMenus = computed(() => {
  if (!props.view) return [];
  return getResolvedMenus(props.view, 'item').filter(
    (menu) => menu.type !== 'divider',
  );
});

function handleClose() {
  if (closed) return;
  closed = true;
  show.value = false;
  emitHighlightDetailClose(mapId.value, {
    item: props.item,
    dataset: props.view,
  });
  emit('close');
}

function onUpdateShow(val: boolean) {
  show.value = val;
  if (!val) handleClose();
}

const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapLayerDetail',
  panelKind: 'popup',
  title: () => trans.value('map.layer-control.info.title'),
  show,
  setShow: (value) => {
    if (!value) {
      handleClose();
      return;
    }
    closed = false;
    show.value = true;
  },
  getProps: () => ({
    ...(props.popupProps || {}),
  }),
  actions: [
    {
      type: 'mapLayerDetail',
      run: () => {
        if (show.value) handleClose();
        else {
          closed = false;
          show.value = true;
        }
      },
    },
  ],
});

onUnmounted(() => {
  unbindMittBridge();
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
        <template v-if="view" #after-title>
          <DatasetMenus
            :menus="layerTitleMenus"
            :data="view"
            :mapId="mapId"
            :locations="['title']"
          />
          <DatasetMenus
            v-if="itemMenuHost || view"
            :menus="itemMenus"
            :data="itemMenuHost || view"
            :mapId="mapId"
            :value="item"
            :locations="['title']"
          />
        </template>
        <div class="table-show-info">
          <div class="table-content">
            <TableTdLayer
              :field="field"
              :label="'trans' in field ? trans(field.trans) : field.text"
              :item="item"
              v-for="(field, i) in fields"
              :key="i"
            />
          </div>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
