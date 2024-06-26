<template lang="">
  <div class="tab-item">
    <div
      v-if="!item.component || !item.component.content"
      class="tab-item-no-content"
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
    ></component>
    <div v-if="default_value != null" class="full-width">
      <hr class="map-divider" />
      <button
        @click="onSetDefaultValue()"
        :disabled="form == null || form == default_value"
        class="map-button text-center full-width"
      >
        {{ trans('map.style-control.back-to-default') }}
      </button>
    </div>
  </div>
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
    if (props.value != null) return props.value;
    return props.default_value;
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
  form.value = props.default_value;
};
</script>
<style scoped>
.tab-item {
  align-items: center;
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  letter-spacing: normal;
  min-height: 48px;
  outline: none;
  position: relative;
  text-decoration: none;
}
.tab-item-no-content {
  text-align: left;
  width: 100%;
}
.map-button {
  display: inline-block;
  padding: 4px;
  cursor: pointer;
  background: transparent;
  outline: none;
  box-shadow: none;
  border: none;
  min-width: 25px;
}
.map-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
