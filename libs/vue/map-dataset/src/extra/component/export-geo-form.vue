<script lang="ts">
export default { name: 'export-geo-form' };
</script>
<script setup lang="ts">
import {
  GEO_EXPORT_COMPONENT_KEY,
  resolveGeoExportUiSlot,
} from '@hungpvq/map-dataset/geo-export';
import { MapControlButton, RegistryItem } from '@hungpvq/vue-map-core';
import { InputCrs, InputSelect, InputText } from '@hungpvq/vue-map-core/fields';
import { computed, markRaw, type Component } from 'vue';
import ExportGeoLoading from './export-geo-loading.vue';

const props = defineProps<{
  format: string;
  formatItems: { value: string; text: string }[];
  scope: string;
  scopeItems: { value: string; text: string }[];
  showScope: boolean;
  filename: string;
  target: string;
  sourceHint: string;
  error: string;
  busy: boolean;
  onFormatChange: (value: string) => void;
  onScopeChange: (value: string) => void;
  onFilenameChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onCancel: () => void;
  onDownload: () => void;
  /** Local loading override: Registry key or Vue component. */
  loadingComponent?: unknown;
}>();

const loadingSlot = computed(() => {
  const slot = resolveGeoExportUiSlot(
    props.loadingComponent,
    GEO_EXPORT_COMPONENT_KEY.loading,
    ExportGeoLoading,
  );
  const def = slot.defaultComponent;
  return {
    componentKey: slot.componentKey,
    defaultComponent:
      def && typeof def === 'object'
        ? markRaw(def as Component)
        : (def as Component | undefined),
  };
});
</script>

<template>
  <div class="export-geo">
    <InputText
      :model-value="filename"
      label="Filename"
      :disabled="busy"
      @update:model-value="onFilenameChange(String($event ?? ''))"
    />
    <InputSelect
      v-if="showScope"
      :model-value="scope"
      label="Data scope"
      :items="scopeItems"
      item-value="value"
      item-text="text"
      :disabled="busy"
      @update:model-value="onScopeChange(String($event ?? 'all'))"
    />
    <InputSelect
      :model-value="format"
      label="File format"
      :items="formatItems"
      item-value="value"
      item-text="text"
      :disabled="busy"
      @update:model-value="onFormatChange(String($event ?? 'geojson'))"
    />
    <InputCrs
      :model-value="target"
      label="Coordinate reference system"
      placeholder="Search or enter EPSG code"
      @update:model-value="onTargetChange(String($event ?? ''))"
    />
    <p class="export-geo__hint">{{ sourceHint }}</p>
    <RegistryItem
      v-if="busy"
      :componentKey="loadingSlot.componentKey"
      :defaultComponent="loadingSlot.defaultComponent"
    />
    <p v-if="error" class="export-geo__error" role="alert">{{ error }}</p>
    <div class="export-geo__actions">
      <MapControlButton
        variant="outlined"
        size="medium"
        :disabled="busy"
        @click="onCancel"
      >
        Cancel
      </MapControlButton>
      <MapControlButton
        variant="filled"
        size="medium"
        :disabled="busy"
        :loading="busy"
        @click="onDownload"
      >
        {{ busy ? 'Exporting…' : 'Download' }}
      </MapControlButton>
    </div>
  </div>
</template>

<style scoped>
.export-geo {
  box-sizing: border-box;
  height: 100%;
  padding: var(--map-space-lg, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--map-space-md, 8px);
}
.export-geo__hint {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.75;
}
.export-geo__error {
  margin: 0;
  font-size: 0.85rem;
  color: var(--map-danger-color, #c0392b);
}
.export-geo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--map-space-sm, 4px);
  justify-content: flex-end;
  margin-top: auto;
}
</style>
