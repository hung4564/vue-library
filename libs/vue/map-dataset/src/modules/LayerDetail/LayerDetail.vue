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
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import {
  createMenuConditionContext,
  getItemMenuHost,
  getResolvedMenus,
  handleMenuAction,
  isMenuItemDisabled,
  isMenuItemHidden,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/map-dataset/menu';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/vue-map-core';
import { computed, ref } from 'vue';
import DatasetMenuButton from '../../extra/menu/dataset-menu-button.vue';
import { useMapDatasetHighlight } from '../../store';
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
const { setFeatureHighlight } = useMapDatasetHighlight(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(LAYER_DETAIL_LOCALE);

const show = ref(true);

const itemMenuHost = computed(() =>
  props.view ? getItemMenuHost(props.view) : undefined,
);

const itemMenuConditionCtx = computed(() =>
  createMenuConditionContext(itemMenuHost.value ?? props.view, {
    mapId: mapId.value,
  }),
);

/** Same item menus as Identify / Attribute Table, minus show-detail (this popup). */
const itemMenus = computed(() => {
  if (!props.view) return [];
  const ctx = itemMenuConditionCtx.value;
  return getResolvedMenus(props.view, 'item').filter(
    (menu) =>
      menu.type !== 'divider' &&
      !('id' in menu && menu.id === LIST_VIEW_MENU_ID.item.showDetail) &&
      !isMenuItemHidden(menu, ctx),
  );
});

function handleClose() {
  setFeatureHighlight(undefined, 'detail');
  emit('close');
}

function onUpdateShow(val: boolean) {
  show.value = val;
  if (!val) handleClose();
}

function onMenuAction(menu: MenuAction, event: MouseEvent) {
  if (isMenuItemDisabled(menu, itemMenuConditionCtx.value)) return;
  handleMenuAction(menu, {
    event,
    layer: itemMenuHost.value ?? props.view!,
    mapId: mapId.value,
    value: props.item,
  });
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
        <template v-if="itemMenus.length" #extra-btn>
          <DatasetMenuButton
            v-for="(menu, index) in itemMenus"
            :key="menu.id || index"
            :item="menu"
            :data="itemMenuHost || view"
            :mapId="mapId"
            :disabled="isMenuItemDisabled(menu, itemMenuConditionCtx)"
            @click.stop="onMenuAction(menu, $event)"
          />
        </template>
        <div class="table-show-info">
          <div class="table-content">
            <TableTdLayer
              :field="field"
              :label="field.trans ? trans(field.trans) : field.text"
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
