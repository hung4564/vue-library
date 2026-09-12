<script lang="ts">
export default { name: 'attribute-table-grid' };
</script>
<script setup lang="ts">
import {
  getAttributeTableCellRaw,
  resolveAttributeTableComponentRef,
  type AttributeTableColumn,
  type AttributeTableGridProps,
  type AttributeTableRow,
} from '@hungpvq/map-dataset/attribute-table';
import { RegistryItem } from '@hungpvq/vue-map-core';
import DatasetMenuButton from '../../extra/menu/dataset-menu-button.vue';
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  computed,
  markRaw,
  ref,
  watch,
  type Component,
} from 'vue';

const props = defineProps<AttributeTableGridProps>();
const scrollEl = ref<HTMLElement | null>(null);
const lastTop = ref(-1);
const lastHeight = ref(-1);
let resizeObserver: ResizeObserver | null = null;

function syncScrollMetrics() {
  const el = scrollEl.value;
  if (!el) return;
  const top = el.scrollTop;
  const height = el.clientHeight;
  if (lastTop.value === top && lastHeight.value === height) return;
  lastTop.value = top;
  lastHeight.value = height;
  props.onScrollMetrics(top, height);
}

function bindObserver() {
  resizeObserver?.disconnect();
  resizeObserver = null;
  const el = scrollEl.value;
  if (!el || typeof ResizeObserver === 'undefined') return;
  resizeObserver = new ResizeObserver(() => syncScrollMetrics());
  resizeObserver.observe(el);
}

onMounted(() => {
  nextTick(() => {
    syncScrollMetrics();
    bindObserver();
  });
});

watch(
  () => [props.loading, props.empty] as const,
  () =>
    nextTick(() => {
      syncScrollMetrics();
      bindObserver();
    }),
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

function sortMark(key: string) {
  const hit = props.sortStates.find((s) => s.key === key);
  if (!hit) return '';
  const idx = props.sortStates.indexOf(hit) + 1;
  return `${hit.dir === 'asc' ? ' ↑' : ' ↓'}${
    props.sortStates.length > 1 ? idx : ''
  }`;
}

function cellTitle(value: string) {
  return value.length > 80 ? value : undefined;
}

function isColumnSortable(column: AttributeTableColumn) {
  return props.sort !== false && column.sortable !== false;
}

function resolveSlot(value: unknown) {
  const resolved = resolveAttributeTableComponentRef(value);
  const defaultComponent = resolved.defaultComponent as Component | undefined;
  return {
    componentKey: resolved.componentKey,
    defaultComponent:
      defaultComponent && typeof defaultComponent === 'object'
        ? markRaw(defaultComponent)
        : defaultComponent,
  };
}

function cellRaw(row: AttributeTableRow, column: AttributeTableColumn) {
  return getAttributeTableCellRaw(row, column);
}

function headerSortMeta(column: AttributeTableColumn) {
  const sortable = isColumnSortable(column);
  if (!sortable) return { sortable: false as const };
  const hit = props.sortStates.find((s) => s.key === column.key);
  const base = hit
    ? {
        sortable: true as const,
        sortDir: hit.dir,
        sortOrder: props.sortStates.indexOf(hit) + 1,
        sortCount: props.sortStates.length,
      }
    : { sortable: true as const };
  return {
    ...base,
    onSort: (append?: boolean) =>
      props.onSortColumn(column.key, !!append),
  };
}

const showCheckbox = computed(() => props.checkbox !== false);
const colSpan = computed(
  () =>
    props.columns.length +
    (showCheckbox.value ? 1 : 0) +
    (props.itemMenus.length ? 1 : 0),
);
</script>
<template>
  <div v-if="props.loading" class="attribute-table__grid">
    <div class="attribute-table__status">{{ props.loadingLabel }}</div>
  </div>
  <div v-else-if="props.empty" class="attribute-table__grid">
    <div class="attribute-table__status">{{ props.emptyLabel }}</div>
  </div>
  <div v-else class="attribute-table__grid">
    <div
      ref="scrollEl"
      class="attribute-table__scroll"
      @scroll.passive="syncScrollMetrics"
    >
      <table class="attribute-table__table">
        <thead>
          <tr>
            <th v-if="showCheckbox" class="attribute-table__check">
              <input
                type="checkbox"
                :checked="props.allVisibleSelected"
                @change="props.onToggleSelectAll()"
              />
            </th>
            <th
              v-for="column in props.columns"
              :key="column.key"
              :class="{
                'is-sortable':
                  isColumnSortable(column) && !column.headerComponent,
                'is-sorted':
                  isColumnSortable(column) &&
                  props.sortStates.some((s) => s.key === column.key),
              }"
              @click="
                !column.headerComponent &&
                  isColumnSortable(column) &&
                  props.onSortColumn(column.key, $event.shiftKey)
              "
            >
              <RegistryItem
                v-if="column.headerComponent"
                :mapId="props.mapId"
                :label="column.label"
                :column="column"
                v-bind="{
                  ...resolveSlot(column.headerComponent),
                  ...headerSortMeta(column),
                }"
              />
              <template v-else>
                {{ column.label
                }}{{ isColumnSortable(column) ? sortMark(column.key) : '' }}
              </template>
            </th>
            <th
              v-if="props.itemMenus.length"
              class="attribute-table__actions"
            />
          </tr>
        </thead>
        <tbody>
          <tr
            v-if="props.virtualWindow.offsetY > 0"
            class="attribute-table__spacer"
            aria-hidden="true"
          >
            <td
              :colspan="colSpan"
              :style="{
                height: props.virtualWindow.offsetY + 'px',
                padding: 0,
                border: 0,
              }"
            />
          </tr>
          <tr
            v-for="row in props.windowedRows"
            :key="row.id"
            :class="{ 'is-selected': props.selectedIds.has(row.id) }"
            :style="{ height: props.rowHeight + 'px' }"
            @click="props.onToggleRow(row)"
          >
            <td
              v-if="showCheckbox"
              class="attribute-table__check"
              @click.stop
            >
              <input
                type="checkbox"
                :checked="props.selectedIds.has(row.id)"
                @change="props.onToggleRow(row)"
              />
            </td>
            <td
              v-for="column in props.columns"
              :key="column.key"
              :title="cellTitle(row.cells[column.key] ?? '')"
            >
              <RegistryItem
                v-if="column.cellComponent"
                v-bind="resolveSlot(column.cellComponent)"
                :mapId="props.mapId"
                :value="row.cells[column.key] ?? ''"
                :raw="cellRaw(row, column)"
                :row="row"
                :column="column"
              />
              <template v-else>{{ row.cells[column.key] }}</template>
            </td>
            <td
              v-if="props.itemMenus.length"
              class="attribute-table__actions"
              @click.stop
            >
              <DatasetMenuButton
                v-for="(menu, index) in props.itemMenus"
                :key="menu.id || index"
                :item="menu"
                :data="props.itemMenuHost"
                :mapId="props.mapId"
                :disabled="props.isMenuDisabled(menu)"
                @click="props.onRowMenuAction(row, menu, $event)"
              />
            </td>
          </tr>
          <tr
            v-if="props.bottomSpacerHeight > 0"
            class="attribute-table__spacer"
            aria-hidden="true"
          >
            <td
              :colspan="colSpan"
              :style="{
                height: props.bottomSpacerHeight + 'px',
                padding: 0,
                border: 0,
              }"
            />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
