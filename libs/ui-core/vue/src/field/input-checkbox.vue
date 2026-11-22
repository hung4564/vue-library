<template lang="">
  <div class="form-group">
    <div class="form-control form-checkbox">
      <input
        :id="inputId"
        type="checkbox"
        v-model="form"
        :disabled="disabled"
      />
      <label :for="inputId"> {{ label }} </label>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useId } from 'vue';

const form = defineModel<boolean>({ type: Boolean });
defineProps({
  label: String,
  disabled: Boolean,
});
const inputId = useId();
</script>
