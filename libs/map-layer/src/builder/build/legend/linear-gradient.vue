<template>
  <div class="legend-item">
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
      return this.value.option?.items || [];
    },
    colors() {
      return this.items.map((x) => x.color);
    },
  },
};
</script>
<style scoped>
.legend-text {
  font-size: 0.875rem;
  flex-grow: 0;
  font-weight: bold;
  padding-right: 8px;
}
.legend-item {
  display: flex;
  padding: 4px;
  flex-direction: column;
}
.legend-value-container {
  display: table;
  width: 100%;
}
.legend-item-color {
  width: 100%;
  height: 20px;
  border-radius: 5px;
  border: 1px solid lightgray;
}
.legend-value {
  font-size: 0.875rem;
  display: table-cell;
  padding-bottom: 8px;
}
.legend-value {
  text-align: center;
}
.legend-value:last-child {
  text-align: right;
}
.legend-value:first-child {
  text-align: left;
}
</style>
