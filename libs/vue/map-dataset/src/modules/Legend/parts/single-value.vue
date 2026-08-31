<template>
  <div class="legend-item">
    <div class="legend-text">{{ item.text }}:</div>
    <div class="legend-value">
      {{ item.value }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    value: { type: Object, default: () => ({}) },
  },
  computed: {
    item() {
      return this.value;
    },
  },
};
</script>
