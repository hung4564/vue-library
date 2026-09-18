<script lang="ts">
export default { name: 'attribute-table-toolbar' };
</script>
<script setup lang="ts">
import {
  resolveAttributeTableUi,
  type AttributeTableToolbarProps,
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
    !!props.columnFilterKey || !!String(props.columnFilterQuery ?? '').trim(),
);

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
