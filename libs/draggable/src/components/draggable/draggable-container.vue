<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { debounce } from 'lodash';
import { nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { useDragContainer } from '../../store';
import { InitOption } from '../../types';
type ResultShow = {
  sidebar?: {
    leftCount: number;
    rightCount: number;
  };
  [key: string]: any;
};

const emit = defineEmits({
  init: (id: string) => {
    return true;
  },
  destroy: (id: string) => {
    return true;
  },
  changeShow: (options: { show: ResultShow; idsShow: string[] }) => {
    return true;
  },
});
const box = ref<HTMLDivElement>();
const { containerId } = defineProps<{ containerId?: string }>();
const p_container_id = ref(containerId || `draggable-container-${getUUIDv4()}`);
const init_done = ref(false);
const store = useDragContainer(p_container_id.value);
let resizeObserver: any;

const handleResize = debounce(() => {
  nextTick(() => {
    onResize();
  });
}, 200);
watch(
  () => store.getItemShows(),
  (options) => {
    const show = options.reduce<ResultShow>((acc, id) => {
      const item = store.getItemAction(id);
      // Bỏ tiền tố 'item-'
      const baseType = item.type.replace(/^item-/, '');

      // Nếu có location → gom theo leftCount/rightCount
      if ('location' in item && typeof item.location === 'string') {
        const key = `${item.location}Count`;

        // Khởi tạo nếu chưa có
        acc[baseType] ??= {};
        acc[baseType][key] = (acc[baseType][key] || 0) + 1;
      } else {
        const key = `${baseType}Count`;
        acc[key] = (acc[key] || 0) + 1;
      }

      return acc;
    }, {});
    emit('changeShow', { show, idsShow: options });
  },
  { deep: true },
);

onMounted(() => {
  store.initContainer();
  window.addEventListener('resize', onResize);
  nextTick(() => {
    onResize();
    init_done.value = true;
    emit('init', p_container_id.value);
  });
  if (box.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(box.value);
  }
});
onUnmounted(() => {
  store.removeContainer();
  window.removeEventListener('resize', onResize);
  emit('destroy', p_container_id.value);
  if (resizeObserver && box.value) {
    resizeObserver.unobserve(box.value);
    resizeObserver.disconnect();
  }
});
provide('containerId', p_container_id);
function onResize() {
  const clientWidth = box.value?.clientWidth || 0;
  store.setParentProps({
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
