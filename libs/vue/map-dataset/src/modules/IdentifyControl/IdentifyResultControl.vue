<script lang="ts">
export default {
  name: 'IdentifyResultControl',
};
</script>

<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { createMenuConditionContext, getResolvedMenus, handleMenuAction, isMenuItemHidden } from '@hungpvq/map-dataset/menu';
import { IDENTIFY_ALL_LAYERS_VALUE, IDENTIFY_CONTROL, IDENTIFY_CONTROL_LOCALE, IDENTIFY_RESULT_CONTROL, type IdentifyResultGrouped, type IdentifyResultLayerItem, type IdentifyResultUpdatePayload } from '@hungpvq/map-dataset/identify';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import { defaultMapProps, MapControlButton, ModuleContainer, UniversalRegistry, useCoordinate, useLang, useMap, useRegisterMapControl } from '@hungpvq/vue-map-core';
import { InputSelect } from '@hungpvq/vue-map-core/fields';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCursorPointer, mdiSelect } from '@mdi/js';
import type { MapMouseEvent } from 'maplibre-gl';
import { computed, reactive, ref } from 'vue';
import DatasetMenuButton from '../../extra/menu/dataset-menu-button.vue';

const path = {
  boxSelect: mdiSelect,
  mapClick: mdiCursorPointer,
};

const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});

const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
const { format: formatCoordinate } = useCoordinate(mapId.value);
setLocaleDefault(IDENTIFY_CONTROL_LOCALE);

const show = ref(false);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const items = ref<IdentifyResultGrouped[]>([]);
const origin = reactive({ latitude: 0, longitude: 0 });
const layerItems = ref<IdentifyResultLayerItem[]>([]);
const selectedLayerId = ref(IDENTIFY_ALL_LAYERS_VALUE);
const isEventClickActive = ref(false);
const isEventClickBox = ref(false);
const focusedChildKey = ref<string | null>(null);

const flatChildren = computed(() => {
  const out: Array<{
    key: string;
    child: IdentifyResultGrouped['items'][number];
  }> = [];
  for (const group of items.value) {
    for (const child of group.items) {
      out.push({ key: `${group.id}:${child.id}`, child });
    }
  }
  return out;
});

const currentPoint = computed(() => {
  const point = formatCoordinate(origin);
  return point.longitude + ', &nbsp;' + point.latitude;
});
const hasSelectedPoint = computed(
  () => origin.latitude !== 0 || origin.longitude !== 0,
);

function setShow(value: boolean) {
  show.value = value;
}

function applyUpdate(payload?: IdentifyResultUpdatePayload) {
  if (!payload) return;
  if (payload.show != null) show.value = payload.show;
  if (payload.loading != null) loading.value = payload.loading;
  if (payload.error !== undefined) errorMessage.value = payload.error;
  if (payload.items !== undefined) {
    items.value = payload.items;
    if (!focusedChildKey.value && payload.items.length) {
      const first = payload.items[0]?.items[0];
      if (first) focusedChildKey.value = `${payload.items[0].id}:${first.id}`;
    }
  }
  if (payload.origin) {
    origin.latitude = payload.origin.latitude;
    origin.longitude = payload.origin.longitude;
  }
  if (payload.layerItems) layerItems.value = payload.layerItems;
  if (payload.selectedLayerId != null) {
    selectedLayerId.value = payload.selectedLayerId;
  }
  if (payload.isEventClickActive != null) {
    isEventClickActive.value = payload.isEventClickActive;
  }
  if (payload.isEventClickBox != null) {
    isEventClickBox.value = payload.isEventClickBox;
  }
}

const { panelBind } = useRegisterMapControl(mapId, {
  id: IDENTIFY_RESULT_CONTROL.id,
  panelKind: 'popup',
  title: () => trans.value('map.identify.title'),
  buttonPosition: () => props.position,
  show,
  setShow,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: IDENTIFY_RESULT_CONTROL.actionUpdate,
      run: (event) => {
        applyUpdate(event as IdentifyResultUpdatePayload | undefined);
      },
    },
  ],
});

function runIdentifyAction(type: string, event?: unknown) {
  UniversalRegistry.runControlAction(
    mapId.value,
    IDENTIFY_CONTROL.id,
    type,
    event,
  );
}

function onClose() {
  show.value = false;
  runIdentifyAction(IDENTIFY_CONTROL.actionClose);
}

function onUseMapClick() {
  runIdentifyAction(IDENTIFY_CONTROL.actionUseMapClick);
}

function onUseBoxSelect() {
  runIdentifyAction(IDENTIFY_CONTROL.actionUseBoxSelect);
}

function onLayerFilterChange(value: string) {
  selectedLayerId.value = value;
  runIdentifyAction(IDENTIFY_CONTROL.actionSetLayerFilter, {
    identifyId: value === IDENTIFY_ALL_LAYERS_VALUE ? undefined : value,
  });
}

function onMenuAction(
  child: {
    id: string | number;
    data: unknown;
    identify: IIdentifyView;
  },
  menu: MenuAction,
  event?: MapMouseEvent | MouseEvent,
) {
  handleMenuAction(menu, {
    event,
    layer: child.identify,
    mapId: mapId.value,
    value: child.data,
  });
}

function getItemMenus(identify: IIdentifyView) {
  const ctx = createMenuConditionContext(identify, { mapId: mapId.value });
  return getResolvedMenus(identify, 'item').filter(
    (menu) => !isMenuItemHidden(menu, ctx),
  );
}

function onResultKeydown(event: KeyboardEvent) {
  if (!flatChildren.value.length) return;
  const keys = flatChildren.value.map((x) => x.key);
  const index = focusedChildKey.value
    ? keys.indexOf(focusedChildKey.value)
    : -1;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    const next = keys[Math.min(keys.length - 1, Math.max(0, index) + 1)];
    focusedChildKey.value = next;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    const next = keys[Math.max(0, (index < 0 ? 0 : index) - 1)];
    focusedChildKey.value = next;
  } else if (event.key === 'Enter' && focusedChildKey.value) {
    event.preventDefault();
    const hit = flatChildren.value.find((x) => x.key === focusedChildKey.value);
    if (!hit) return;
    const menus = getItemMenus(hit.child.identify);
    if (menus[0]) onMenuAction(hit.child, menus[0], event);
  }
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="p">
      <DraggableItemPopup
        v-if="show"
        v-model:show="show"
        v-bind="{ ...p, ...panelBind }"
        :width="400"
        :height="300"
        @close="onClose"
        :title="trans('map.identify.title')"
      >
        <template #extra-btn>
          <MapControlButton
            @click.stop="onUseMapClick"
            :active="isEventClickActive"
            :disabled="isEventClickActive" variant="plain">
            <SvgIcon size="16" type="mdi" :path="path.mapClick" />
          </MapControlButton>
          <MapControlButton
            @click.stop="onUseBoxSelect"
            :active="isEventClickBox"
            :disabled="isEventClickBox" variant="plain">
            <SvgIcon size="16" type="mdi" :path="path.boxSelect" />
          </MapControlButton>
        </template>
        <div class="identify-control-container">
          <div class="identify-control-header">
            <div class="identify-control-header__row">
              <b>{{ trans('map.identify.point') }}:</b>
              <span v-html="currentPoint"></span>
            </div>
            <div
              v-if="layerItems.length > 0"
              class="identify-control-header__layer"
            >
              <InputSelect
                :model-value="selectedLayerId"
                :label="trans('map.identify.layer')"
                :items="layerItems"
                item-value="value"
                item-text="text"
                @update:model-value="onLayerFilterChange(String($event))"
              />
            </div>
          </div>
          <hr class="identify-control-separator" />
          <div
            class="identify-control-body"
            tabindex="0"
            @keydown="onResultKeydown"
          >
            <div v-if="loading" class="identify-control-state">
              <div class="identify-control-state__content">
                <div class="identify-control-state__loading"></div>
                <span>{{ trans('map.identify.loading') }}</span>
              </div>
            </div>
            <div v-else-if="errorMessage" class="identify-control-state">
              <div class="identify-control-state__content">
                <span>{{ errorMessage || trans('map.identify.error') }}</span>
              </div>
            </div>
            <div v-else-if="!hasSelectedPoint" class="identify-control-state">
              <div class="identify-control-state__content">
                <span>{{ trans('map.identify.no_selection') }}</span>
              </div>
            </div>
            <div v-else-if="items.length === 0" class="identify-control-state">
              <div class="identify-control-state__content">
                <span>{{
                  selectedLayerId !== IDENTIFY_ALL_LAYERS_VALUE
                    ? trans('map.identify.no_data_filtered')
                    : trans('map.identify.no_data')
                }}</span>
              </div>
            </div>
            <template v-else>
              <div
                v-for="item in items"
                :key="item.id"
                class="identify-control-list-item"
              >
                <div class="identify-control-list-item__container">
                  <div
                    class="identify-control-list-item__header"
                    :title="item.name"
                  >
                    {{ item.name || '---' }}
                  </div>
                  <div class="identify-control-list-item__child-container">
                    <div
                      class="identify-control-child-item"
                      v-for="child in item.items"
                      :key="child.id"
                      :title="child.name"
                      :class="{
                        'is-focused':
                          focusedChildKey === `${item.id}:${child.id}`,
                      }"
                      @click="focusedChildKey = `${item.id}:${child.id}`"
                    >
                      <span class="identify-control-child-item__name">
                        {{ child.name }}
                      </span>
                      <div class="identify-control-child-item__spacer"></div>
                      <div
                        class="identify-control-child-item__action"
                        @click.stop
                      >
                        <template
                          v-for="(menu, i) in getItemMenus(child.identify)"
                          :key="i"
                        >
                          <DatasetMenuButton
                            :item="menu"
                            :data="child.identify"
                            :mapId="mapId"
                            @click="onMenuAction(child, menu, $event)"
                          />
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
