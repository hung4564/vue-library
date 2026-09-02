<script setup lang="ts">
import type { CrsItem } from '@hungpvq/map-core';
import {
  buildCrsSearchCatalog,
  buildMapCrsCatalog,
  formatCrsLabel,
  getCrsInputSuggestions,
  lookupCrsItem,
  normalizeEpsgCode,
} from '@hungpvq/map-core';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useMapCrsItems } from '../extra/crs/hooks';
import { useMap } from '../hooks';

const model = defineModel<string>({ default: '' });

const props = withDefaults(
  defineProps<{
    label?: string;
    placeholder?: string;
    /** Override map CRS store; when omitted, uses CRS configured on the map. */
    items?: CrsItem[];
  }>(),
  {
    placeholder: 'EPSG:4326',
  },
);

const { mapId } = useMap();
const { items: storeItems } = useMapCrsItems(mapId.value);

const open = ref(false);
const focused = ref(false);
const query = ref('');
const activeIndex = ref(-1);
const blurTimer = ref<ReturnType<typeof setTimeout>>();
const wrapRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLUListElement | null>(null);
const listStyle = ref<Record<string, string>>({});

const sourceItems = computed(() =>
  props.items !== undefined ? props.items : buildMapCrsCatalog(storeItems.value),
);

const catalog = computed(() => buildCrsSearchCatalog(sourceItems.value));

const selectedItem = computed(() => lookupCrsItem(model.value, catalog.value));

const dropdownItems = computed(() =>
  getCrsInputSuggestions(catalog.value, query.value, model.value),
);

const showList = computed(() => open.value && dropdownItems.value.length > 0);

function syncQueryFromModel() {
  const item = selectedItem.value;
  query.value = item ? formatCrsLabel(item) : model.value || '';
  activeIndex.value = -1;
}

watch(
  () => model.value,
  () => {
    if (focused.value) return;
    syncQueryFromModel();
  },
  { immediate: true },
);

watch(dropdownItems, () => {
  activeIndex.value = -1;
});

function updateListPosition() {
  const wrap = wrapRef.value;
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  const gap = 2;
  const spaceBelow = window.innerHeight - rect.bottom - gap;
  const openUp = spaceBelow < 96 && rect.top > spaceBelow;
  listStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '100000',
    maxHeight: '180px',
    ...(openUp
      ? { top: 'auto', bottom: `${window.innerHeight - rect.top + gap}px` }
      : { top: `${rect.bottom + gap}px`, bottom: 'auto' }),
  };
}

function bindPositionListeners(on: boolean) {
  window.removeEventListener('resize', updateListPosition);
  window.removeEventListener('scroll', updateListPosition, true);
  if (on) {
    window.addEventListener('resize', updateListPosition);
    window.addEventListener('scroll', updateListPosition, true);
    updateListPosition();
  }
}

watch(showList, (visible) => {
  nextTick(() => bindPositionListeners(visible));
});

function scrollActiveOptionIntoView() {
  nextTick(() => {
    listRef.value
      ?.querySelector('.input-crs__option._active')
      ?.scrollIntoView({ block: 'nearest' });
  });
}

function onFocus(event: FocusEvent) {
  clearTimeout(blurTimer.value);
  focused.value = true;
  open.value = true;
  nextTick(() => {
    updateListPosition();
    (event.target as HTMLInputElement).select();
  });
}

function commitFromQuery() {
  const q = query.value.trim();
  const selected = selectedItem.value;
  if (
    selected &&
    (q === formatCrsLabel(selected) ||
      q === selected.epsg ||
      q.toLowerCase() === `epsg:${selected.epsg}`)
  ) {
    query.value = formatCrsLabel(selected);
    return;
  }

  const normalized = normalizeEpsgCode(q);
  if (normalized) {
    const item = lookupCrsItem(normalized, catalog.value);
    if (item) {
      selectItem(item);
      return;
    }
    model.value = normalized;
    query.value = `EPSG:${normalized}`;
    return;
  }

  syncQueryFromModel();
}

function onBlur() {
  blurTimer.value = setTimeout(() => {
    focused.value = false;
    open.value = false;
    activeIndex.value = -1;
    commitFromQuery();
  }, 120);
}

function onInput(value: string) {
  query.value = value;
  open.value = true;
  activeIndex.value = -1;
  nextTick(updateListPosition);
}

function selectItem(item: CrsItem) {
  model.value = item.epsg;
  query.value = formatCrsLabel(item);
  open.value = false;
  activeIndex.value = -1;
}

function moveDropdownSelection(delta: number) {
  const items = dropdownItems.value;
  if (!items.length) return;

  if (activeIndex.value < 0) {
    activeIndex.value = delta > 0 ? 0 : items.length - 1;
  } else {
    activeIndex.value = (activeIndex.value + delta + items.length) % items.length;
  }
  scrollActiveOptionIntoView();
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      open.value = true;
      moveDropdownSelection(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      open.value = true;
      moveDropdownSelection(-1);
      break;
    case 'Enter':
      event.preventDefault();
      if (activeIndex.value >= 0 && dropdownItems.value[activeIndex.value]) {
        selectItem(dropdownItems.value[activeIndex.value]);
      } else if (dropdownItems.value.length === 1) {
        selectItem(dropdownItems.value[0]);
      } else {
        commitFromQuery();
        open.value = false;
      }
      break;
    case 'Escape':
      event.preventDefault();
      open.value = false;
      activeIndex.value = -1;
      syncQueryFromModel();
      break;
    default:
      break;
  }
}

onBeforeUnmount(() => {
  clearTimeout(blurTimer.value);
  bindPositionListeners(false);
});
</script>

<template>
  <div class="form-group input-crs">
    <label v-if="label">
      {{ label }}
    </label>
    <div ref="wrapRef" class="input-container input-crs__wrap">
      <input
        :value="query"
        type="text"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="showList"
        :placeholder="placeholder"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput(($event.target as HTMLInputElement).value)"
        @keydown="onKeydown"
      />
    </div>
    <Teleport to="body">
      <ul
        v-if="showList"
        ref="listRef"
        class="input-crs__list input-crs__list--portal"
        :style="listStyle"
        role="listbox"
      >
        <li
          v-for="(item, index) in dropdownItems"
          :key="item.epsg"
          class="input-crs__option"
          :class="{ _active: index === activeIndex }"
          role="option"
          :aria-selected="index === activeIndex"
          @mousedown.prevent="selectItem(item)"
          @mouseenter="activeIndex = index"
        >
          {{ formatCrsLabel(item) }}
        </li>
      </ul>
    </Teleport>
  </div>
</template>
