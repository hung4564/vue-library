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
const focusedRowId = ref<string | null>(null);
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

watch(
  () => props.windowedRows.map((r) => r.id).join('\0'),
  () => {
    const ids = props.windowedRows.map((r) => r.id);
    if (!ids.length) {
      focusedRowId.value = null;
      return;
    }
    if (!focusedRowId.value || !ids.includes(focusedRowId.value)) {
      focusedRowId.value = ids[0] ?? null;
    }
  },
  { immediate: true },
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

function ariaSort(key: string): 'ascending' | 'descending' | 'none' {
  const hit = props.sortStates.find((s) => s.key === key);
  if (!hit) return 'none';
  return hit.dir === 'asc' ? 'ascending' : 'descending';
}

function sortButtonLabel(column: AttributeTableColumn) {
  const state = ariaSort(column.key);
  const stateLabel =
    state === 'ascending'
      ? props.sortedAscLabel
      : state === 'descending'
        ? props.sortedDescLabel
        : props.notSortedLabel;
  return `${column.label}, ${stateLabel}`;
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
  const onSort = (append?: boolean) =>
    props.onSortColumn(column.key, !!append);
  return {
    ...base,
    onSort,
  };
}

function selectRowLabel(row: AttributeTableRow) {
  const first = props.columns[0];
  const name = first ? row.cells[first.key] : '';
  return name
    ? `${props.selectRowLabel}: ${name}`
    : `${props.selectRowLabel} ${row.id}`;
}

function focusRowAt(index: number) {
  const rows = props.windowedRows;
  if (!rows.length) return;
  const clamped = Math.max(0, Math.min(index, rows.length - 1));
  focusedRowId.value = rows[clamped]?.id ?? null;
  nextTick(() => {
    const el = scrollEl.value?.querySelector(
      `tr[data-row-id="${CSS.escape(focusedRowId.value ?? '')}"]`,
    ) as HTMLElement | null;
    el?.focus();
  });
}

function onRegionKeydown(event: KeyboardEvent) {
  const rows = props.windowedRows;
  if (!rows.length) return;
  const current = focusedRowId.value
    ? rows.findIndex((r) => r.id === focusedRowId.value)
    : 0;
  const idx = current < 0 ? 0 : current;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    focusRowAt(idx + 1);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    focusRowAt(idx - 1);
    return;
  }
  if (event.key === 'Home') {
    event.preventDefault();
    focusRowAt(0);
    return;
  }
  if (event.key === 'End') {
    event.preventDefault();
    focusRowAt(rows.length - 1);
    return;
  }
  if (event.key === ' ' || event.key === 'Enter') {
    const row = rows[idx];
    if (!row) return;
    // Don't steal Space/Enter from buttons / checkboxes / links.
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.closest('button, a, input, select, textarea') ||
        target.isContentEditable)
    ) {
      return;
    }
    event.preventDefault();
    props.onToggleRow(row);
  }
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
  <div
    v-if="props.loading"
    class="attribute-table__grid"
    role="region"
    :aria-label="props.gridRegionLabel"
    aria-busy="true"
  >
    <div class="attribute-table__status" role="status" aria-live="polite">
      {{ props.loadingLabel }}
    </div>
  </div>
  <div
    v-else-if="props.empty"
    class="attribute-table__grid"
    role="region"
    :aria-label="props.gridRegionLabel"
  >
    <div class="attribute-table__status" role="status" aria-live="polite">
      {{ props.emptyLabel }}
    </div>
  </div>
  <div
    v-else
    class="attribute-table__grid"
    role="region"
    :aria-label="props.gridRegionLabel"
  >
    <div
      ref="scrollEl"
      class="attribute-table__scroll"
      tabindex="0"
      @scroll.passive="syncScrollMetrics"
      @keydown="onRegionKeydown"
    >
      <table class="attribute-table__table" :aria-label="props.tableLabel">
        <thead>
          <tr>
            <th
              v-if="showCheckbox"
              class="attribute-table__check"
              scope="col"
            >
              <input
                type="checkbox"
                :checked="props.allVisibleSelected"
                :aria-label="props.selectAllLabel"
                @change="props.onToggleSelectAll()"
              />
            </th>
            <th
              v-for="column in props.columns"
              :key="column.key"
              scope="col"
              :aria-sort="
                isColumnSortable(column) ? ariaSort(column.key) : undefined
              "
              :class="{
                'is-sortable': isColumnSortable(column),
                'is-sorted':
                  isColumnSortable(column) &&
                  props.sortStates.some((s) => s.key === column.key),
              }"
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
              <button
                v-else-if="isColumnSortable(column)"
                type="button"
                class="attribute-table__sort-btn"
                :aria-label="sortButtonLabel(column)"
                @click="props.onSortColumn(column.key, $event.shiftKey)"
              >
                {{ column.label }}{{ sortMark(column.key) }}
              </button>
              <template v-else>{{ column.label }}</template>
            </th>
            <th
              v-if="props.itemMenus.length"
              class="attribute-table__actions"
              scope="col"
            >
              <span class="attribute-table__sr-only">{{
                props.actionsColumnLabel
              }}</span>
            </th>
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
            :data-row-id="row.id"
            :class="{
              'is-selected': props.selectedIds.has(row.id),
              'is-focused': focusedRowId === row.id,
            }"
            :style="{ height: props.rowHeight + 'px' }"
            :aria-selected="props.selectedIds.has(row.id) ? 'true' : 'false'"
            :tabindex="focusedRowId === row.id ? 0 : -1"
            @click="
              focusedRowId = row.id;
              props.onToggleRow(row);
            "
            @focus="focusedRowId = row.id"
          >
            <td
              v-if="showCheckbox"
              class="attribute-table__check"
              @click.stop
            >
              <input
                type="checkbox"
                :checked="props.selectedIds.has(row.id)"
                :aria-label="selectRowLabel(row)"
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
