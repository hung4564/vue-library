<template lang="">
  <div class="form-group">
    <div class="form-control form-checkbox">
      <input type="checkbox" v-model="form" :disabled="disabled" />
      <label> {{ label }} </label>
    </div>
  </div>
</template>
<script setup lang="ts">
const form = defineModel({});
defineProps({
  label: String,
  disabled: Boolean,
});
</script>
<style scoped>
.form-checkbox {
  display: flex;
}
.form-checkbox label {
  padding-left: 8px;
}
</style>
