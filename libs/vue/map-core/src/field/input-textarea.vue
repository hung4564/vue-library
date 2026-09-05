<script setup lang="ts">
const model = defineModel<string>();
defineProps({
  label: String,
});
</script>
<template>
  <div class="form-group">
    <label v-if="label">
      {{ label }}
    </label>
    <div class="input-container">
      <textarea v-bind="$attrs" v-model="model" />
    </div>
  </div>
</template>
