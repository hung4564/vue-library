<script lang="ts">
export default {
  name: 'CustomMapHeader',
};
</script>
<script setup lang="ts"></script>

<template>
  <hr class="map-divider" />
  <div class="draggable-header">
    <div class="draggable-header__content">
      <slot name="pre-title"> </slot>
      <div class="draggable-header__title">
        <slot name="title"> </slot>
      </div>
      <div class="map-spacer"></div>
      <slot name="extra-btn"></slot>
    </div>
  </div>
  <hr class="map-divider" />
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
