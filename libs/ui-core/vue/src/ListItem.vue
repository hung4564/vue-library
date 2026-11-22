<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    as?: 'li' | 'div';
    selected?: boolean;
    disabled?: boolean;
    interactive?: boolean;
    dense?: boolean;
    title?: string;
    className?: string;
  }>(),
  {
    as: 'li',
    selected: false,
    disabled: false,
    interactive: true,
    dense: false,
    title: undefined,
    className: '',
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const itemClasses = computed(() => [
  'ui-list-item',
  props.interactive ? 'ui-list-item--interactive' : '',
  props.selected ? 'ui-list-item--selected' : '',
  props.disabled ? 'ui-list-item--disabled' : '',
  props.dense ? 'ui-list-item--dense' : '',
  props.className,
]);

function handleClick(event: MouseEvent) {
  if (props.disabled) return;
  emit('click', event);
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('click', event as unknown as MouseEvent);
  }
}
</script>

<template>
  <component
    :is="as"
    :class="itemClasses"
    :title="title"
    :role="interactive ? 'button' : 'listitem'"
    :tabindex="interactive && !disabled ? 0 : undefined"
    :aria-selected="selected"
    :aria-disabled="disabled"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div
      v-if="$slots.prefix"
      class="ui-list-item__prefix"
    >
      <slot name="prefix" />
    </div>
    <div class="ui-list-item__content">
      <slot />
    </div>
    <div
      v-if="$slots.suffix"
      class="ui-list-item__suffix"
    >
      <slot name="suffix" />
    </div>
  </component>
</template>
