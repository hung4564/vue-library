<script setup lang="ts">
import {
  MAP_BUTTON_SIZE_PX,
  type Position,
  type WithMapPropType,
} from '@hungpvq/map-core';
import type { MapControlButtonState } from '@hungpvq/map-core/toolbar';
import {
  groupToolbarButtons,
  handleToolbarButtonClick,
  mdiButtonState,
  measureCornerMenuUsedPx,
  measureCornerStandaloneReserved,
  planToolbarExpansion,
  planToolbarLayout,
  shouldCloseExpandedOnOutsideClick,
  TOOLBAR_EXPAND_OUTSIDE_IGNORE_SELECTOR,
  toolbarAvailableWidth,
  toolbarOverflowPanelClassName,
} from '@hungpvq/map-core/toolbar';
import { mdiClose, mdiDotsHorizontal } from '@mdi/js';
import {
  computed,
  type ComputedRef,
  inject,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch,
} from 'vue';

import MapCommonButton from '../../../components/MapCommonButton.vue';
import MapControlGroupButton from '../../../components/MapControlGroupButton.vue';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useLang } from '../../lang/hook';
import { useMapToolbar } from '../store';

const CORNER_POSITIONS: Position[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

const props = withDefaults(
  defineProps<
    Omit<WithMapPropType, 'controlLayout'> & { maxVisible?: number }
  >(),
  {
    ...defaultMapProps,
    position: 'top-left' as const,
  },
);
const { moduleContainerProps, mapId } = useMap({
  ...props,
  controlLayout: 'button',
});
const { trans } = useLang(mapId.value);
const isMobile = inject<ComputedRef<boolean> | boolean | undefined>(
  '$map.isMobile',
  undefined,
);
const buttonInMobile = inject<
  ComputedRef<string | undefined> | string | undefined
>('$map.buttonInMobile', undefined);

const menuMode = computed(
  () => !!unref(isMobile) && unref(buttonInMobile) === 'menu',
);

const buttons = ref<MapControlButtonState[]>([]);
const expandedModuleId = ref<string | null>(null);
const store = useMapToolbar(mapId.value);
const moreOpen = ref(false);
const moreOpenCorner = ref<Position | null>(null);
const availableWidth = ref(
  typeof window === 'undefined' ? 0 : toolbarAvailableWidth(window.innerWidth),
);
const hostHeight = ref(0);
const reservedByCorner = ref<
  Partial<Record<Position, { width: number; height: number }>>
>({});
const menuUsedByCorner = ref<Partial<Record<Position, number>>>({});
const rootRef = ref<HTMLElement | null>(null);

let unsubStore: (() => void) | undefined;
let offResize: (() => void) | undefined;
let offDoc: (() => void) | undefined;
let offKey: (() => void) | undefined;
let resizeObserver: ResizeObserver | undefined;

function syncStoreSnapshot() {
  const expanded = store.getExpandedModuleId();
  expandedModuleId.value = expanded;
  buttons.value = store.getAll({ location: 'toolbar' });
}

function findMapContainer(): HTMLElement | null {
  const fromRef = rootRef.value?.closest('.map-container');
  if (fromRef instanceof HTMLElement) return fromRef;
  const fromContent = document
    .getElementById(mapId.value)
    ?.closest('.map-container');
  return fromContent instanceof HTMLElement ? fromContent : null;
}

function syncCornerReserved() {
  if (!menuMode.value) {
    reservedByCorner.value = {};
    menuUsedByCorner.value = {};
    return;
  }
  const nextReserved: Partial<
    Record<Position, { width: number; height: number }>
  > = {};
  const nextUsed: Partial<Record<Position, number>> = {};
  for (const position of CORNER_POSITIONS) {
    const host = document.getElementById(`${position}-${mapId.value}`);
    nextReserved[position] = measureCornerStandaloneReserved(host);
    const used = measureCornerMenuUsedPx(host);
    if (used != null) nextUsed[position] = used;
  }
  reservedByCorner.value = nextReserved;
  menuUsedByCorner.value = nextUsed;
}

function readHost() {
  const el = findMapContainer();
  if (el) {
    hostHeight.value = el.clientHeight;
    return el.clientWidth;
  }
  hostHeight.value = 0;
  return typeof window === 'undefined' ? 0 : window.innerWidth;
}

function syncHost() {
  availableWidth.value = toolbarAvailableWidth(readHost());
  syncCornerReserved();
}

function observeHost() {
  resizeObserver?.disconnect();
  resizeObserver = undefined;
  if (typeof ResizeObserver === 'undefined') return;

  resizeObserver = new ResizeObserver(() => syncHost());
  const mapEl = findMapContainer();
  if (mapEl) resizeObserver.observe(mapEl);

  if (menuMode.value) {
    for (const position of CORNER_POSITIONS) {
      const host = document.getElementById(`${position}-${mapId.value}`);
      if (host) resizeObserver.observe(host);
    }
  }
}

function collapseExpanded() {
  store.setExpandedModule(null);
}

function onToolbarButtonClick(btn: MapControlButtonState, e: MouseEvent) {
  handleToolbarButtonClick(btn, e, store);
  moreOpen.value = false;
  moreOpenCorner.value = null;
}

onMounted(() => {
  unsubStore = store.subscribe(syncStoreSnapshot);
  syncStoreSnapshot();

  window.addEventListener('resize', syncHost);
  offResize = () => window.removeEventListener('resize', syncHost);

  const onDoc = (e: MouseEvent) => {
    const t = e.target;
    const inside =
      t instanceof Element &&
      t.closest(TOOLBAR_EXPAND_OUTSIDE_IGNORE_SELECTOR);
    if (!inside) {
      moreOpen.value = false;
      moreOpenCorner.value = null;
      if (
        expandedModuleId.value &&
        shouldCloseExpandedOnOutsideClick(buttons.value, expandedModuleId.value)
      ) {
        collapseExpanded();
      }
    }
  };
  document.addEventListener('pointerdown', onDoc);
  offDoc = () => document.removeEventListener('pointerdown', onDoc);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      moreOpen.value = false;
      moreOpenCorner.value = null;
      collapseExpanded();
    }
  };
  document.addEventListener('keydown', onKey);
  offKey = () => document.removeEventListener('keydown', onKey);
});

watch(
  [rootRef, menuMode, buttons],
  () => {
    observeHost();
    syncHost();
  },
  { flush: 'post' },
);

onUnmounted(() => {
  unsubStore?.();
  offResize?.();
  offDoc?.();
  offKey?.();
  resizeObserver?.disconnect();
});

const expansion = computed(() =>
  planToolbarExpansion(
    groupToolbarButtons(buttons.value),
    expandedModuleId.value,
  ),
);

const primaryButtons = computed(() =>
  expansion.value.primaryGroups.flatMap((g) => g.buttons),
);

const secondaryButtons = computed(() => expansion.value.secondaryButtons);

const secondaryPosition = computed((): Position => {
  const fromBtn = secondaryButtons.value[0]?.position;
  return (fromBtn || props.position || 'bottom-right') as Position;
});

const layout = computed(() =>
  planToolbarLayout({
    buttons: primaryButtons.value,
    menuMode: menuMode.value,
    hostHeight: hostHeight.value,
    availableWidth: availableWidth.value,
    maxVisible: props.maxVisible,
    buttonSize: MAP_BUTTON_SIZE_PX.medium,
    reservedByCorner: reservedByCorner.value,
    menuUsedByCorner: menuUsedByCorner.value,
    cornerPositions: CORNER_POSITIONS,
  }),
);

const groupedButtons = computed(() => layout.value.groups);
const toolbarSplit = computed(() => layout.value.toolbarSplit);
const cornerData = computed(() => layout.value.corners);

const overflowOpen = computed(
  () => moreOpen.value && toolbarSplit.value.overflow.length > 0,
);

const overflowPanelClass = computed(() =>
  toolbarOverflowPanelClassName((props.position || 'bottom-right') as Position),
);

const moreOption = computed(() =>
  mdiButtonState(mdiDotsHorizontal, {
    title: trans.value('map.toolbar.more'),
    active: moreOpen.value,
  }),
);

const closeOption = computed(() =>
  mdiButtonState(mdiClose, {
    title: trans.value('map.toolbar.close'),
    role: 'close',
  }),
);

function cornerMoreOption(position: Position) {
  return mdiButtonState(mdiDotsHorizontal, {
    title: trans.value('map.toolbar.more'),
    active: moreOpenCorner.value === position,
  });
}

function secondaryForCorner(position: Position) {
  if (!secondaryButtons.value.length) return [];
  return secondaryPosition.value === position ? secondaryButtons.value : [];
}

watch(
  () => toolbarSplit.value.overflow.length,
  (n) => {
    if (!n) moreOpen.value = false;
  },
);

function onOverflowAction(btn: MapControlButtonState, e: MouseEvent) {
  onToolbarButtonClick(btn, e);
}

function toggleCornerMore(position: Position) {
  moreOpenCorner.value = moreOpenCorner.value === position ? null : position;
}
</script>

<template>
  <ModuleContainer
    v-if="!menuMode"
    v-bind="moduleContainerProps"
  >
    <template #btn>
      <div
        v-if="groupedButtons.length || secondaryButtons.length"
        ref="rootRef"
        class="map-toolbar-control"
      >
        <MapControlGroupButton
          v-if="toolbarSplit.visible.length || toolbarSplit.overflow.length"
          row
        >
          <MapControlGroupButton
            v-for="group in toolbarSplit.visible"
            :key="group.id"
            row
          >
            <MapCommonButton
              v-for="btn in group.buttons"
              :key="btn.id"
              :option="btn"
              @click="onToolbarButtonClick(btn, $event)"
            />
          </MapControlGroupButton>
          <MapCommonButton
            v-if="toolbarSplit.overflow.length"
            :option="moreOption"
            aria-haspopup="true"
            :aria-expanded="overflowOpen"
            @click.stop="moreOpen = !moreOpen"
          />
        </MapControlGroupButton>
        <div
          v-if="overflowOpen"
          :class="overflowPanelClass"
          role="menu"
        >
          <MapControlGroupButton
            v-for="group in toolbarSplit.overflow"
            :key="group.id"
            row
          >
            <MapCommonButton
              v-for="btn in group.buttons"
              :key="btn.id"
              :option="btn"
              @click="onOverflowAction(btn, $event)"
            />
          </MapControlGroupButton>
        </div>
        <div
          v-if="secondaryButtons.length"
          class="map-toolbar-secondary-row"
          role="toolbar"
        >
          <MapControlGroupButton
            :row="secondaryButtons[0]?.orientation === 'row'"
          >
            <MapCommonButton
              :option="closeOption"
              @click.stop="collapseExpanded"
            />
            <MapCommonButton
              v-for="btn in secondaryButtons"
              :key="btn.id"
              :option="btn"
              @click="onToolbarButtonClick(btn, $event)"
            />
          </MapControlGroupButton>
        </div>
      </div>
    </template>
    <slot />
  </ModuleContainer>

  <div
    v-else
    class="map-toolbar-menu-hosts"
  >
    <ModuleContainer
      v-for="corner in cornerData"
      :key="corner.position"
      v-bind="moduleContainerProps"
      :position="corner.position"
      :control-order="0"
    >
      <template #btn>
        <div
          class="map-toolbar-control map-toolbar-corner"
          :data-position="corner.position"
        >
          <div class="map-toolbar-corner-stack">
            <MapCommonButton
              v-if="corner.showMore && corner.prefer === 'end'"
              :option="cornerMoreOption(corner.position)"
              aria-haspopup="true"
              :aria-expanded="moreOpenCorner === corner.position"
              @pointerdown.stop
              @click.stop="toggleCornerMore(corner.position)"
            />
            <MapControlGroupButton
              v-for="group in corner.split.visible"
              :key="group.id"
              :row="group.orientation === 'row'"
            >
              <MapCommonButton
                v-for="btn in group.buttons"
                :key="btn.id"
                :option="btn"
                @click="onToolbarButtonClick(btn, $event)"
              />
            </MapControlGroupButton>
            <div
              v-if="secondaryForCorner(corner.position).length"
              class="map-toolbar-secondary-row"
              role="toolbar"
            >
              <MapControlGroupButton
                :row="
                  secondaryForCorner(corner.position)[0]?.orientation === 'row'
                "
              >
                <MapCommonButton
                  :option="closeOption"
                  @click.stop="collapseExpanded"
                />
                <MapCommonButton
                  v-for="btn in secondaryForCorner(corner.position)"
                  :key="btn.id"
                  :option="btn"
                  @click="onToolbarButtonClick(btn, $event)"
                />
              </MapControlGroupButton>
            </div>
            <MapCommonButton
              v-if="corner.showMore && corner.prefer === 'start'"
              :option="cornerMoreOption(corner.position)"
              aria-haspopup="true"
              :aria-expanded="moreOpenCorner === corner.position"
              @pointerdown.stop
              @click.stop="toggleCornerMore(corner.position)"
            />
          </div>
        </div>
      </template>
      <template #btnOutside>
        <div
          v-if="corner.showMore && moreOpenCorner === corner.position"
          class="map-toolbar-overflow"
          role="menu"
          @pointerdown.stop
        >
          <MapControlGroupButton
            v-for="group in corner.split.overflow"
            :key="group.id"
            row
          >
            <MapCommonButton
              v-for="btn in group.buttons"
              :key="btn.id"
              :option="btn"
              @click="onOverflowAction(btn, $event)"
            />
          </MapControlGroupButton>
        </div>
      </template>
    </ModuleContainer>
    <ModuleContainer
      v-if="
        secondaryButtons.length &&
        !cornerData.some((c) => c.position === secondaryPosition)
      "
      v-bind="moduleContainerProps"
      :position="secondaryPosition"
      :control-order="0"
    >
      <template #btn>
        <div class="map-toolbar-control">
          <div
            class="map-toolbar-secondary-row"
            role="toolbar"
          >
            <MapControlGroupButton
              :row="secondaryButtons[0]?.orientation === 'row'"
            >
              <MapCommonButton
                :option="closeOption"
                @click.stop="collapseExpanded"
              />
              <MapCommonButton
                v-for="btn in secondaryButtons"
                :key="btn.id"
                :option="btn"
                @click="onToolbarButtonClick(btn, $event)"
              />
            </MapControlGroupButton>
          </div>
        </div>
      </template>
    </ModuleContainer>
    <slot />
  </div>
</template>
