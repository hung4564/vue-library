<script setup lang="ts">
import type { IViewSettingField } from '@hungpvq/map-core';

withDefaults(
  defineProps<{
    fields?: IViewSettingField[];
  }>(),
  {
    fields: () => [{ text: 'Status', value: 'waiting...' }],
  },
);
</script>

<template>
  <div class="map-measurement-fields">
    <div
      class="map-measurement-fields__item"
      v-for="(field, i) in fields"
      :key="i"
    >
      <div class="map-measurement-fields__row">
        <div class="map-measurement-fields__label">{{ field.text }}</div>
        <div class="map-measurement-fields__value">{{ field.value }}</div>
      </div>
    </div>
  </div>
</template>
