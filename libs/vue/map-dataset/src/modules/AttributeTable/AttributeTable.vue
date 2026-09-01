<script lang="ts">
export default {
  name: 'attribute-table',
};
</script>

<script setup lang="ts">
import { fitBounds, type WithMapPropType } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  buildAttributeTable,
  filterAttributeTableRows,
  getDatasetFeatureCollection,
  type AttributeTableColumn,
  type AttributeTableRow,
} from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  InputText,
  ModuleContainer,
  useLang,
  useMap,
} from '@hungpvq/vue-map-core';
import type { Feature } from 'geojson';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useMapDatasetHighlight } from '../../store';

const props = defineProps<
  WithMapPropType & {
    layer: IDataset;
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
    },
  },
});

const loading = ref(true);
const query = ref('');
const columns = ref<AttributeTableColumn[]>([]);
const rows = ref<AttributeTableRow[]>([]);
const selectedId = ref<string>();
let cancelled = false;

const visibleRows = computed(() =>
  filterAttributeTableRows(rows.value, query.value),
);

const title = computed(() => {
  const name = props.layer?.getName?.() || trans.value('map.attribute-table.title');
  const count = rows.value.length;
  return count
    ? `${name} (${count})`
    : trans.value('map.attribute-table.title');
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
    const table = buildAttributeTable(collection);
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

function onSelectRow(row: AttributeTableRow) {
  selectedId.value = row.id;
  const feature = row.feature as Feature;
  setFeatureHighlight(feature, 'attribute-table', props.layer);
  callMap((map) => {
    fitBounds(map, feature);
  });
}

function cellTitle(value: string) {
  return value.length > 80 ? value : undefined;
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="bind">
      <DraggableItemPopup
        v-bind="bind"
        show
        :width="720"
        :height="420"
        @close="handleClose"
        @update:show="onUpdateShow"
        :title="title"
      >
        <template #title>{{ title }}</template>
        <div class="attribute-table">
          <div class="attribute-table__toolbar">
            <InputText
              v-model="query"
              :placeholder="trans('map.attribute-table.search')"
            />
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
                  <th v-for="column in columns" :key="column.key">
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in visibleRows"
                  :key="row.id"
                  :class="{ 'is-selected': row.id === selectedId }"
                  @click="onSelectRow(row)"
                >
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
    </template>
  </ModuleContainer>
</template>
