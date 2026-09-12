<script setup lang="ts">
import { runMapControlAction, type MapSimple } from '@hungpvq/map-core';
import { type IDataset } from '@hungpvq/map-dataset';
import {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  ATTRIBUTE_TABLE_CONTROL,
  createAttributeTableStoreFromDataset,
  queueAttributeTableSelectRows,
} from '@hungpvq/map-dataset/attribute-table';
import {
  attributeTableDemoLogger,
  DATA_MANAGEMENT_HTTP_CUSTOM_LIST_NAME,
  DATA_MANAGEMENT_HTTP_LIST_NAME,
  DATA_MANAGEMENT_LOCAL_GEOJSON_LIST_NAME,
  DATA_MANAGEMENT_LOCAL_LIST_NAME,
  DATA_MANAGEMENT_MEMORY_LIST_NAME,
} from '@hungpvq/demo-map-datasets';
import { getUUIDv4 } from '@hungpvq/shared';
import {
  BaseMapCard,
  BaseMapControl,
  EventManagementControl,
  Map,
  MapControlButton,
  UniversalRegistry,
  WorkerControl,
} from '@hungpvq/vue-map-core';
import {
  AttributeTableGrid,
  AttributeTablePager,
  AttributeTableToolbar,
  AttributeTableView,
  ComponentManagementControl,
  IdentifyControl,
  LayerControl,
  useMapDatasetComponent,
} from '@hungpvq/vue-map-dataset';
import { computed, ref, watch } from 'vue';
import AsideControl from '../../layout/aside-control.vue';
import { loadDataManagementDemoDatasets } from '../../data/loaders';
import SampleAttributeTableGrid from './sample-attribute-table-grid.vue';
import SampleAttributeTablePager from './sample-attribute-table-pager.vue';
import SampleAttributeTableToolbar from './sample-attribute-table-toolbar.vue';
import SampleAttributeTableView from './sample-attribute-table-view.vue';
import SampleAttributeTableCell from './sample-attribute-table-cell.vue';
import SampleAttributeTableHeader from './sample-attribute-table-header.vue';

const mapId = ref(getUUIDv4());
const { addComponent } = useMapDatasetComponent(mapId.value);

type LayerKey =
  | 'http'
  | 'httpCustom'
  | 'localGeojson'
  | 'localList'
  | 'memory';
/** `ATTRIBUTE_TABLE_COMPONENT_KEY` parts, or `all` = toolbar+grid+pager. */
type OverrideKey = 'default' | 'toolbar' | 'grid' | 'pager' | 'all' | 'view';

const KEY = ATTRIBUTE_TABLE_COMPONENT_KEY;
const SAMPLE_CELL_KEY = 'attribute-table-demo-name-cell';
const SAMPLE_HEADER_KEY = 'attribute-table-demo-name-header';

const layerOptions: { key: LayerKey; label: string }[] = [
  { key: 'http', label: DATA_MANAGEMENT_HTTP_LIST_NAME },
  { key: 'httpCustom', label: DATA_MANAGEMENT_HTTP_CUSTOM_LIST_NAME },
  { key: 'localGeojson', label: DATA_MANAGEMENT_LOCAL_GEOJSON_LIST_NAME },
  { key: 'localList', label: DATA_MANAGEMENT_LOCAL_LIST_NAME },
  { key: 'memory', label: DATA_MANAGEMENT_MEMORY_LIST_NAME },
];

const overrideOptions: { key: OverrideKey; label: string }[] = [
  { key: 'default', label: 'default (plugin)' },
  { key: 'toolbar', label: KEY.toolbar },
  { key: 'grid', label: KEY.grid },
  { key: 'pager', label: KEY.pager },
  { key: 'all', label: `${KEY.toolbar} + ${KEY.grid} + ${KEY.pager}` },
  { key: 'view', label: KEY.view },
];

const DEMO_COLUMNS = [
  {
    key: 'name',
    label: 'Name',
    format: (value: unknown) =>
      typeof value === 'string' ? value.toUpperCase() : String(value ?? ''),
  },
  { key: 'id', label: 'ID', sortable: false as const },
  { key: '__geometry', label: 'Geometry', sortable: false as const },
];

const selectedKey = ref<LayerKey>('http');
const overrideKey = ref<OverrideKey>('all');
const lists = ref<Partial<Record<LayerKey, IDataset>>>({});
const lastPageHint = ref('');

const selectedLayer = computed(() => lists.value[selectedKey.value]);

function registerOverrides(id: string, mode: OverrideKey) {
  UniversalRegistry.registerComponentForMap(id, KEY.view, AttributeTableView);
  UniversalRegistry.registerComponentForMap(
    id,
    KEY.toolbar,
    AttributeTableToolbar,
  );
  UniversalRegistry.registerComponentForMap(id, KEY.grid, AttributeTableGrid);
  UniversalRegistry.registerComponentForMap(id, KEY.pager, AttributeTablePager);

  if (mode === 'default') return;

  if (mode === 'view') {
    UniversalRegistry.registerComponentForMap(
      id,
      KEY.view,
      SampleAttributeTableView,
    );
    return;
  }

  if (mode === 'toolbar' || mode === 'all') {
    UniversalRegistry.registerComponentForMap(
      id,
      KEY.toolbar,
      SampleAttributeTableToolbar,
    );
  }
  if (mode === 'grid' || mode === 'all') {
    UniversalRegistry.registerComponentForMap(
      id,
      KEY.grid,
      SampleAttributeTableGrid,
    );
  }
  if (mode === 'pager' || mode === 'all') {
    UniversalRegistry.registerComponentForMap(
      id,
      KEY.pager,
      SampleAttributeTablePager,
    );
  }
}

function openAttributeTable(withColumns = false, withUi = false) {
  const layer = selectedLayer.value;
  if (!layer) return;
  addComponent({
    componentKey: KEY.root,
    attr: {
      layer,
      mapId: mapId.value,
      ...(withColumns ? { columns: [...DEMO_COLUMNS] } : {}),
      ...(withUi
        ? {
            ui: {
              search: true,
              export: false,
              pager: true,
              checkbox: true,
              sort: false,
            },
          }
        : {}),
    },
    check: `${KEY.root}:${layer.id}`,
  });
}

function openAttributeTableWithCells() {
  const layer = selectedLayer.value;
  if (!layer) return;
  UniversalRegistry.registerComponentForMap(
    mapId.value,
    SAMPLE_CELL_KEY,
    SampleAttributeTableCell,
  );
  UniversalRegistry.registerComponentForMap(
    mapId.value,
    SAMPLE_HEADER_KEY,
    SampleAttributeTableHeader,
  );
  addComponent({
    componentKey: KEY.root,
    attr: {
      layer,
      mapId: mapId.value,
      columns: [
        {
          key: 'name',
          label: 'Name',
          cellComponent: SAMPLE_CELL_KEY,
          headerComponent: SAMPLE_HEADER_KEY,
        },
        {
          key: 'id',
          label: 'ID',
          cellComponent: SampleAttributeTableCell,
          headerComponent: SampleAttributeTableHeader,
          sortable: false,
        },
        { key: '__geometry', label: 'Geometry', sortable: false },
      ],
    },
    check: `${KEY.root}:${layer.id}`,
  });
}

function queueSelectRows() {
  if (!selectedLayer.value) return;
  openAttributeTable();
  const ids =
    selectedKey.value === 'httpCustom' ? ['L1', 'L2'] : ['1', '2'];
  queueAttributeTableSelectRows(mapId.value, ids);
}

function selectRowsAction() {
  const ids = selectedKey.value === 'httpCustom' ? ['L3'] : ['3'];
  runMapControlAction(
    mapId.value,
    ATTRIBUTE_TABLE_CONTROL.id,
    ATTRIBUTE_TABLE_CONTROL.actionSelectRows,
    { ids },
  );
}

function toggleShow() {
  runMapControlAction(mapId.value, ATTRIBUTE_TABLE_CONTROL.id);
}

async function loadPage() {
  const layer = selectedLayer.value;
  if (!layer) return;
  const store = createAttributeTableStoreFromDataset(layer, {
    columns: [...DEMO_COLUMNS],
  });
  const page = await store.list({
    intent: 'page',
    page: 1,
    pageSize: 5,
  });
  lastPageHint.value = `${page.rows.length}/${page.total} · intent:page`;
  attributeTableDemoLogger.info('store.list page', page);
}

async function onMapLoaded(map: MapSimple) {
  registerOverrides(map.id, overrideKey.value);
  const result = await loadDataManagementDemoDatasets(map.id);
  lists.value = {
    http: result.lists.http,
    httpCustom: result.lists.httpCustom,
    localGeojson: result.lists.localGeojson,
    localList: result.lists.localList,
    memory: result.lists.memory,
  };
}

watch(overrideKey, (mode) => registerOverrides(mapId.value, mode));
</script>

<template>
  <Map @map-loaded="onMapLoaded" :mapId="mapId">
    <AsideControl position="top-left" />
    <BaseMapControl
      position="bottom-left"
      default-base-map="Google Satellite"
    />
    <LayerControl position="top-left" show>
      <template #endList="{ mapId: mid }">
        <BaseMapCard :mapId="mid" />
      </template>
    </LayerControl>
    <ComponentManagementControl />
    <EventManagementControl position="top-left" />
    <IdentifyControl position="top-right" />
    <WorkerControl position="top-left" />

    <div class="at-panel">
      <section class="at-card">
        <strong>Attribute table</strong>

        <label class="at-card__label">
          Layer
          <select v-model="selectedKey">
            <option v-for="opt in layerOptions" :key="opt.key" :value="opt.key">
              {{ opt.label }}
            </option>
          </select>
        </label>

        <label class="at-card__label">
          registerComponentForMap key
          <select v-model="overrideKey">
            <option
              v-for="opt in overrideOptions"
              :key="opt.key"
              :value="opt.key"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>

        <div class="at-card__section">addComponent ({{ KEY.root }})</div>
        <div class="at-card__actions">
          <MapControlButton
            variant="outlined"
            size="small"
            @click="openAttributeTable()"
          >
            Open
          </MapControlButton>
          <MapControlButton
            variant="outlined"
            size="small"
            @click="openAttributeTable(true)"
          >
            Open + columns
          </MapControlButton>
          <MapControlButton
            variant="outlined"
            size="small"
            @click="openAttributeTable(false, true)"
          >
            Open + ui (sort off)
          </MapControlButton>
          <MapControlButton
            variant="outlined"
            size="small"
            @click="openAttributeTableWithCells"
          >
            Open + cell/header
          </MapControlButton>
          <MapControlButton
            variant="outlined"
            size="small"
            @click="loadPage"
          >
            store.list (page)
          </MapControlButton>
        </div>
        <div class="at-card__meta">
          Open + cell/header: Name header calls <code>onSort</code> (Shift =
          multi-sort); ID header is not sortable. Layer
          <code>GeoJSON features</code> uses
          <code>createDatasetPartAttributeTable</code> (wins over menu
          columns).
        </div>
        <div v-if="lastPageHint" class="at-card__meta">{{ lastPageHint }}</div>

        <div class="at-card__section">
          {{ ATTRIBUTE_TABLE_CONTROL.id }}
        </div>
        <div class="at-card__actions">
          <MapControlButton
            variant="outlined"
            size="small"
            @click="queueSelectRows"
          >
            queueAttributeTableSelectRows
          </MapControlButton>
          <MapControlButton
            variant="outlined"
            size="small"
            @click="selectRowsAction"
          >
            {{ ATTRIBUTE_TABLE_CONTROL.actionSelectRows }}
          </MapControlButton>
          <MapControlButton
            variant="outlined"
            size="small"
            @click="toggleShow"
          >
            toggle show
          </MapControlButton>
        </div>
      </section>
    </div>
  </Map>
</template>

<style>
.at-panel {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  width: min(380px, calc(100vw - 24px));
  max-height: calc(100% - 24px);
  overflow: auto;
}
.at-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.at-card__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  font-weight: 600;
}
.at-card__label select {
  font: inherit;
  font-weight: 400;
  padding: 4px 6px;
}
.at-card__meta {
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.8;
}
.at-card__section {
  margin: 12px 0 6px;
  font-weight: 600;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  opacity: 0.8;
}
.at-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
