<script lang="ts">
export default { name: 'sample-attribute-table-cell' };
</script>
<script setup lang="ts">
import type { AttributeTableCellProps } from '@hungpvq/map-dataset/attribute-table';

defineProps<AttributeTableCellProps>();
</script>
<template>
  <span class="at-sample-cell" :title="String(raw ?? '')">
    {{ value || '—' }}
  </span>
</template>
<style scoped>
.at-sample-cell {
  display: inline-block;
  max-width: 100%;
  padding: 1px 6px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--map-accent-color, #1a73e8) 14%, transparent);
  color: var(--map-accent-color, #1a73e8);
  font-size: 0.85em;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
</style>
