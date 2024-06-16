<template>
  <div
    class="menu-container"
    ref="target"
    style="position: absolute; z-index: 9"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@hungpvq/shared-core';
const props = defineProps({ zIndex: { type: [String, Number], default: '9' } });
const target = ref<HTMLDivElement>();
const isOpen = ref(false);
const menuWidth = ref<number | null>(null);
const menuHeight = ref<number | null>(null);
onClickOutside(target, () => close());

function open(event: MouseEvent) {
  isOpen.value = true;
  const menu = target.value;
  if (!menu) {
    return;
  }

  if (!menuWidth.value || !menuHeight.value) {
    menu.style.visibility = 'hidden';
    menu.style.display = 'block';
    menuWidth.value = menu.offsetWidth;
    menuHeight.value = menu.offsetHeight;
    menu.removeAttribute('style');
  }
  menu.style.position = 'absolute';
  menu.style.zIndex = props.zIndex + '';
  if (menuWidth.value + event.pageX >= window.innerWidth) {
    menu.style.left = event.pageX - menuWidth.value + 10 + 'px';
  } else {
    menu.style.left = event.pageX - 10 + 'px';
  }

  if (menuHeight.value + event.pageY >= window.innerHeight) {
    menu.style.top = event.pageY - menuHeight.value + 10 + 'px';
  } else {
    menu.style.top = event.pageY - 10 + 'px';
  }
}

function close() {
  menuWidth.value = null;
  menuHeight.value = null;
  isOpen.value = false;
  const menu = target.value;
  if (menu) menu.style.display = 'none';
}
defineExpose({ open, close });
</script>
