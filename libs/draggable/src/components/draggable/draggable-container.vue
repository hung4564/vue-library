<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { computed, nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import { init, remove, setParentProps } from '../../store';
import { store } from '../../store/store';
const emit = defineEmits({
  init: (id: string) => {
    return true;
  },
  destroy: (id: string) => {
    return true;
  },
});
const box = ref<HTMLDivElement>();
const { containerId } = defineProps<{ containerId?: string }>();
const p_container_id = ref(containerId || `draggable-container-${getUUIDv4()}`);
const init_done = ref(false);
const state = computed(() => store.state);
onMounted(() => {
  init(p_container_id.value);
  window.addEventListener('resize', onResize);
  nextTick(() => {
    onResize();
    init_done.value = true;
    emit('init', p_container_id.value);
  });
});
onUnmounted(() => {
  remove(p_container_id.value);
  window.removeEventListener('resize', onResize);
  emit('destroy', p_container_id.value);
});
provide('containerId', p_container_id);
function onResize() {
  const clientWidth = box.value?.clientWidth || 0;
  setParentProps(p_container_id.value, {
    width: clientWidth,
    height: box.value?.clientHeight || 0,
    isMobile: clientWidth < 600,
  });
}
</script>

<template>
  <div class="draggable-container" ref="box" :id="containerId">
    <slot v-if="p_container_id && init_done" :containerId="containerId" />
  </div>
</template>

<style scoped>
.draggable-container {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
<style>
@import 'vue-draggable-resizable/style.css';
.map-divider {
  margin: 0;
  display: block;
  flex: 1 1 0px;
  max-width: 100%;
  height: 0px;
  max-height: 0px;
  border: solid;
  border-width: thin 0 0 0;
  transition: inherit;
  border-color: #fff;
  opacity: 0.3;
}
</style>
