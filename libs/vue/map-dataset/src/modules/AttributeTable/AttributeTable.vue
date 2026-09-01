<script lang="ts">
export default {
  name: 'attribute-table',
};
</script>

<script setup lang="ts">
import { fitBounds, type WithMapPropType } from '@hungpvq/map-core';
import type { IDataset, MenuAction } from '@hungpvq/map-dataset';
import {
  attributeTableRowsToFeatureCollection,
  buildAttributeTable,
  createExportGeoSubmenu,
  createMenuItemExportGeo,
  filterAttributeTableRows,
  getDatasetFeatureCollection,
  getExportGeoMenuOptions,
  handleMenuAction,
  type AttributeTableColumn,
  type AttributeTableColumnsOption,
  type AttributeTableRow,
} from '@hungpvq/map-dataset';
import { ContextMenu } from '@hungpvq/vue-content-menu';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  InputCheckbox,
  InputSelect,
  InputText,
  ModuleContainer,
  useLang,
  useMap,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronDown, mdiDownload } from '@mdi/js';
import type { Feature, FeatureCollection } from 'geojson';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useMapDatasetHighlight } from '../../store';

const props = defineProps<
  WithMapPropType & {
    layer: IDataset;
    columns?: AttributeTableColumnsOption;
  }
>();

const emit = defineEmits<{ close: [] }>();
const { mapId, moduleContainerProps, callMap } = useMap(props);
const { setFeatureHighlight, getHighlightSource } =
  useMapDatasetHighlight(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: {
    'attribute-table': {
      title: 'Attribute table',
      search: 'Search',
      empty: 'No features',
      loading: 'Loading…',
      zoomToSelection: 'Zoom to selection',
      showAll: 'All rows',
      showSelected: 'Selected',
      clear: 'Clear selection',
      export: 'Export',
    },
  },
});

const loading = ref(true);
const query = ref('');
const columns = ref<AttributeTableColumn[]>([]);
const rows = ref<AttributeTableRow[]>([]);
const selectedIds = ref<string[]>([]);
const zoomToSelection = ref(false);
const rowFilter = ref<'all' | 'selected'>('all');
let cancelled = false;

const filterItems = computed(() => [
  { value: 'all', text: trans.value('map.attribute-table.showAll') },
  { value: 'selected', text: trans.value('map.attribute-table.showSelected') },
]);

const searchedRows = computed(() =>
  filterAttributeTableRows(rows.value, query.value),
);

const visibleRows = computed(() => {
  if (rowFilter.value !== 'selected') return searchedRows.value;
  const selected = new Set(selectedIds.value);
  return searchedRows.value.filter((row) => selected.has(row.id));
});

const selectedSet = computed(() => new Set(selectedIds.value));

const allVisibleSelected = computed(
  () =>
    visibleRows.value.length > 0 &&
    visibleRows.value.every((row) => selectedSet.value.has(row.id)),
);

const title = computed(() => {
  const name =
    props.layer?.getName?.() || trans.value('map.attribute-table.title');
  const count = rows.value.length;
  const selected = selectedIds.value.length;
  if (!count) return trans.value('map.attribute-table.title');
  return selected
    ? `${name} (${count}, ${selected} selected)`
    : `${name} (${count})`;
});

onMounted(async () => {
  try {
    const collection = await getDatasetFeatureCollection(props.layer);
    if (cancelled) return;
    if (!collection) {
      columns.value = [];
      rows.value = [];
      return;
    }
    const table = buildAttributeTable(collection, props.columns);
    columns.value = table.columns;
    rows.value = table.rows;
  } finally {
    if (!cancelled) loading.value = false;
  }
});

onUnmounted(() => {
  cancelled = true;
  clearAttributeTableHighlight();
});

function clearAttributeTableHighlight() {
  if (getHighlightSource()?.value === 'attribute-table') {
    setFeatureHighlight(undefined, 'attribute-table');
  }
}

function handleClose() {
  clearAttributeTableHighlight();
  emit('close');
}

function onUpdateShow(val: boolean) {
  if (!val) handleClose();
}

function selectedRowsFrom(ids: string[]): AttributeTableRow[] {
  const set = new Set(ids);
  return rows.value.filter((row) => set.has(row.id));
}

function applySelection(focus?: AttributeTableRow) {
  const selected = selectedRowsFrom(selectedIds.value);
  if (selected.length === 0) {
    clearAttributeTableHighlight();
    return;
  }
  const current = focus ?? selected[selected.length - 1];
  setFeatureHighlight(current.feature as Feature, 'attribute-table', props.layer);
  if (!zoomToSelection.value) return;
  const boundsValue: Feature | FeatureCollection =
    selected.length === 1
      ? (current.feature as Feature)
      : {
          type: 'FeatureCollection',
          features: selected.map((row) => row.feature),
        };
  callMap((map) => {
    fitBounds(map, boundsValue);
  });
}

function toggleRow(row: AttributeTableRow) {
  const exists = selectedIds.value.includes(row.id);
  selectedIds.value = exists
    ? selectedIds.value.filter((id) => id !== row.id)
    : [...selectedIds.value, row.id];
  applySelection(exists ? undefined : row);
}

function toggleSelectAll() {
  if (allVisibleSelected.value) {
    const visible = new Set(visibleRows.value.map((row) => row.id));
    selectedIds.value = selectedIds.value.filter((id) => !visible.has(id));
    applySelection();
    return;
  }
  const next = new Set(selectedIds.value);
  visibleRows.value.forEach((row) => next.add(row.id));
  selectedIds.value = Array.from(next);
  applySelection();
}

function clearSelection() {
  selectedIds.value = [];
  clearAttributeTableHighlight();
}

const exportMenuItem = createMenuItemExportGeo({
  filename: (layer) => `${layer.getName?.() || 'layer'}-table`,
  getCollection: () =>
    visibleRows.value.length
      ? attributeTableRowsToFeatureCollection(visibleRows.value)
      : null,
});

const exportChildren = computed(() =>
  createExportGeoSubmenu(getExportGeoMenuOptions(exportMenuItem)),
);

const exportMenuRef = ref<{
  open: (event: MouseEvent) => void;
  close: () => void;
}>();

function onExportClick(event: MouseEvent) {
  if (visibleRows.value.length === 0) return;
  exportMenuRef.value?.open(event);
}

function onExportChild(action: MenuAction, event: MouseEvent) {
  handleMenuAction(action, {
    event,
    layer: props.layer,
    mapId: mapId.value,
    value: props.layer,
  });
  exportMenuRef.value?.close();
}

function cellTitle(value: string) {
  return value.length > 80 ? value : undefined;
}

watch(zoomToSelection, (enabled) => {
  if (enabled) applySelection();
});
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="bind">
      <DraggableItemPopup
        v-bind="bind"
        show
        :width="760"
        :height="460"
        @close="handleClose"
        @update:show="onUpdateShow"
        :title="title"
      >
        <template #title>{{ title }}</template>
        <div class="attribute-table">
          <div class="attribute-table__toolbar">
            <div class="attribute-table__toolbar-row">
              <InputText
                v-model="query"
                :placeholder="trans('map.attribute-table.search')"
              />
              <BaseButton
                class="attribute-table__export"
                :disabled="visibleRows.length === 0"
                @click.stop="onExportClick"
              >
                <SvgIcon :size="16" type="mdi" :path="mdiDownload" />
                {{ trans('map.attribute-table.export') }}
                <SvgIcon :size="16" type="mdi" :path="mdiChevronDown" />
              </BaseButton>
            </div>
            <div class="attribute-table__toolbar-row">
              <InputCheckbox
                v-model="zoomToSelection"
                :label="trans('map.attribute-table.zoomToSelection')"
              />
              <InputSelect
                v-model="rowFilter"
                :items="filterItems"
                item-value="value"
                item-text="text"
              />
              <BaseButton
                class="attribute-table__clear"
                :disabled="selectedIds.length === 0"
                @click="clearSelection"
              >
                {{ trans('map.attribute-table.clear') }}
              </BaseButton>
            </div>
          </div>
          <div v-if="loading" class="attribute-table__status">
            {{ trans('map.attribute-table.loading') }}
          </div>
          <div
            v-else-if="visibleRows.length === 0"
            class="attribute-table__status"
          >
            {{ trans('map.attribute-table.empty') }}
          </div>
          <div v-else class="attribute-table__scroll">
            <table class="attribute-table__table">
              <thead>
                <tr>
                  <th class="attribute-table__check">
                    <input
                      type="checkbox"
                      :checked="allVisibleSelected"
                      @change="toggleSelectAll"
                    />
                  </th>
                  <th v-for="column in columns" :key="column.key">
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in visibleRows"
                  :key="row.id"
                  :class="{ 'is-selected': selectedSet.has(row.id) }"
                  @click="toggleRow(row)"
                >
                  <td class="attribute-table__check" @click.stop>
                    <input
                      type="checkbox"
                      :checked="selectedSet.has(row.id)"
                      @change="toggleRow(row)"
                    />
                  </td>
                  <td
                    v-for="column in columns"
                    :key="column.key"
                    :title="cellTitle(row.cells[column.key] ?? '')"
                  >
                    {{ row.cells[column.key] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </DraggableItemPopup>
      <ContextMenu ref="exportMenuRef">
        <ul class="context-menu layer-context-menu">
          <li
            v-for="(child, index) in exportChildren"
            :key="child.id || index"
            class="layer-context-menu__item"
            @click.stop="onExportChild(child, $event)"
          >
            <div class="layer-context-menu__item-icon">
              <SvgIcon
                size="16"
                type="mdi"
                :path="('icon' in child && child.icon) || mdiDownload"
              />
            </div>
            <span>{{ 'name' in child ? child.name : '' }}</span>
          </li>
        </ul>
      </ContextMenu>
    </template>
  </ModuleContainer>
</template>
