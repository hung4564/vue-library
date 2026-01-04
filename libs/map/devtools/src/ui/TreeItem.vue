<template>
  <div class="tree-item">
    <div class="item-row" @click="toggle">
      <span
        v-if="hasChildren"
        class="toggle-icon"
        :class="{ collapsed: isOpen }"
      >
        ▶</span
      >
      <span class="key" v-if="label">{{ label }}: </span>
      <span class="value" :class="valueType">{{ displayValue }}</span>
      <span v-if="hasChildren && !isOpen" class="preview">
        {{ previewValue }}
      </span>
    </div>
    <div v-if="isOpen && hasChildren" class="children">
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
import { computed, ref } from 'vue';

const props = defineProps<{
  label?: string;
  data: any;
  depth?: number;
}>();

const isOpen = ref(false);
const depth = props.depth || 0;

const valueType = computed(() => {
  if (props.data === null) return 'null';
  if (Array.isArray(props.data)) return 'array';
  return typeof props.data;
});

const hasChildren = computed(() => {
  return (
    valueType.value === 'object' ||
    valueType.value === 'array' ||
    (valueType.value === 'function' && Object.keys(props.data || {}).length > 0)
  );
});

const childKeys = computed(() => {
  if (!hasChildren.value) return [];
  try {
    return Object.keys(props.data);
  } catch (e) {
    return [];
  }
});

const displayValue = computed(() => {
  if (props.data === null) return 'null';
  if (props.data === undefined) return 'undefined';
  if (valueType.value === 'string') return `"${props.data}"`;
  if (valueType.value === 'function')
    return `f ${props.data.name || 'anonymous'}()`;
  if (valueType.value === 'array') return `Array(${props.data.length})`;
  if (valueType.value === 'object') {
    // Check for Vue instances or specific types if needed
    if (props.data.constructor && props.data.constructor.name !== 'Object') {
      return `${props.data.constructor.name}`;
    }
    return 'Object';
  }
  return String(props.data);
});

const previewValue = computed(() => {
  if (valueType.value === 'array') return '[...]';
  if (valueType.value === 'object') return '{...}';
  return '';
});

const toggle = () => {
  if (hasChildren.value) {
    isOpen.value = !isOpen.value;
  }
};
</script>

<style scoped>
.tree-item {
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
}

.item-row {
  display: flex;
  align-items: center;
  cursor: pointer;
  white-space: nowrap;
}

.item-row:hover {
  background-color: #f0f0f0;
}

.toggle-icon {
  width: 16px;
  text-align: center;
  color: #666;
  user-select: none;
}
.toggle-icon.collapsed {
  transform: rotate(90deg);
}
.spacer {
  width: 16px;
}

.key {
  color: #881391;
  margin-right: 4px;
}

.value {
  color: #333;
}

.value.string {
  color: #c41a16;
}

.value.number {
  color: #1c00cf;
}

.value.boolean {
  color: #0d22aa;
}

.value.null,
.value.undefined {
  color: #808080;
}

.value.function {
  color: #0033cc;
  font-style: italic;
}

.preview {
  color: #999;
  margin-left: 4px;
}

.children {
  padding-left: 8px;
  margin-left: 8px;
  border-left: 1px solid #ccc;
}
</style>
