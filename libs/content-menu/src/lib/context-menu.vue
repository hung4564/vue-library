<template>
  <div class="menu-container" ref="target">
    <div>
      <slot />
    </div>
    <div v-if="isOpen && isMobile" @click="close()">
      <button type="button" class="btn-close">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside, useBreakpoints } from '@hungpvq/shared-core';
const breakpoints = useBreakpoints({
  mobile: 0, // optional
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
});
const isMobile = breakpoints.smallerOrEqual('tablet');
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
  menu.style.position = 'fixed';
  menu.style.zIndex = props.zIndex + '';
  if (!isMobile.value) {
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
  } else {
    menu.style.top = '0px';
    menu.style.left = '0px';
    menu.style.right = '0px';
    menu.style.bottom = '0px';
    menu.style.background = '#00000085';
    const div = menu.childNodes[0] as HTMLDivElement;
    div.style.width = '100%';
    div.style.position = 'absolute';
    div.style.top = '50%';
    div.style.left = '50%';
    div.style.transform = 'translate(-50%, -50%)';
    div.style.padding = '40px';
    div.style.height = '100%';
    div.style.overflow = 'auto';
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
<style scoped>
.btn-close {
  overflow: hidden;
  position: absolute;
  border: none;
  padding: 0;
  width: 2em;
  height: 2em;
  right: 4px;
  border-radius: 50%;
  background: transparent;
  font: inherit;
  text-indent: 100%;
  cursor: pointer;

  &:focus {
    outline: solid 0 transparent;
    box-shadow: 0 0 0 2px #8ed0f9;
  }

  &:hover {
    background: rgba(29, 161, 142, 0.1);
  }

  &:before,
  &:after {
    position: absolute;
    top: 15%;
    left: calc(50% - 0.0625em);
    width: 0.125em;
    height: 70%;
    border-radius: 0.125em;
    transform: rotate(45deg);
    background: currentcolor;
    content: '';
  }

  &:after {
    transform: rotate(-45deg);
  }
}
</style>
