<template>
  <div class="devtool-panel">
    <slot name="title"></slot>
    <div class="devtool-panel__body">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: 'DevtoolPanelContainer',
};
</script>

<script lang="ts" setup></script>
