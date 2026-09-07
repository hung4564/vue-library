<script lang="ts">
export default {
  name: 'ContextMenuItem',
};
</script>
<script setup lang="ts">
defineProps({
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

function onActivate(event: MouseEvent | KeyboardEvent) {
  emit('click', event as MouseEvent);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).click();
  }
}
</script>

<template>
  <li
    role="menuitem"
    tabindex="-1"
    class="context-menu__item"
    :class="{ 'is-active': active, 'is-disabled': disabled, clickable: !disabled }"
    :aria-disabled="disabled ? 'true' : undefined"
    @click.stop="!disabled && onActivate($event)"
    @keydown="onKeydown"
  >
    <slot />
  </li>
</template>
