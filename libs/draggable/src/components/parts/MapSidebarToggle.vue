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
  <button>
    <SidebarExpandedIcon v-if="expand" :size="16" />
    <SidebarCloseExpandedIcon v-else :size="16" />
  </button>
</template>

<style scoped>
.draggable-header .map-spacer {
  flex-grow: 1;
}

.draggable-header .map-divider {
  flex-grow: 0;
}

.draggable-header {
  flex-grow: 0;
  contain: layout;
  display: block;
  max-width: 100%;
}

.draggable-header__content {
  padding: 0 4px 0 8px;
  align-items: center;
  display: flex;
  position: relative;
  z-index: 0;
  flex: 1 1 auto;
}

.draggable-header,
.draggable-header__content {
  height: 48px;
}

.draggable-header :deep(.hungpvq-draggable-button) {
  background-color: unset;
}

.draggable-header__title {
  font-size: 1.25rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
