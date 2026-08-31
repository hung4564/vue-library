<template>
  <input
    :value="form"
    @change="({ target }) => (form = parseFloat(target.value))"
    type="range"
    :min="min"
    :max="max"
    :step="step"
    :style="{ backgroundSize: backgroundSize }"
    :disabled="disabled"
  />
</template>
<script>
export default {
  name: 'VueSlider',
  props: {
    modelValue: {},
    min: {
      default: 0,
    },
    max: {
      default: 1,
    },
    step: {
      default: 0.01,
    },
    disabled: Boolean,
  },
  computed: {
    backgroundSize() {
      return (
        ((this.modelValue - this.min) * 100) / (this.max - this.min) + '% 100%'
      );
    },
    form: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
};
</script>
