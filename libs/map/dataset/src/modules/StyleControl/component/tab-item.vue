<template lang="">
  <button
    class="tab-item"
    :class="{ 'tab-item-active': active, 'tab-item-disabled': disabled }"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <div class="tab-item-title" :title="text">
      {{ text }}
    </div>
    <div class="tab-item-sub-title" :title="defaultShowInItem">
      <p v-if="!item.component || !item.component.label">
        {{ defaultShowInItem }}
      </p>
      <component
        v-else
        :is="item.component.label()"
        v-bind="attrs"
        :tab="item"
        :value="value"
        :default_value="default_value"
      ></component>
    </div>
  </button>
</template>
<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps({
  value: {},
  text: {},
  item: {
    type: Object,
    default: () => ({ key: '', type: 'unit', unit: 'px' }),
  },
  default_value: {},
  disabled: Boolean,
  active: Boolean,
});
const attrs = computed(() => {
  if (!props.item || !props.item.props || !props.item.props.label) {
    return {};
  }
  if (typeof props.item.props.label == 'function') {
    return props.item.props.label(props.item);
  }
  return props.item.props.label;
});
const defaultShowInItem = computed(() => {
  if (props.value != null && props.value != '') {
    return props.value;
  }
  if (props.default_value != null && props.default_value != '') {
    return props.default_value;
  }
  return 'None';
});
</script>
<style scoped>
.tab-item {
  background-color: transparent;
  width: 100%;
  text-align: start;
  display: flex;
  flex-direction: column;
  outline: none;
  padding: 8px 16px;
  position: relative;
  text-decoration: none;
  letter-spacing: 0.5px;
  line-height: 1.5;
}
.tab-item-active::before {
  opacity: 0.05;
  background-color: currentColor;
  bottom: 0;
  content: '';
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
}
.tab-item-active {
  color: var(--v-primary-base, #1a73e8);
}
.tab-item-sub-title {
  font-size: 0.7rem;
}
.tab-item-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab-item-disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}
</style>
