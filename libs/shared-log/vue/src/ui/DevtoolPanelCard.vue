<template>
  <component
    :is="as"
    class="devtool-panel__card"
    :class="{ 'devtool-panel__card--flush': flush }"
  >
    <slot />
  </component>
</template>

<script lang="ts">
export default {
  name: 'DevtoolPanelCard',
};
</script>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    as?: string;
    flush?: boolean;
  }>(),
  { as: 'div', flush: false },
);
</script>
