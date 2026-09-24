<script lang="ts">
export default { name: 'attribute-table-toolbar' };
</script>
<script setup lang="ts">
import {
  type AttributeTableToolbarProps,
  resolveAttributeTableUi,
} from '@hungpvq/map-dataset/attribute-table';
import {
  GEO_EXPORT_FORMAT_META,
  type GeoExportFormat,
} from '@hungpvq/map-dataset/geo-export';
import { MapControlButton } from '@hungpvq/vue-map-core';
import { InputSelect, InputText } from '@hungpvq/vue-map-core/fields';
import { computed, ref } from 'vue';

const props = defineProps<AttributeTableToolbarProps>();
const ui = computed(() => resolveAttributeTableUi(props.ui));
const menuOpen = ref(false);

const formatItems = computed(() =>
  (props.exportFormats ?? []).map((fmt) => ({
    value: fmt,
    text: GEO_EXPORT_FORMAT_META[fmt as GeoExportFormat]?.name ?? String(fmt),
  })),
);

const hasColumnFilter = computed(
  () =>
    !!props.columnFilterKey ||
    !!String(props.columnFilterQuery ?? '').trim() ||
    props.columnFilterMode !== 'contains',
);

const visibleKeySet = computed(() => new Set(props.visibleColumnKeys));

function isColumnVisible(key: string) {
  if (props.columnVisibilityAll) return true;
  return visibleKeySet.value.has(key);
}

function toggleColumnVisibility(key: string) {
  const allKeys = props.columnVisibilityItems.map((i) => String(i.value));
  if (props.columnVisibilityAll) {
    props.onVisibleColumnKeysChange(allKeys.filter((k) => k !== key));
    return;
  }
  const next = new Set(props.visibleColumnKeys);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  if (next.size === allKeys.length) {
    props.onShowAllColumns();
    return;
  }
  props.onVisibleColumnKeysChange(Array.from(next));
}

function onExportClick(event: MouseEvent) {
  if (props.exportFormats?.length && props.onExportFormat) {
    menuOpen.value = !menuOpen.value;
    return;
  }
  props.onExport?.(event);
}

function onFormatPick(fmt: string, event: MouseEvent) {
  menuOpen.value = false;
  props.onExportFormat?.(fmt, event);
}
</script>
<template>
  <div class="attribute-table__toolbar">
    <div
      class="attribute-table__toolbar-row attribute-table__toolbar-row--primary"
    >
      <InputText
        v-if="ui.search"
        :model-value="props.query"
        :placeholder="props.searchPlaceholder"
        :aria-label="props.searchLabel"
        @update:model-value="props.onQueryChange(String($event ?? ''))"
      />
      <div
        v-if="ui.export && (props.onExport || props.onExportFormat)"
        class="attribute-table__export"
      >
        <MapControlButton
          variant="outlined"
          size="medium"
          @click="onExportClick($event)"
        >
          {{ props.exportLabel || 'Export' }}
        </MapControlButton>
        <ul
          v-if="menuOpen && formatItems.length"
          class="attribute-table__export-menu"
          role="menu"
        >
          <li
            v-for="item in formatItems"
            :key="String(item.value)"
            role="menuitem"
            @click="onFormatPick(String(item.value), $event)"
          >
            {{ item.text }}
          </li>
        </ul>
      </div>
    </div>
    <div
      v-if="ui.columnFilter && props.columnFilterItems.length"
      class="attribute-table__toolbar-row attribute-table__toolbar-row--column-filter"
    >
      <InputSelect
        :model-value="props.columnFilterKey"
        :items="props.columnFilterItems"
        item-value="value"
        item-text="text"
        :aria-label="props.columnFilterLabel"
        @update:model-value="
          props.onColumnFilterKeyChange(String($event ?? ''))
        "
      />
      <InputSelect
        :model-value="props.columnFilterMode"
        :items="props.columnFilterModeItems"
        item-value="value"
        item-text="text"
        :aria-label="props.columnFilterModeLabel"
        @update:model-value="
          props.onColumnFilterModeChange(String($event ?? 'contains'))
        "
      />
      <InputText
        :model-value="props.columnFilterQuery"
        :placeholder="props.columnFilterQueryPlaceholder"
        :aria-label="props.columnFilterQueryPlaceholder"
        :disabled="!props.columnFilterKey"
        @update:model-value="
          props.onColumnFilterQueryChange(String($event ?? ''))
        "
      />
      <MapControlButton
        variant="outlined"
        size="small"
        :disabled="!hasColumnFilter"
        @click="props.onClearColumnFilters()"
      >
        {{ props.clearColumnFilterLabel }}
      </MapControlButton>
    </div>
    <div
      v-if="ui.columnVisibility && props.columnVisibilityItems.length"
      class="attribute-table__toolbar-row attribute-table__toolbar-row--columns"
      role="group"
      :aria-label="props.columnVisibilityLabel"
    >
      <span class="attribute-table__columns-label">{{
        props.columnVisibilityLabel
      }}</span>
      <div class="attribute-table__columns-chips">
        <MapControlButton
          class="attribute-table__column-chip attribute-table__column-chip--all"
          :variant="props.columnVisibilityAll ? 'text' : 'outlined'"
          size="small"
          :disabled="props.columnVisibilityAll"
          :title="props.columnsShowAllLabel"
          @click="props.onShowAllColumns()"
        >
          {{ props.columnsShowAllLabel }}
        </MapControlButton>
        <MapControlButton
          v-for="item in props.columnVisibilityItems"
          :key="String(item.value)"
          class="attribute-table__column-chip"
          :variant="isColumnVisible(String(item.value)) ? 'tonal' : 'outlined'"
          size="small"
          :active="isColumnVisible(String(item.value))"
          :title="String(item.text)"
          @click="toggleColumnVisibility(String(item.value))"
        >
          {{ item.text }}
        </MapControlButton>
      </div>
    </div>
    <div
      v-if="ui.zoomToSelection || ui.rowFilter || ui.clearSelection"
      class="attribute-table__toolbar-row attribute-table__toolbar-row--meta"
    >
      <MapControlButton
        v-if="ui.zoomToSelection"
        variant="outlined"
        :disabled="props.zoomDisabled"
        @click="props.onZoomToSelection()"
      >
        {{ props.zoomLabel }}
      </MapControlButton>
      <InputSelect
        v-if="ui.rowFilter"
        :model-value="props.rowFilter"
        :items="props.filterItems"
        item-value="value"
        item-text="text"
        :aria-label="props.rowFilterLabel"
        @update:model-value="
          props.onRowFilterChange($event === 'selected' ? 'selected' : 'all')
        "
      />
      <MapControlButton
        v-if="ui.clearSelection"
        class="attribute-table__clear"
        :disabled="props.clearDisabled"
        variant="outlined"
        size="medium"
        @click="props.onClearSelection()"
      >
        {{ props.clearLabel }}
      </MapControlButton>
    </div>
  </div>
</template>
