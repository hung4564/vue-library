<script setup lang="ts" generic="T">
const model = defineModel<T | (T extends object ? T[keyof T] : T)>();

const props = withDefaults(
  defineProps<{
    label?: string;
    items?: T[];
    itemValue?: T extends object ? keyof T : string;
    itemText?: T extends object ? keyof T : string;
    returnObject?: boolean;
  }>(),
  {
    items: () => [] as T[],
    itemValue: 'value' as any,
    itemText: 'text' as any,
    returnObject: false,
  },
);

function getValue(item: T): T | (T extends object ? T[keyof T] : T) {
  if (typeof item === 'string' || props.returnObject) {
    return item as any;
  }
  if (item && typeof item === 'object' && props.itemValue) {
    return (item as any)[props.itemValue];
  }
  return item as any;
}

function getText(item: T): string {
  if (typeof item === 'string') {
    return item;
  }
  if (item && typeof item === 'object' && props.itemText) {
    return String((item as any)[props.itemText]);
  }
  return String(item);
}

function getKey(item: T): string | number {
  if (typeof item === 'string' || typeof item === 'number') {
    return item;
  }
  if (item && typeof item === 'object' && props.itemValue) {
    return String((item as any)[props.itemValue]);
  }
  return String(item);
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
          {{ $attrs.placeholder as string }}
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
