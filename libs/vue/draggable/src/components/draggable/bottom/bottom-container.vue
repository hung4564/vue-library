<script lang="ts">
export default {
  name: 'DraggableBottomContainer',
};
</script>
<script setup lang="ts">
import ContextMenu from '../../ContextMenu.vue';
import ContextMenuItem from '../../ContextMenuItem.vue';
import { focusFirst, restoreFocus } from '@hungpvq/draggable';
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  Ref,
  watch,
} from 'vue';
import {
  useComponent,
  useExpand,
  useIcon,
  useShow,
  withShareComponent,
} from '../../../hook';
import { useBottomContainer } from '../../../hook/useBottomContainer';
import { useBottomItem, useDragContainer } from '../../../store';
import MapButton from '../../parts/MapButton.vue';

const contextMenuRef = ref<
  | {
      open(event: MouseEvent): void;
      close(): void;
    }
  | undefined
>();
const menuOpen = ref(false);
const shellRoot = ref<HTMLElement>();
let previousFocus: HTMLElement | null = null;
const { CloseIcon, SidebarOpenMenu, FullscreenIcon, OffFullscreenIcon } =
  useIcon();
defineProps({
  ...withShareComponent,
});
const containerId = inject<Ref<string>>('containerId');
if (!containerId || !containerId.value) {
  throw new Error('[BottomContainer] Missing containerId');
}

const { getShow, getItems } = useBottomContainer(containerId.value);
const { show, close } = useShow({}, null);
const { expand, toggle: onToggleExpand } = useExpand({}, null, false);
const { componentCard, componentCardHeader } = useComponent({
  containerId: containerId.value,
});
const storeBottom = useBottomItem(containerId.value);
const { getItemAction } = useDragContainer(containerId.value);

const titleTo = computed(() => `bottom-title-${containerId.value}`);
const contentTo = computed(() => `bottom-content-${containerId.value}`);

const c_getShow = computed(() => getShow());
watch(
  c_getShow,
  (newValue) => {
    show.value = !!newValue;
  },
  { immediate: true },
);

function onClose() {
  const itemShow = getShow();
  if (itemShow) {
    const action = getItemAction(itemShow);
    if (action?.close) {
      action.close();
      return;
    }
    storeBottom.registerBottomShow(itemShow, false);
  }
  close();
}

function onKeydown(event: KeyboardEvent) {
  if (!show.value || event.key !== 'Escape') return;
  if (menuOpen.value) return;
  const root = shellRoot.value;
  if (!root) return;
  const target = event.target as Node | null;
  if (target && !root.contains(target) && document.activeElement !== root) {
    return;
  }
  event.preventDefault();
  onClose();
}

watch(show, async (visible) => {
  document.removeEventListener('keydown', onKeydown);
  if (!visible) {
    restoreFocus(previousFocus);
    previousFocus = null;
    return;
  }
  previousFocus = document.activeElement as HTMLElement | null;
  document.addEventListener('keydown', onKeydown);
  await nextTick();
  if (shellRoot.value) focusFirst(shellRoot.value);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});

function closeContextMenu() {
  contextMenuRef.value?.close();
}
const allItems = computed(() => getItems());
const activeBottomId = computed(() => getShow());
const showSwitcher = computed(() => allItems.value.length > 1);
function openMenu(e: MouseEvent) {
  contextMenuRef.value?.open(e);
}
function selectBottom(nextId: string) {
  storeBottom.registerBottomShow(nextId, true);
  closeContextMenu();
}

const shellStyle = computed(() => ({
  height: expand.value ? '100%' : '45%',
}));
</script>

<template>
  <!-- v-show (not v-if): keep title/content portal hosts mounted so
       BottomModule can teleport on first open without a race. -->
  <div
    ref="shellRoot"
    v-show="show"
    class="popup-mobile-container bottom-container"
    role="region"
    aria-label="Bottom panel"
    :aria-labelledby="titleTo"
    :aria-hidden="show ? undefined : 'true'"
    tabindex="-1"
    :style="shellStyle"
  >
    <component :is="componentCard">
      <div class="draggable-bottom">
        <component :is="componentCardHeader">
          <template #title>
            <span :id="titleTo"></span>
          </template>
          <template #extra-btn>
            <map-button
              v-if="showSwitcher"
              aria-label="Open bottom menu"
              aria-haspopup="menu"
              :aria-expanded="menuOpen ? 'true' : 'false'"
              @click="openMenu"
            >
              <SidebarOpenMenu :size="16" />
            </map-button>
            <map-button
              :aria-label="
                expand ? 'Collapse bottom panel' : 'Expand bottom panel'
              "
              :aria-expanded="expand ? 'true' : 'false'"
              :aria-controls="contentTo"
              @click="onToggleExpand()"
            >
              <FullscreenIcon v-if="expand" :size="16" />
              <OffFullscreenIcon v-else :size="16" />
            </map-button>
            <map-button aria-label="Close bottom" @click="onClose">
              <CloseIcon :size="16" />
            </map-button>
          </template>
        </component>
        <div class="draggable-bottom-content" :id="contentTo"></div>
      </div>
    </component>
  </div>
  <ContextMenu
    ref="contextMenuRef"
    aria-label="Switch bottom panel"
    @update:open="menuOpen = $event"
  >
    <ul class="context-menu" role="presentation">
      <ContextMenuItem
        v-for="option in allItems"
        :key="option.id"
        :active="option.id === activeBottomId"
        @click="selectBottom(option.id)"
      >
        <span>{{ option.title }}</span>
      </ContextMenuItem>
    </ul>
  </ContextMenu>
</template>
