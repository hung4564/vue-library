<script setup lang="ts">
const model = defineModel();
const props = defineProps({
  label: String,
  items: { type: Array, default: () => [] },
  itemValue: { type: String, default: 'value' },
  itemText: { type: String, default: 'text' },
  returnObject: Boolean,
});

function getValue(item: any) {
  if (typeof item === 'string' || props.returnObject) {
    return item;
  }
  return item[props.itemValue];
}
function getText(item: any) {
  if (typeof item === 'string') {
    return item;
  }
  return item[props.itemText];
}
function getKey(item: any) {
  if (typeof item === 'string') {
    return item;
  }
  return item[props.itemValue];
}
</script>
<template>
  <div class="form-group">
    <label v-if="label">
      {{ label }}
    </label>
    <div class="input-container">
      <select v-bind="$attrs" v-model="model" required>
        <option value="" disabled selected hidden>
          {{ $attrs.placeholder }}
        </option>
        <option
          :value="getValue(item)"
          v-for="item in items"
          :key="getKey(item)"
        >
          {{ getText(item) }}
        </option>
      </select>
    </div>
  </div>
</template>
<style scoped>
.input-container option:not(:disabled) {
  background-color: transparent;
  color: black;
}
.input-container > select {
  width: 100%;
  padding: 8px;
  display: block;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: inherit;
  box-sizing: border-box;
  background-color: transparent;
  outline: none;
  position: relative;
}
.input-container > select:focus {
  border: 1px solid #fff;
}
.input-container > select:invalid {
  color: gray;
}
</style>
