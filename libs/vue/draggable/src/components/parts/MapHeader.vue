<script lang="ts">
export default {
  name: 'MapHeader',
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
