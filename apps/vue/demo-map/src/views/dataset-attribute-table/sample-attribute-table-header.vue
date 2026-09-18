<script lang="ts">
export default { name: 'sample-attribute-table-header' };
</script>
<script setup lang="ts">
import type { AttributeTableHeaderProps } from '@hungpvq/map-dataset/attribute-table';

const props = defineProps<AttributeTableHeaderProps>();

function sortSuffix() {
  if (!props.sortable || !props.sortDir) return '';
  const arrow = props.sortDir === 'asc' ? ' ↑' : ' ↓';
  const order =
    props.sortCount && props.sortCount > 1 && props.sortOrder
      ? String(props.sortOrder)
      : '';
  return `${arrow}${order}`;
}

function onClick(event: MouseEvent) {
  if (!props.sortable || !props.onSort) return;
  props.onSort(event.shiftKey);
}
</script>
<template>
  <button
    type="button"
    class="at-sample-header"
    :class="{
      'is-sortable': sortable,
      'is-sorted': !!sortDir,
    }"
    :disabled="!sortable"
    :title="
      sortable
        ? 'Click to sort · Shift+click for multi-sort'
        : 'Sorting disabled for this column'
    "
    @click="onClick"
  >
    <span class="at-sample-header__label">{{ label }}</span>
    <span v-if="sortSuffix()" class="at-sample-header__sort">{{
      sortSuffix()
    }}</span>
    <span v-else-if="sortable" class="at-sample-header__hint">⇅</span>
  </button>
</template>
<style scoped>
.at-sample-header {
  display: flex;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 6px 10px;
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
}
.at-sample-header.is-sortable {
  cursor: pointer;
}
.at-sample-header:disabled {
  cursor: default;
  opacity: 0.75;
}
.at-sample-header__label {
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-size: 0.78em;
  color: var(--map-accent-color, #1a73e8);
}
.at-sample-header__sort,
.at-sample-header__hint {
  font-weight: 600;
  opacity: 0.85;
}
.at-sample-header__hint {
  opacity: 0.45;
}
</style>
