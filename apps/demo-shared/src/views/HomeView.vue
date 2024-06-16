<script setup lang="ts">
import { useStoreSortable } from '@hungpvq/shared-integrations';
import { ref } from 'vue';
import Group from './GroupDrag.vue';
const el1 = ref<HTMLElement | null>(null);
const list1 = ref([
  {
    id: 1,
    name: 'a',
    children: [
      { id: 4, name: 'd' },
      { id: 5, name: 'e' },
      { id: 6, name: 'f' },
    ],
  },
  { id: 2, name: 'b', children: [] },
  { id: 3, name: 'c', children: [] },
]);

const { items: list1_init } = useStoreSortable(
  el1,
  {
    get() {
      return list1.value;
    },
    set(value) {
      list1.value = value;
    },
  },
  { draggable: '.item', group: 'layers' }
);
</script>

<template>
  <div class="container">
    <div ref="el1" class="sortable">
      <Group v-for="item in list1_init" :key="item.id" :model-value="item">
      </Group>
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
