<script setup lang="ts">
import { useLang } from '@hungpvq/vue-map-core';
import { computed, inject } from 'vue';

const model = defineModel<boolean>({ default: false });
const mapId = inject<string>('$map.id', '');
const { language } = useLang(mapId || 'demo-language');

const label = computed(() =>
  language.value === 'en'
    ? 'Reload from API on each select'
    : 'Tải lại từ API mỗi lần chọn',
);
</script>

<template>
  <label class="language-demo-reload">
    <input v-model="model" type="checkbox" />
    {{ label }}
  </label>
</template>

<style scoped>
.language-demo-reload {
  position: absolute;
  z-index: 2;
  left: 12px;
  bottom: 12px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.35rem 0.6rem;
  background: var(--map-surface, #fff);
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>
