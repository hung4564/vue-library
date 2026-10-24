<template>
  <div class="layer-detail-row">
    <div class="layer-detail-row__copy">
      <CopyButton :value="value == null ? '' : String(value)" />
    </div>
    <template v-if="!field.inline">
      <div class="layer-detail-grid">
        <div
          class="layer-detail-grid__label"
          :title="label"
        >
          {{ label }}
        </div>
        <div class="layer-detail-grid__value">
          {{ value }}
        </div>
      </div>
    </template>
    <div
      class="layer-detail-grid layer-detail-grid--full"
      v-else
    >
      <input-text-area
        readonly
        rows="10"
        v-model="value"
        :label="label"
      />
    </div>
  </div>
</template>
<script setup>
import { CopyButton, InputTextArea } from '@hungpvq/vue-ui-core';
import { computed } from 'vue';

const props = defineProps({
  item: {},
  field: {},
  label: {},
});
const value = computed(() => {
  const raw = props.item ? props.item[props.field.value] : '';
  if (raw == null) return '';
  if (
    typeof raw === 'string' ||
    typeof raw === 'number' ||
    typeof raw === 'boolean'
  ) {
    return String(raw);
  }
  return JSON.stringify(raw, undefined, 2);
});
</script>
