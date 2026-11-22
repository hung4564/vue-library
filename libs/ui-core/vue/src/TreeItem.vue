<template>
  <div class="tree-item">
    <div
      class="tree-item__row"
      @click="toggle"
    >
      <span
        v-if="hasChildrenCount"
        class="tree-item__toggle"
        :class="{ 'tree-item__toggle--open': isOpen }"
      >
        ▶
      </span>
      <span
        v-else
        class="tree-item__toggle"
      />
      <span
        v-if="label"
        class="tree-item__key"
      >
        {{ label }}:
      </span>
      <span
        class="tree-item__value"
        :class="`tree-item__value--${valueType}`"
      >
        {{ displayValueText }}
      </span>
      <span
        v-if="hasChildrenCount && !isOpen"
        class="tree-item__preview"
      >
        {{ previewValueText }}
      </span>
    </div>
    <div
      v-if="isOpen && hasChildrenCount"
      class="tree-item__children"
    >
      <TreeItem
        v-for="key in childKeyList"
        :key="key"
        :label="key"
        :data="(data as Record<string, unknown>)[key]"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  childKeys,
  displayValue,
  getValueType,
  hasChildren,
  previewValue,
  type TreeItemProps,
} from './tree-item';

defineOptions({
  name: 'TreeItem',
});

const props = withDefaults(defineProps<TreeItemProps>(), {
  label: undefined,
  depth: 0,
});

const isOpen = ref(false);

const valueType = computed(() => getValueType(props.data));
const hasChildrenCount = computed(() => hasChildren(props.data));
const childKeyList = computed(() => childKeys(props.data));
const displayValueText = computed(() => displayValue(props.data));
const previewValueText = computed(() => previewValue(props.data));

function toggle() {
  if (hasChildrenCount.value) {
    isOpen.value = !isOpen.value;
  }
}
</script>
