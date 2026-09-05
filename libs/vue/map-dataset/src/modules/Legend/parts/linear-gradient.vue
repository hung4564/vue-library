<template>
  <div class="legend-item legend-item--column">
    <div class="legend-text">{{ item.text }}:</div>
    <div class="legend-value-container">
      <div class="legend-value" v-for="(item, i) in items" :key="i">
        {{ item.value }}
      </div>
    </div>
    <div>
      <div
        :style="{
          background: `linear-gradient(to right,${colors.join(',')})`,
        }"
        class="legend-item-color"
      ></div>
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
    items() {
      return this.value.items || [];
    },
    colors() {
      return this.items.map((x) => x.color);
    },
  },
};
</script>
