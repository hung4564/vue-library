<script setup lang="ts">
import { getUUIDv4 } from '@hungpvq/shared';
import { debounce } from 'lodash';
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { useDragContainer, useDragStore } from '../../store';
import SidebarContainer from './sidebar/sidebar-container.vue';
type ResultShow = {
  sidebar?: {
    leftCount: number;
    rightCount: number;
  };
  [key: string]: any;
};

const emit = defineEmits<{
  init: [id: string];
  destroy: [id: string];
  changeShow: [options: { show: ResultShow; idsShow: string[] }];
}>();
const box = ref<HTMLDivElement>();
const root = ref<HTMLDivElement>();
const { containerId } = defineProps<{ containerId?: string }>();
const p_container_id = ref(containerId || `draggable-container-${getUUIDv4()}`);
const init_done = ref(false);
const store = useDragContainer(p_container_id.value);
const dragStore = useDragStore();
let resizeObserver: ResizeObserver | undefined;

/** Breakpoint for WithMobileHandle — must use root width, not center
 *  (center shrinks when drawers open and would oscillate desktop ↔ mobile). */
const MOBILE_BREAKPOINT = 600;

const drawerStyle = computed(() => {
  const drawer = dragStore.container[p_container_id.value]?.drawer;
  if (!drawer) {
    return {
      '--drawer-left-size': '0px',
      '--drawer-right-size': '0px',
      '--drawer-top-size': '0px',
      '--drawer-bottom-size': '0px',
    };
  }
  return {
    '--drawer-left-size': `${drawer.left.size || 0}px`,
    '--drawer-right-size': `${drawer.right.size || 0}px`,
    '--drawer-top-size': `${drawer.top.size || 0}px`,
    '--drawer-bottom-size': `${drawer.bottom.size || 0}px`,
  };
});

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
  resizeObserver = new ResizeObserver(() => {
    handleResize();
  });
  if (root.value) resizeObserver.observe(root.value);
  if (box.value) resizeObserver.observe(box.value);
});
onUnmounted(() => {
  store.removeContainer();
  window.removeEventListener('resize', onResize);
  emit('destroy', p_container_id.value);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
provide('containerId', p_container_id);
function onResize() {
  const clientWidth = box.value?.clientWidth || 0;
  const layoutWidth = root.value?.clientWidth || clientWidth;
  store.setParentProps({
    width: clientWidth,
    height: box.value?.clientHeight || 0,
    isMobile: layoutWidth < MOBILE_BREAKPOINT,
  });
}
</script>

<template>
  <div class="draggable-root" ref="root" :style="drawerStyle">
    <div
      class="drawer-slot drawer-slot-top"
      :id="`drawer-top-${p_container_id}`"
    />
    <div
      class="drawer-slot drawer-slot-left"
      :id="`drawer-left-${p_container_id}`"
    />
    <div class="draggable-container" ref="box" :id="containerId">
      <template v-if="p_container_id && init_done">
        <SidebarContainer location="left" />
        <SidebarContainer location="right" />
        <SidebarContainer location="top" />
        <SidebarContainer location="bottom" />
      </template>
      <slot v-if="p_container_id && init_done" :containerId="containerId" />
    </div>
    <div
      class="drawer-slot drawer-slot-right"
      :id="`drawer-right-${p_container_id}`"
    />
    <div
      class="drawer-slot drawer-slot-bottom"
      :id="`drawer-bottom-${p_container_id}`"
    />
    <div
      class="draggable-modal-layer"
      :id="`modal-layer-${p_container_id}`"
    />
  </div>
</template>