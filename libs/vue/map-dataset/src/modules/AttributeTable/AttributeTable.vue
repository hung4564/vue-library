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
import {
  createMenuConditionContext,
  getItemMenuHost,
  getResolvedMenus,
  handleMenuAction,
  isMenuItemDisabled,
  isMenuItemHidden,
  MENU_CONTROL_ID,
} from '@hungpvq/map-dataset/menu';
import {
  clearGeoExportActiveSource,
  openGeoExportModalFromAttributeTable,
  resolveAttributeTableGeoExport,
  runGeoExportClickFromAttributeTable,
  runGeoExportFormatFromAttributeTable,
  setGeoExportActiveSource,
  type GeoExportFormat,
} from '@hungpvq/map-dataset/geo-export';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  RegistryItem,
  useLang,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/vue-map-core';
import type { Feature } from 'geojson';
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { provideMenuConditionContext } from '../../extra/menu/condition-context';
import DatasetMenus from '../../extra/menu/dataset-menus.vue';
import { useMapHighlight } from '../../store/highlight';
import AttributeTableView from './AttributeTableView.vue';

const props = defineProps<AttributeTableProps>();
provideMenuConditionContext(() => ({
  control: MENU_CONTROL_ID.attributeTable,
}));
const { mapId, moduleContainerProps, callMap } = useMap(props);
const hl = useMapHighlight(mapId.value);
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
    [props.layer, props.columns, props.store, props.rowFilter, props.ui] as const,
  () => {
    // Re-open when addComponent updates the same `check` while hidden via toggle.
    show.value = true;
    clearGeoExportActiveSource(mapId.value);
    controller.value.dispose();
    bindController(createController());
    syncGeoExportBridge();
    void controller.value.load('initial');
  },
);

watch(
  () => props.revision,
  (revision, prev) => {
    if (revision == null || revision === prev) return;
    show.value = true;
  },
);

const state = computed(() => {
  tick.value;
  return controller.value.getState();
});

const labels = computed((): AttributeTableViewLabels => ({
  search: trans.value('map.attribute-table.search'),
  zoomToSelection: trans.value('map.attribute-table.zoomToSelection'),
  showAll: trans.value('map.attribute-table.showAll'),
  showSelected: trans.value('map.attribute-table.showSelected'),
  clear: trans.value('map.attribute-table.clear'),
  loading: trans.value('map.attribute-table.loading'),
  empty: trans.value('map.attribute-table.empty'),
  page: trans.value('map.attribute-table.page'),
  of: trans.value('map.attribute-table.of'),
  prev: trans.value('map.attribute-table.prev'),
  next: trans.value('map.attribute-table.next'),
  rowsPerPage: trans.value('map.attribute-table.rowsPerPage'),
  table: trans.value('map.attribute-table.table'),
  gridRegion: trans.value('map.attribute-table.gridRegion'),
  selectAll: trans.value('map.attribute-table.selectAll'),
  selectRow: trans.value('map.attribute-table.selectRow'),
  actionsColumn: trans.value('map.attribute-table.actionsColumn'),
  rowFilter: trans.value('map.attribute-table.rowFilter'),
  sortedAsc: trans.value('map.attribute-table.sortedAsc'),
  sortedDesc: trans.value('map.attribute-table.sortedDesc'),
  notSorted: trans.value('map.attribute-table.notSorted'),
  selectionStatus: trans.value('map.attribute-table.selectionStatus'),
  export: trans.value('map.attribute-table.export'),
}));

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
  hl.hideIfSource('attribute-table');
}
/**
 * X / Escape: hide only. Keep the table mounted so `mapAttributeTable`
 * stays registered and toggle show / selectRows keep working.
 * Removal from ComponentManagement is via `onClose` from parent if needed.
 */
function handleClose() {
  show.value = false;
  clearAttributeTableHighlight();
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
  void hl.show(current.feature as Feature, {
    source: 'attribute-table',
    dataset: props.layer,
  });
  if (!s.zoomToSelection) return;
  callMap((map) => {
    fitBounds(map, current.feature as Feature, { mapId: mapId.value });
  });
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
const layerTitleMenus = computed(() =>
  getResolvedMenus(props.layer, 'layer'),
);
const itemMenuConditionCtx = computed(() =>
  createMenuConditionContext(itemMenuHost.value, { mapId: mapId.value }),
);

const viewProps = computed((): AttributeTableViewProps => {
  const geo = resolveAttributeTableGeoExport(props.layer);
  const menuMode = geo.uiMode === 'menu';
  const clickMode = geo.uiMode === 'click';
  return {
    mapId: mapId.value,
    layer: props.layer,
    controller: controller.value,
    pageSizeItems: [...ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS],
    labels: labels.value,
    ui: resolvedUi.value,
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
    onExport: menuMode
      ? undefined
      : (event) => {
          if (clickMode) {
            void runGeoExportClickFromAttributeTable({
              layer: props.layer,
              mapId: mapId.value,
              event,
            });
            return;
          }
          openGeoExportModalFromAttributeTable({
            layer: props.layer,
            mapId: mapId.value,
            event,
          });
        },
    exportFormats: menuMode ? geo.formats : undefined,
    onExportFormat: menuMode
      ? (format, event) => {
          void runGeoExportFormatFromAttributeTable({
            layer: props.layer,
            mapId: mapId.value,
            format: format as GeoExportFormat,
            event,
          });
        }
      : undefined,
  };
});

function syncGeoExportBridge() {
  setGeoExportActiveSource(mapId.value, {
    layerId: props.layer.id,
    getSearch: () => controller.value.getState().search,
    getSort: () => controller.value.getState().sortStates,
    getSelectedIds: () => controller.value.getState().selectedIds,
    resolveSelectedCollection: async (ids) => {
      const rows = await controller.value.resolveFeaturesForSelection(ids);
      return {
        type: 'FeatureCollection',
        features: rows.map((row) => row.feature as Feature),
      };
    },
    resolveFilteredCollection: async () => {
      const rows = await controller.value.resolveFilteredFeatures();
      return {
        type: 'FeatureCollection',
        features: rows.map((row) => row.feature as Feature),
      };
    },
  });
}

onMounted(async () => {
  bindController(controller.value);
  syncGeoExportBridge();
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
  clearGeoExportActiveSource(mapId.value, props.layer.id);
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
        <template #after-title>
          <DatasetMenus
            :menus="layerTitleMenus"
            :data="layer"
            :mapId="mapId"
            :locations="['title']"
          />
        </template>
        <RegistryItem
          :componentKey="ATTRIBUTE_TABLE_COMPONENT_KEY.view"
          :defaultComponent="AttributeTableView"
          :mapId="mapId"
          v-bind="viewProps"
        />
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
