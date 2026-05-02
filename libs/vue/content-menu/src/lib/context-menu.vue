<template>
  <div
    class="menu-container"
    ref="target"
    v-show="isOpen"
    :style="menuStyle"
    :class="{ 'menu-mobile': isMobile }"
  >
    <div class="menu-content">
      <slot />
    </div>
    <div v-if="isOpen && isMobile" @click="close">
      <button type="button" class="btn-close">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, useBreakpoints } from '@hungpvq/shared-core';
import {
  computed,
  CSSProperties,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';

const props = defineProps({
  zIndex: { type: [String, Number], default: '9' },
});

const target = ref<HTMLDivElement>();
const isOpen = ref(false);
const stylePosition = ref<Record<string, string>>({});
const menuWidth = ref<number>(0);
const menuHeight = ref<number>(0);

const breakpoints = useBreakpoints({
  mobile: 0,
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
});
const isMobile = breakpoints.smallerOrEqual('tablet');

// Auto-close on outside click
onClickOutside(target, () => close());

const menuStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  zIndex: String(props.zIndex),
  ...stylePosition.value,
}));

let resizeObserver: ResizeObserver;

onMounted(() => {
  close();
  if (target.value) {
    resizeObserver = new ResizeObserver(() => {
      menuWidth.value = target.value!.offsetWidth;
      menuHeight.value = target.value!.offsetHeight;
    });
    resizeObserver.observe(target.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

function open(event: MouseEvent) {
  isOpen.value = true;

  nextTick(() => {
    const menu = target.value;
    if (!menu) return;

    // force measure if unset
    if (!menuWidth.value || !menuHeight.value) {
      menu.style.visibility = 'hidden';
      menu.style.display = 'block';
      menuWidth.value = menu.offsetWidth;
      menuHeight.value = menu.offsetHeight;
      menu.style.visibility = '';
      menu.style.display = '';
    }

    if (!isMobile.value) {
      const left =
        event.pageX + menuWidth.value >= window.innerWidth
          ? event.pageX - menuWidth.value + 10
          : event.pageX - 10;
      const top =
        event.pageY + menuHeight.value >= window.innerHeight
          ? event.pageY - menuHeight.value + 10
          : event.pageY - 10;
      stylePosition.value = {
        left: `${left}px`,
        top: `${top}px`,
      };
    } else {
      stylePosition.value = {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: '#00000085',
      };
    }
  });
}

function close() {
  isOpen.value = false;
  stylePosition.value = {};
}

defineExpose({ open, close });
</script>

<style scoped lang="scss">
.menu-mobile .menu-content {
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 40px;
  height: 100%;
  overflow: auto;
}

/* Close button style */
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
