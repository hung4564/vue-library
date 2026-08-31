<template lang="">
  <div class="tab-item">
    <div
      v-if="!item.component || !item.component.content"
      class="tab-item-content"
    >
      <p>
        {{ value || default_value }}
      </p>
    </div>
    <component
      v-else
      :is="item.component.content()"
      v-bind="attrs"
      :modelValue="form"
      @update:modelValue="form = $event"
      :mapId="mapId"
      class="tab-item-content"
    ></component>
    <div v-if="default_value != null" class="full-width">
      <hr class="map-divider" />
      <BaseButton
        @click="onSetDefaultValue()"
        :disabled="form == null || form == default_value"
        class="map-button text-center full-width"
      >
        {{ trans('map.style-control.back-to-default') }}
      </BaseButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { copyByJson } from '@hungpvq/shared';
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
  trans: {
    required: true,
  },
  mapId: {
    required: true,
  },
});
const emit = defineEmits(['input']);
const form = computed({
  get() {
    const value =
      props.value != null
        ? props.value
        : props.default_value != null
          ? copyByJson(props.default_value)
          : undefined;
    return value;
  },
  set(value) {
    emit('input', value);
  },
});
const attrs = computed(() => {
  if (!props.item || !props.item.props || !props.item.props.content) {
    return {};
  }
  if (typeof props.item.props.content == 'function') {
    return props.item.props.content(props.item);
  }
  return props.item.props.content;
});
const onSetDefaultValue = () => {
  form.value =
    props.default_value != null ? copyByJson(props.default_value) : undefined;
};
</script>
