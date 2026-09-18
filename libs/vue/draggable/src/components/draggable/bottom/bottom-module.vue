<template>
  <div class="module-bottom__container" v-if="alive && isCurrentShow">
    <Teleport v-if="hasSlotTitle && titleEl" :to="titleEl" defer>
      <slot name="title" />
    </Teleport>
    <Teleport v-if="hasSlotAfterTitle && afterTitleEl" :to="afterTitleEl" defer>
      <slot name="after-title" />
    </Teleport>
    <Teleport v-if="contentEl" :to="contentEl" defer>
      <slot />
    </Teleport>
  </div>
</template>
<script lang="ts">
export default {
  name: 'ModuleBottomContainer',
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
import { useBottomContainer } from '../../../hook/useBottomContainer';
import { useDragComponent, useDragContainer } from '../../../store';

const slots = useSlots();
const props = defineProps({
  containerId: { type: String, required: true },
  itemId: { type: String, required: true },
});

const c_containerId = computed(() => props.containerId);
const { getShow } = useBottomContainer(c_containerId.value);
const cards = useDragComponent();
const { getItemAction } = useDragContainer(c_containerId.value);
const titleTo = computed(() => `#bottom-title-${c_containerId.value}`);
const afterTitleTo = computed(
  () => `#bottom-after-title-${c_containerId.value}`,
);
const contentTo = computed(() => `#bottom-content-${c_containerId.value}`);
const hasSlotTitle = computed(() => !!slots['title']);
const hasSlotAfterTitle = computed(() => !!slots['after-title']);
const isCurrentShow = computed(() => {
  return (
    !!props.containerId && !!props.itemId && props.itemId === getShow()
  );
});
const activeShellCards = computed(() => {
  const id = getShow();
  if (!id) return [undefined, undefined] as const;
  const action = getItemAction(id);
  return [action?.componentCard, action?.componentCardHeader] as const;
});

const alive = ref(true);
const titleEl = ref<Element | null>(null);
const afterTitleEl = ref<Element | null>(null);
const contentEl = ref<Element | null>(null);
let targetObserver: MutationObserver | undefined;

function resolveTargets() {
  if (!alive.value || !isCurrentShow.value) {
    titleEl.value = null;
    afterTitleEl.value = null;
    contentEl.value = null;
    return false;
  }
  const nextTitle = document.querySelector(titleTo.value);
  const nextAfterTitle = document.querySelector(afterTitleTo.value);
  const nextContent = document.querySelector(contentTo.value);
  titleEl.value = nextTitle?.isConnected ? nextTitle : null;
  afterTitleEl.value = nextAfterTitle?.isConnected ? nextAfterTitle : null;
  contentEl.value = nextContent?.isConnected ? nextContent : null;
  return !!(titleEl.value && contentEl.value);
}

function stopObservingTargets() {
  targetObserver?.disconnect();
  targetObserver = undefined;
}

function ensureTargets() {
  stopObservingTargets();
  if (resolveTargets()) return;
  if (!alive.value || !isCurrentShow.value) return;
  targetObserver = new MutationObserver(() => {
    if (resolveTargets()) stopObservingTargets();
  });
  targetObserver.observe(document.body, { childList: true, subtree: true });
}

async function remountTargets() {
  titleEl.value = null;
  afterTitleEl.value = null;
  contentEl.value = null;
  await nextTick();
  ensureTargets();
}

onMounted(() => {
  nextTick(ensureTargets);
});
watch([titleTo, afterTitleTo, contentTo, isCurrentShow], () => {
  nextTick(ensureTargets);
});
watch(
  () => [
    cards.getComponentCard(),
    cards.getComponentCardHeader(),
    ...activeShellCards.value,
  ],
  () => {
    remountTargets();
  },
);
onBeforeUnmount(() => {
  alive.value = false;
  stopObservingTargets();
  titleEl.value = null;
  afterTitleEl.value = null;
  contentEl.value = null;
});
</script>
