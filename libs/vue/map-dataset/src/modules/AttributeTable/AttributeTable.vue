<script lang="ts">
export default {
  name: 'attribute-table',
};
</script>
<script setup lang="ts">
import { fitBounds } from '@hungpvq/map-core';
import { convertFeatureToItem } from '@hungpvq/map-dataset';
import {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  ATTRIBUTE_TABLE_CONTROL,
  ATTRIBUTE_TABLE_LOCALE,
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  clearPendingAttributeTableSelectRows,
  createAttributeTableController,
  resolveAttributeTableExportOption,
  resolveAttributeTableUi,
  resolveAttributeTableUiOption,
  takePendingAttributeTableSelectRows,
  type AttributeTableController,
  type AttributeTableProps,
  type AttributeTableRow,
  type AttributeTableSelectRowsPayload,
  type AttributeTableViewLabels,
  type AttributeTableViewProps,
} from '@hungpvq/map-dataset/attribute-table';
import { GEO_EXPORT_FORMAT_META } from '@hungpvq/map-dataset/geo-export';
import {
  createMenuConditionContext,
  getItemMenuHost,
  getResolvedMenus,
  handleMenuAction,
  isMenuItemDisabled,
  isMenuItemHidden,
} from '@hungpvq/map-dataset/menu';
import { ContextMenu, DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  RegistryItem,
  useLang,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDownload } from '@mdi/js';
import type { Feature } from 'geojson';
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { useMapDatasetHighlight } from '../../store';
import AttributeTableView from './AttributeTableView.vue';

const props = defineProps<AttributeTableProps>();
const emit = defineEmits<{ close: [] }>();
const { mapId, moduleContainerProps, callMap } = useMap(props);
const { setFeatureHighlight, getHighlightSource } =
  useMapDatasetHighlight(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(ATTRIBUTE_TABLE_LOCALE);

const show = ref(true);
const tick = ref(0);
const resolvedUi = computed(() =>
  resolveAttributeTableUiOption(props.layer, props.ui),
);
function createController() {
  const ui = resolvedUi.value;
  return createAttributeTableController(props.layer, {
    columns: props.columns,
    store: props.store,
    rowFilter: props.rowFilter,
    export: resolveAttributeTableExportOption(props.layer, props.export),
    sortable: resolveAttributeTableUi(ui).sort,
  });
}

const controller = shallowRef<AttributeTableController>(createController());
let unsub: (() => void) | undefined;

function bindController(next: AttributeTableController) {
  unsub?.();
  controller.value = next;
  unsub = next.subscribe(() => {
    tick.value += 1;
    applySelection();
  });
  tick.value += 1;
}

watch(
  () =>
    [
      props.layer,
      props.columns,
      props.store,
      props.rowFilter,
      props.export,
      props.ui,
    ] as const,
  () => {
    controller.value.dispose();
    bindController(createController());
    void controller.value.load('initial');
  },
);

const state = computed(() => {
  tick.value;
  return controller.value.getState();
});

const labels = computed(
  (): AttributeTableViewLabels => ({
    search: trans.value('map.attribute-table.search'),
    zoomToSelection: trans.value('map.attribute-table.zoomToSelection'),
    showAll: trans.value('map.attribute-table.showAll'),
    showSelected: trans.value('map.attribute-table.showSelected'),
    clear: trans.value('map.attribute-table.clear'),
    export: trans.value('map.attribute-table.export'),
    exportSelected: trans.value('map.attribute-table.export-selected'),
    exporting: trans.value('map.attribute-table.exporting'),
    loading: trans.value('map.attribute-table.loading'),
    empty: trans.value('map.attribute-table.empty'),
    page: trans.value('map.attribute-table.page'),
    of: trans.value('map.attribute-table.of'),
    prev: trans.value('map.attribute-table.prev'),
    next: trans.value('map.attribute-table.next'),
    rowsPerPage: trans.value('map.attribute-table.rowsPerPage'),
  }),
);

const exportActions = computed(() => {
  tick.value;
  return controller.value.getExportActions();
});
const exportMenuMode = computed(() => {
  tick.value;
  return controller.value.isExportMenuMode();
});

const title = computed(() => {
  const name =
    props.layer?.getName?.() || trans.value('map.attribute-table.title');
  const count = state.value.total;
  const selected = state.value.selectedIds.length;
  if (!count && !state.value.loading) {
    return trans.value('map.attribute-table.title');
  }
  if (!count) return name;
  return selected
    ? `${name} (${count}, ${selected} selected)`
    : `${name} (${count})`;
});

const { panelBind } = useRegisterMapControl(mapId, {
  id: ATTRIBUTE_TABLE_CONTROL.id,
  panelKind: 'popup',
  title: () => title.value,
  buttonPosition: () => props.position,
  show,
  setShow: (value) => {
    show.value = value;
    if (!value) clearAttributeTableHighlight();
  },
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: ATTRIBUTE_TABLE_CONTROL.id,
      run: () => {
        // Toggle visibility only — do not emit close (that unmounts via ComponentManagement).
        show.value = !show.value;
        if (!show.value) clearAttributeTableHighlight();
      },
    },
    {
      type: ATTRIBUTE_TABLE_CONTROL.actionSelectRows,
      run: (event) => {
        applySelectRows(event as AttributeTableSelectRowsPayload | undefined);
      },
    },
  ],
});

function applySelectRows(payload?: AttributeTableSelectRowsPayload) {
  const ids = (payload?.ids ?? []).map(String);
  clearPendingAttributeTableSelectRows(mapId.value);
  show.value = true;
  void controller.value.selectIds(ids);
}
function clearAttributeTableHighlight() {
  if (getHighlightSource()?.value === 'attribute-table') {
    setFeatureHighlight(undefined, 'attribute-table');
  }
}
/** Dismiss popup and remove from ComponentManagement (X / explicit close). */
function handleClose() {
  show.value = false;
  clearAttributeTableHighlight();
  emit('close');
  props.onClose?.();
}
function onUpdateShow(val: boolean) {
  show.value = val;
  if (!val) clearAttributeTableHighlight();
}
function applySelection(focus?: AttributeTableRow) {
  const s = controller.value.getState();
  const selected = s.rows.filter((row) => s.selectedIds.includes(row.id));
  if (selected.length !== 1) {
    clearAttributeTableHighlight();
    return;
  }
  const current = focus ?? selected[0];
  setFeatureHighlight(
    current.feature as Feature,
    'attribute-table',
    props.layer,
  );
  if (!s.zoomToSelection) return;
  callMap((map) => {
    fitBounds(map, current.feature as Feature, { mapId: mapId.value });
  });
}

const exportMenuRef = ref<{
  open: (event: MouseEvent) => void;
  close: () => void;
}>();
function onExportClick(event: MouseEvent) {
  if (!controller.value.canExport() || controller.value.getState().exporting) {
    return;
  }
  if (!controller.value.isExportMenuMode()) {
    void controller.value.export(undefined, { event });
    return;
  }
  exportMenuRef.value?.open(event);
}
function onExportAction(actionId: string) {
  void controller.value.export(actionId);
  exportMenuRef.value?.close();
}

const itemMenuHost = computed(() => getItemMenuHost(props.layer));
const itemMenus = computed(() => {
  if (resolvedUi.value?.rowMenus === false) return [];
  const host = itemMenuHost.value;
  const ctx = createMenuConditionContext(host, { mapId: mapId.value });
  return getResolvedMenus(props.layer, 'item').filter(
    (menu) => menu.type !== 'divider' && !isMenuItemHidden(menu, ctx),
  );
});
const itemMenuConditionCtx = computed(() =>
  createMenuConditionContext(itemMenuHost.value, { mapId: mapId.value }),
);

const viewProps = computed(
  (): AttributeTableViewProps => ({
    mapId: mapId.value,
    layer: props.layer,
    controller: controller.value,
    pageSizeItems: [...ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS],
    labels: labels.value,
    ui: resolvedUi.value,
    onExportClick,
    itemMenus: itemMenus.value,
    itemMenuHost: itemMenuHost.value,
    isMenuDisabled: (menu) =>
      isMenuItemDisabled(menu, itemMenuConditionCtx.value),
    onRowMenuAction: (row, menu, event) => {
      handleMenuAction(menu, {
        event,
        layer: itemMenuHost.value,
        mapId: mapId.value,
        value: convertFeatureToItem(row.feature),
      });
    },
  }),
);

onMounted(async () => {
  bindController(controller.value);
  const queued = takePendingAttributeTableSelectRows(mapId.value);
  if (queued) {
    show.value = true;
    await controller.value.load('initial');
    await controller.value.selectIds(queued);
    return;
  }
  await controller.value.load('initial');
});
onUnmounted(() => {
  unsub?.();
  controller.value.dispose();
  clearAttributeTableHighlight();
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="bind">
      <DraggableItemPopup
        v-bind="{ ...bind, ...panelBind }"
        :show="show"
        :width="760"
        :height="460"
        @close="handleClose"
        @update:show="onUpdateShow"
        :title="title"
      >
        <template #title>{{ title }}</template>
        <RegistryItem
          :componentKey="ATTRIBUTE_TABLE_COMPONENT_KEY.view"
          :defaultComponent="AttributeTableView"
          :mapId="mapId"
          v-bind="viewProps"
        />
      </DraggableItemPopup>
      <ContextMenu
        v-if="exportMenuMode"
        ref="exportMenuRef"
      >
        <ul class="context-menu layer-context-menu">
          <li
            v-for="item in exportActions"
            :key="item.id"
            class="layer-context-menu__item"
            @click.stop="onExportAction(item.id)"
          >
            <div class="layer-context-menu__item-icon">
              <SvgIcon
                :size="16"
                type="mdi"
                :path="item.icon || mdiDownload"
              />
            </div>
            <span>{{
              item.label ||
              (item.format
                ? GEO_EXPORT_FORMAT_META[item.format].name
                : item.id)
            }}</span>
          </li>
        </ul>
      </ContextMenu>
    </template>
  </ModuleContainer>
</template>
