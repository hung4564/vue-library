<script lang="ts">
export default {
  name: 'MapSidebarToggle',
};
</script>
<script setup lang="ts">
import { useIcon } from '../../hook';

const { SidebarExpandedIcon, SidebarCloseExpandedIcon } = useIcon();
defineProps({
  location: String,
  expand: Boolean,
});
</script>

<template>
  <button type="button">
    <SidebarExpandedIcon v-if="expand" :size="16" />
    <SidebarCloseExpandedIcon v-else :size="16" />
  </button>
</template>
