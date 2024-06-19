<script>
export default {
  name: 'custom-show-component',
};
</script>

<script setup>
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { ModuleContainer } from '@hungpvq/vue-map-core';
defineProps({
  item: {},
  option: {},
});
console;
const emit = defineEmits(['close']);
function onUpdateShow(val) {
  if (!val) {
    emit('close');
  }
}
</script>
<template>
  <ModuleContainer>
    <template #draggable="props">
      <DraggableItemPopup
        v-bind="props"
        show
        @update:show="onUpdateShow"
        :width="400"
      >
        {{ option.test }}
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
