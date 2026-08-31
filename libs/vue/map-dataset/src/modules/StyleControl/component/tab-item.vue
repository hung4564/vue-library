<template lang="">
  <BaseButton
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
  </BaseButton>
</template>
<script setup lang="ts">
import { BaseButton } from '@hungpvq/vue-map-core';
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
