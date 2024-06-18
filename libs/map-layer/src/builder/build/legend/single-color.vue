<template>
  <div class="legend-item">
    <div class="legend-text">{{ item.text }}:</div>
    <div
      :style="{
        background: `${item.option?.color}`,
      }"
      class="legend-item-color"
    ></div>
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
<style scoped>
.legend-item {
  display: flex;
  padding: 4px;
  align-items: center;
  width: 100%;
}

.legend-text {
  font-size: 0.875rem;
  flex-grow: 0;
  font-weight: bold;
  padding-right: 8px;
}
.legend-value {
  font-size: 0.875rem;
  padding-left: 8px;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style scoped>
.legend-item-color {
  width: 20px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 20px;
  border-radius: 5px;
  border: 1px solid #d3d3d3;
}
</style>
