<script lang="ts">
export default {
  name: 'DraggableItemBottom',
  // Mobile stand-in for popup/float/modal/drawer/sidebar — ignore their extra attrs.
  inheritAttrs: false,
};
</script>
<script setup lang="ts">
import { inject, ref, Ref } from 'vue';
import {
  useInitAction,
  useShow,
  withExpandEmit,
  withShareProps,
  withShowEmit,
  withShowProps,
} from '../../hook';
import { useInitBottom } from '../../hook/useInitBottom';
import BottomModule from './bottom/bottom-module.vue';

const props = defineProps({
  ...withShowProps,
  ...withShareProps,
});
const emit = defineEmits({ ...withShowEmit, ...withExpandEmit });
const containerId = inject<Ref<string>>(
  'containerId',
  ref(props.containerId || ''),
);
if (!containerId.value) {
  throw new Error('Not set container id');
}
const { show, open, close } = useShow(props, emit);
const { itemId } = useInitBottom(
  containerId.value,
  show,
  {
    title: props.title,
    type: 'item-bottom',
  },
  props.id,
);
useInitAction(containerId.value, itemId.value, {
  open,
  close,
});
</script>

<template>
  <BottomModule :container-id="containerId" :item-id="itemId">
    <template #title>
      <slot name="title">
        {{ title }}
      </slot>
    </template>
    <slot></slot>
  </BottomModule>
</template>
