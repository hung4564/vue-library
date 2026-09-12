<script lang="ts">
export default { name: 'attribute-table-toolbar' };
</script>
<script setup lang="ts">
import {
  resolveAttributeTableUi,
  type AttributeTableToolbarProps,
} from '@hungpvq/map-dataset/attribute-table';
import { MapControlButton } from '@hungpvq/vue-map-core';
import { InputCheckbox, InputSelect, InputText } from '@hungpvq/vue-map-core/fields';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronDown, mdiDownload } from '@mdi/js';
import { computed } from 'vue';

const props = defineProps<AttributeTableToolbarProps>();
const ui = computed(() => resolveAttributeTableUi(props.ui));
</script>
<template>
  <div class="attribute-table__toolbar">
    <div class="attribute-table__toolbar-row attribute-table__toolbar-row--primary">
      <InputText
        v-if="ui.search"
        :model-value="props.query"
        :placeholder="props.searchPlaceholder"
        @update:model-value="props.onQueryChange(String($event ?? ''))"
      />
      <MapControlButton
        v-if="ui.export"
        class="attribute-table__export"
        :disabled="props.exportDisabled || props.exportLoading"
        :loading="!!props.exportLoading"
        variant="outlined"
        size="medium"
        @click.stop="props.onExportClick($event)"
      >
        <SvgIcon
          v-if="!props.exportLoading"
          :size="16"
          type="mdi"
          :path="mdiDownload"
        />
        {{ props.exportLabel }}
        <SvgIcon
          v-if="!props.exportLoading"
          :size="16"
          type="mdi"
          :path="mdiChevronDown"
        />
      </MapControlButton>
    </div>
    <div
      v-if="ui.zoomToSelection || ui.rowFilter || ui.clearSelection"
      class="attribute-table__toolbar-row attribute-table__toolbar-row--meta"
    >
      <InputCheckbox
        v-if="ui.zoomToSelection"
        :model-value="props.zoomToSelection"
        :label="props.zoomLabel"
        @update:model-value="props.onZoomToSelectionChange(!!$event)"
      />
      <InputSelect
        v-if="ui.rowFilter"
        :model-value="props.rowFilter"
        :items="props.filterItems"
        item-value="value"
        item-text="text"
        @update:model-value="
          props.onRowFilterChange(
            $event === 'selected' ? 'selected' : 'all',
          )
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
