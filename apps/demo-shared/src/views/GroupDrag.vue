<script setup lang="ts">
import { useStoreSortable } from '@hungpvq/shared-integrations';
import { ref } from 'vue';
const form = defineModel<{
  id: number;
  name: string;
  children?: { id: number; name: string }[];
}>({
  required: true,
});

const el1 = ref<HTMLElement | null>(null);

const { items } = useStoreSortable(
  el1,
  {
    get() {
      return form.value.children || [];
    },
    set(value) {
      form.value.children = value;
    },
  },
  { draggable: '.item', group: 'layers' }
);
</script>

<template>
  <div class="item" :data-id="form.id">
    <div>
      {{ form.name }}
    </div>
    <div ref="el1" class="sortable">
      <div v-for="item in items" :key="item.id" class="item" :data-id="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
<style>
.container {
  display: flex;
  padding: 50px;
}
.sortable {
  width: 100%;
  padding: 20px;
}
.item {
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.125);
}
.sortable-ghost {
  opacity: 0.2;
  background: var(--v-primary-base, #1a73e8);
}
</style>
