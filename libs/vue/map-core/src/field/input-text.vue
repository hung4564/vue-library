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
