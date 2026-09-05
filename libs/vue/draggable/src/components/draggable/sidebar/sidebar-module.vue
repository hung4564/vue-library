<template>
  <div class="module-sidebar__container" v-if="alive && isCurrentShow">
    <Teleport v-if="hasSlotTitle && titleEl" :to="titleEl" defer>
      <slot name="title" />
    </Teleport>
    <Teleport v-if="contentEl" :to="contentEl" defer>
      <slot />
    </Teleport>
  </div>
</template>
<script lang="ts">
export default {
  name: 'ModuleSidebarContainer',
};
</script>
<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useSlots,
  watch,
} from 'vue';
import { useSideBarContainer } from '../../../hook/useSideBarContainer';
import { useDragComponent } from '../../../store';
import { LocationSideBar } from '../../../types';

const slots = useSlots();
const props = defineProps({
  containerId: { type: String, required: true },
  itemId: { type: String, required: true },
  location: { type: String, required: true },
});

const c_containerId = computed(() => props.containerId);
const { getShowForLocation } = useSideBarContainer(c_containerId.value);
const cards = useDragComponent();
const titleTo = computed(
  () => `#sidebar-title-${c_containerId.value}-${props.location}`,
);
const contentTo = computed(
  () => `#sidebar-content-${c_containerId.value}-${props.location}`,
);
const hasSlotTitle = computed(() => !!slots['title']);
const isCurrentShow = computed(() => {
  return (
    !!props.containerId &&
    !!props.itemId &&
    !!props.location &&
    props.itemId == getShowForLocation(props.location as LocationSideBar)
  );
});

/** Prevent Teleport from patching after targets are torn down (HMR / parent cleanup). */
const alive = ref(true);
const titleEl = ref<Element | null>(null);
const contentEl = ref<Element | null>(null);

function resolveTargets() {
  if (!alive.value || !isCurrentShow.value) {
    titleEl.value = null;
    contentEl.value = null;
    return;
  }
  const nextTitle = document.querySelector(titleTo.value);
  const nextContent = document.querySelector(contentTo.value);
  titleEl.value = nextTitle?.isConnected ? nextTitle : null;
  contentEl.value = nextContent?.isConnected ? nextContent : null;
}

async function remountTargets() {
  // Detach Teleport first so Vue does not patch against removed DOM nodes.
  titleEl.value = null;
  contentEl.value = null;
  await nextTick();
  resolveTargets();
}

onMounted(() => {
  nextTick(resolveTargets);
});
watch([titleTo, contentTo, isCurrentShow], () => {
  nextTick(resolveTargets);
});
watch(
  () => [cards.getComponentCard(), cards.getComponentCardHeader()],
  () => {
    remountTargets();
  },
);
onBeforeUnmount(() => {
  alive.value = false;
  titleEl.value = null;
  contentEl.value = null;
});
</script>
