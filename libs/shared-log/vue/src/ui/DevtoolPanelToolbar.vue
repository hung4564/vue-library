<template>
  <div class="devtool-panel__toolbar">
    <span class="devtool-panel__title"> <slot name="title"></slot></span>
    <div class="devtool-panel__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: 'DevtoolPanelToolbar',
};
</script>

<script lang="ts" setup></script>
