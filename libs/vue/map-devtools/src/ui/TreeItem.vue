<template>
  <div class="tree-item">
    <div class="tree-item__row" @click="toggle">
      <span
        v-if="hasChildren"
        class="tree-item__toggle"
        :class="{ 'tree-item__toggle--open': isOpen }"
      >
        ▶
      </span>
      <span v-else class="tree-item__toggle" />
      <span class="tree-item__key" v-if="label">{{ label }}: </span>
      <span class="tree-item__value" :class="`tree-item__value--${valueType}`">{{
        displayValue
      }}</span>
      <span v-if="hasChildren && !isOpen" class="tree-item__preview">
        {{ previewValue }}
      </span>
    </div>
    <div v-if="isOpen && hasChildren" class="tree-item__children">
      <TreeItem
        v-for="key in childKeys"
        :key="key"
        :label="key"
        :data="data[key]"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  childKeys as getChildKeys,
  displayValue as getDisplayValue,
  getValueType,
  hasChildren as getHasChildren,
  previewValue as getPreviewValue,
} from '@hungpvq/map-debug';
import { computed, ref } from 'vue';

const props = defineProps<{
  label?: string;
  data: any;
  depth?: number;
}>();

const isOpen = ref(false);
const depth = props.depth || 0;

const valueType = computed(() => getValueType(props.data));
const hasChildren = computed(() => getHasChildren(props.data));
const childKeys = computed(() => getChildKeys(props.data));
const displayValue = computed(() => getDisplayValue(props.data));
const previewValue = computed(() => getPreviewValue(props.data));

function toggle() {
  if (hasChildren.value) isOpen.value = !isOpen.value;
}
</script>
