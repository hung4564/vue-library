<script setup lang="ts">
import { computed } from 'vue';
import { useData, useRoute } from 'vitepress';
import { resolveDocPackages } from '../../packages-versions';

const route = useRoute();
const { site } = useData();

const packages = computed(() =>
  resolveDocPackages(route.path, site.value.base),
);
</script>

<template>
  <div v-if="packages?.length" class="doc-pkg-versions">
    <span class="doc-pkg-versions__label">Docs version</span>
    <div class="doc-pkg-versions__list">
      <code v-for="pkg in packages" :key="pkg.name">
        {{ pkg.name }}@{{ pkg.version }}
      </code>
    </div>
  </div>
</template>

<style scoped>
.doc-pkg-versions {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 0.75rem;
  margin: 0 0 1.25rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
  line-height: 1.4;
}

.doc-pkg-versions__label {
  flex: 0 0 auto;
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.doc-pkg-versions__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.doc-pkg-versions__list code {
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  font-size: 12px;
}
</style>
