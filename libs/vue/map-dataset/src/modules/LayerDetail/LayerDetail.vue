<script lang="ts">
export default {
  name: 'detail-layer-info',
};
</script>

<script setup lang="ts">
import {
  LAYER_DETAIL_LOCALE,
  type FieldFeaturesDef,
  type IDataset,
} from '@hungpvq/map-dataset';
import {
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
import { computed, ref } from 'vue';
import { provideMenuConditionContext } from '../../extra/menu/condition-context';
import DatasetMenus from '../../extra/menu/dataset-menus.vue';
import { useMapHighlight } from '../../store/highlight';
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
const hl = useMapHighlight(mapId.value);
const { trans, registerLocale } = useLang(mapId.value);
registerLocale('en', LAYER_DETAIL_LOCALE);

const show = ref(true);

provideMenuConditionContext(() => ({
  control: MENU_CONTROL_ID.layerDetail,
}));

const itemMenuHost = computed(() =>
  props.view ? getItemMenuHost(props.view) : undefined,
);

const layerTitleMenus = computed(() =>
  props.view ? getResolvedMenus(props.view, 'layer') : [],
);

const itemMenus = computed(() => {
  if (!props.view) return [];
  return getResolvedMenus(props.view, 'item').filter(
    (menu) => menu.type !== 'divider',
  );
});

function handleClose() {
  hl.hideIfSource('detail');
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
            :locations="['title', 'extra', 'menu']"
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
