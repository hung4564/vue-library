<script lang="ts">
export default {
  name: 'MapSidebarToggle',
};
</script>
<script setup lang="ts">
import { useIcon } from '../../hook';

const {
  SidebarLeftExpandedIcon,
  SidebarLeftCloseExpandedIcon,
  SidebarRightExpandedIcon,
  SidebarRightCloseExpandedIcon,
} = useIcon();
defineProps({
  right: Boolean,
  expand: Boolean,
});
</script>

<template>
  <button>
    <span v-if="!right">
      <SidebarLeftExpandedIcon v-if="expand" :size="16" />
      <SidebarLeftCloseExpandedIcon v-else :size="16" />
    </span>
    <span v-else>
      <SidebarRightExpandedIcon v-if="expand" :size="16" />
      <SidebarRightCloseExpandedIcon v-else :size="16" />
    </span>
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

.draggable-header :deep(.map-control-button) {
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
