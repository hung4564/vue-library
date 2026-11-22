<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'ul' | 'ol' | 'div';
    dense?: boolean;
    divided?: boolean;
    flush?: boolean;
    className?: string;
  }>(),
  {
    as: 'ul',
    dense: false,
    divided: false,
    flush: false,
    className: '',
  },
);
</script>

<template>
  <component
    :is="as"
    class="ui-list"
    :class="[
      dense ? 'ui-list--dense' : '',
      divided ? 'ui-list--divided' : '',
      flush ? 'ui-list--flush' : '',
      className,
    ]"
    role="list"
  >
    <slot />
  </component>
</template>
