<script setup lang="ts">
import {
  MAP_BUTTON_SIZE_PX,
  type Position,
  type WithMapPropType,
} from '@hungpvq/map-core';
import type { MapControlButtonState } from '@hungpvq/map-core/toolbar';
import {
  TOOLBAR_CONTROL_LOCALE,
  cornerVerticalMenuBudgetsPx,
  groupToolbarButtons,
  maxVisibleButtonsInStackHeight,
  maxVisibleToolbarButtons,
  mdiButtonState,
  measureCornerMenuUsedPx,
  measureCornerStandaloneReserved,
  splitToolbarOverflow,
  splitToolbarOverflowKeepGroups,
  toolbarAvailableWidth,
} from '@hungpvq/map-core/toolbar';
import { mdiDotsHorizontal } from '@mdi/js';
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch,
  type ComputedRef,
} from 'vue';
import MapCommonButton from '../../../../components/MapCommonButton.vue';
import MapControlGroupButton from '../../../../components/MapControlGroupButton.vue';
import { defaultMapProps, useMap } from '../../../../hooks';
import ModuleContainer from '../../../../modules/ModuleContainer/ModuleContainer.vue';
import { useLang } from '../../../lang';
import { useMapToolbar } from '../../store';

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
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(TOOLBAR_CONTROL_LOCALE);

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
let resizeObserver: ResizeObserver | undefined;

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

onMounted(() => {
  unsubStore = store.subscribe(() => {
    buttons.value = store.getAll();
  });
  buttons.value = store.getAll();

  window.addEventListener('resize', syncHost);
  offResize = () => window.removeEventListener('resize', syncHost);

  const onDoc = (e: MouseEvent) => {
    if (!moreOpen.value && !moreOpenCorner.value) return;
    const t = e.target;
    if (
      t instanceof Element &&
      t.closest('.map-toolbar-control, .map-toolbar-overflow')
    ) {
      return;
    }
    moreOpen.value = false;
    moreOpenCorner.value = null;
  };
  document.addEventListener('pointerdown', onDoc);
  offDoc = () => document.removeEventListener('pointerdown', onDoc);
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
  resizeObserver?.disconnect();
});

const groupedButtons = computed(() => groupToolbarButtons(buttons.value));
const maxVisibleToolbar = computed(
  () =>
    props.maxVisible ??
    maxVisibleToolbarButtons(availableWidth.value, MAP_BUTTON_SIZE_PX.medium),
);
const toolbarSplit = computed(() =>
  splitToolbarOverflow(groupedButtons.value, maxVisibleToolbar.value),
);

function splitForCorner(position: Position) {
  const groups = groupToolbarButtons(
    buttons.value.filter((b) => (b.position || 'bottom-right') === position),
  );
  const side = position.endsWith('left') ? 'left' : 'right';
  const budgets = cornerVerticalMenuBudgetsPx({
    hostHeight: hostHeight.value,
    topReservedPx: reservedByCorner.value[`top-${side}` as Position]?.height ?? 0,
    bottomReservedPx:
      reservedByCorner.value[`bottom-${side}` as Position]?.height ?? 0,
    topMenuUsedPx: menuUsedByCorner.value[`top-${side}` as Position],
    bottomMenuUsedPx: menuUsedByCorner.value[`bottom-${side}` as Position],
  });
  const budgetPx = position.startsWith('top') ? budgets.topPx : budgets.bottomPx;
  const prefer = position.startsWith('bottom') ? 'end' : 'start';
  const maxVisible =
    props.maxVisible ??
    maxVisibleButtonsInStackHeight(budgetPx, MAP_BUTTON_SIZE_PX.medium);
  const split = splitToolbarOverflowKeepGroups(groups, maxVisible, prefer);
  return {
    position,
    prefer,
    maxVisible,
    split,
    // Hide corner when budget fits nothing (avoids a spilling lone More).
    showMore: split.overflow.length > 0 && maxVisible >= 1,
    hasChrome: groups.length > 0 && (split.visible.length > 0 || maxVisible >= 1),
  };
}

const cornerData = computed(() =>
  CORNER_POSITIONS.map(splitForCorner).filter((c) => c.hasChrome),
);

const overflowOpen = computed(
  () => moreOpen.value && toolbarSplit.value.overflow.length > 0,
);

const overflowPlacement = computed(() => {
  const pos = props.position || 'bottom-right';
  return {
    vertical: pos.startsWith('top') ? 'top' : 'bottom',
    horizontal: pos.endsWith('left') ? 'left' : 'right',
  };
});

const moreOption = computed(() =>
  mdiButtonState(mdiDotsHorizontal, {
    title: trans.value('map.toolbar.more'),
    active: moreOpen.value,
  }),
);

function cornerMoreOption(position: Position) {
  return mdiButtonState(mdiDotsHorizontal, {
    title: trans.value('map.toolbar.more'),
    active: moreOpenCorner.value === position,
  });
}

watch(
  () => toolbarSplit.value.overflow.length,
  (n) => {
    if (!n) moreOpen.value = false;
  },
);

function onOverflowAction(btn: MapControlButtonState, e: MouseEvent) {
  btn.action(e);
  moreOpen.value = false;
  moreOpenCorner.value = null;
}

function toggleCornerMore(position: Position) {
  moreOpenCorner.value =
    moreOpenCorner.value === position ? null : position;
}
</script>

<template>
  <ModuleContainer v-if="!menuMode" v-bind="moduleContainerProps">
    <template #btn>
      <div
        v-if="groupedButtons.length"
        ref="rootRef"
        class="map-toolbar-control"
      >
        <MapControlGroupButton row>
          <MapControlGroupButton
            v-for="group in toolbarSplit.visible"
            :key="group.id"
            row
          >
            <MapCommonButton
              v-for="btn in group.buttons"
              :key="btn.id"
              :option="btn"
              @click="btn.action($event)"
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
          class="map-toolbar-overflow"
          :class="[
            overflowPlacement.vertical === 'top'
              ? 'map-toolbar-overflow-top'
              : 'map-toolbar-overflow-bottom',
            overflowPlacement.horizontal === 'left'
              ? 'map-toolbar-overflow-left'
              : 'map-toolbar-overflow-right',
          ]"
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
      </div>
    </template>
    <slot />
  </ModuleContainer>

  <div v-else class="map-toolbar-menu-hosts">
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
                @click="btn.action($event)"
              />
            </MapControlGroupButton>
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
    <slot />
  </div>
</template>
