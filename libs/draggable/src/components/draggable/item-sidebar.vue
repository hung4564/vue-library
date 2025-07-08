<script lang="ts">
export default {
  name: 'DraggableItemSideBar',
};
</script>
<script setup lang="ts">
import { inject, ref, Ref } from 'vue';
import {
  useShow,
  withExpandEmit,
  withShareComponent,
  withShareProps,
  withShowEmit,
  withShowProps,
} from '../../hook';
import { useInitSidebar } from '../../hook/useInitSidebar';
import { LocationSideBar } from '../../types';
import SidebarModule from './sidebar/sidebar-module.vue';
const props = defineProps({
  ...withShowProps,
  ...withShareComponent,
  ...withShareProps,
  componentMapSidebarToggle: { type: [String, Object] },
  width: { type: [Number, String], default: 'auto' },
  right: Boolean,
  location: { type: [String] },
});
const emit = defineEmits({ ...withShowEmit, ...withExpandEmit });
const containerId = inject<Ref<string>>(
  'containerId',
  ref(props.containerId || ''),
);
if (!containerId.value) {
  throw 'Not set container id';
}
const { show } = useShow(props, emit);
const c_location =
  props.location != null
    ? (props.location as LocationSideBar)
    : props.right
      ? 'right'
      : 'left';
const { location, itemId } = useInitSidebar(containerId.value, show, {
  title: props.title,
  type: 'item-sidebar',
  location: c_location,
});
</script>

<template>
  <SidebarModule
    :container-id="containerId"
    :location="location"
    :item-id="itemId"
  >
    <template #title>
      <slot name="title">
        {{ title }}
      </slot>
    </template>
    <slot></slot>
  </SidebarModule>
</template>
