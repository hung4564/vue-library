<template>
  <div class="module-sidebar__container" v-if="isCurrentShow">
    <Teleport :to="titleTo" v-if="hasSlotTitle">
      <slot name="title" />
    </Teleport>
    <Teleport :to="contentTo">
      <slot />
    </Teleport>
  </div>
</template>
<script lang="ts">
export default {
  name: 'ModuleSidebarContainer',
};
</script>
<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { useSideBarContainer } from '../../../hook/useSideBarContainer';
import { LocationSideBar } from '../../../types';
const slots = useSlots();
const props = defineProps({
  containerId: { type: String, required: true },
  itemId: { type: String, required: true },
  location: { type: String, required: true },
});

const c_containerId = computed(() => {
  return props.containerId;
});
const { getShowForLocation } = useSideBarContainer(c_containerId.value);
const titleTo = computed(() => {
  return `#sidebar-title-${c_containerId.value}-${props.location}`;
});
const contentTo = computed(() => {
  return `#sidebar-content-${c_containerId.value}-${props.location}`;
});
const hasSlotTitle = computed(() => !!slots['title']);
const isCurrentShow = computed(() => {
  return (
    props.containerId &&
    props.itemId &&
    props.location &&
    props.itemId == getShowForLocation(props.location as LocationSideBar)
  );
});
</script>

<style scoped>
.module-sidebar__container {
  display: none;
  pointer-events: none;
}
</style>
