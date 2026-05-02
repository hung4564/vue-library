<script lang="ts">
export default {
  name: 'InputText',
};
</script>
<script setup lang="ts">
const model = defineModel();
defineProps({
  label: String,
  disabled: Boolean,
});
</script>
<template>
  <div class="form-group">
    <label v-if="label">
      {{ label }}
    </label>
    <div class="input-container">
      <input v-bind="$attrs" v-model="model" :disabled="disabled" />
    </div>
  </div>
</template>
<style scoped>
.input-container > input {
  width: 100%;
  padding: 8px;
  display: block;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: inherit;
  box-sizing: border-box;
  background-color: transparent;
  outline: none;
}
.input-container > input:focus {
  border: 1px solid #fff;
}
</style>
