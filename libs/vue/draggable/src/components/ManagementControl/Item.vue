<template>
  <span class="mgmt-item-meta">
    <span v-if="typeLabel" class="mgmt-type" :data-type="typeKey">{{
      typeLabel
    }}</span>
    <span class="mgmt-item-title" :title="title">{{ title }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDragContainer } from '../../store';

const TYPE_LABELS: Record<string, string> = {
  'item-popup': 'Popup',
  'item-float': 'Float',
  'item-modal': 'Modal',
  'item-bottom': 'Bottom',
  'item-sidebar': 'Sidebar',
  'item-drawer': 'Drawer',
};

const props = defineProps<{
  item: string;
  containerId: string;
}>();
const { getItemAction } = useDragContainer(props.containerId);
const action = computed(() => getItemAction(props.item));
const title = computed(() => action.value?.title || props.item);
const typeKey = computed(() => action.value?.type || '');
const typeLabel = computed(
  () => TYPE_LABELS[typeKey.value] || typeKey.value || '',
);
</script>
