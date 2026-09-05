<script setup>
const model = defineModel({});
defineProps({
  label: String,
  items: {
    type: Array,
    required: true,
  },
});
function onSetValue(item) {
  model.value = item.value;
}
</script>
<template>
  <div class="form-group">
    <label v-if="label">
      {{ label }}
    </label>
    <div class="input-container">
      <div
        v-for="item in items"
        :key="item.value"
        class="item-choose"
        @click.stop="onSetValue(item)"
        :class="{ 'item-choose-active': item.value === model }"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>
