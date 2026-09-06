<script lang="ts">
export default {
  name: 'IdentifyResultControl',
};
</script>

<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import type { IIdentifyView, MenuAction } from '@hungpvq/map-dataset';
import {
  handleMenuAction,
  IDENTIFY_ALL_LAYERS_VALUE,
  IDENTIFY_CONTROL,
  IDENTIFY_CONTROL_LOCALE,
  IDENTIFY_RESULT_CONTROL,
  type IdentifyResultGrouped,
  type IdentifyResultLayerItem,
  type IdentifyResultUpdatePayload,
} from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  defaultMapProps,
  InputSelect,
  ModuleContainer,
  UniversalRegistry,
  useCoordinate,
  useLang,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCursorPointer, mdiSelect } from '@mdi/js';
import type { MapMouseEvent } from 'maplibre-gl';
import { computed, reactive, ref } from 'vue';
import MenuItem from './menu/index.vue';

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
const items = ref<IdentifyResultGrouped[]>([]);
const origin = reactive({ latitude: 0, longitude: 0 });
const layerItems = ref<IdentifyResultLayerItem[]>([]);
const selectedLayerId = ref(IDENTIFY_ALL_LAYERS_VALUE);
const isEventClickActive = ref(false);
const isEventClickBox = ref(false);

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
  if (payload.items !== undefined) items.value = payload.items;
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
          <BaseButton
            @click.stop="onUseMapClick"
            :active="isEventClickActive"
            :disabled="isEventClickActive"
          >
            <SvgIcon size="16" type="mdi" :path="path.mapClick" />
          </BaseButton>
          <BaseButton
            @click.stop="onUseBoxSelect"
            :active="isEventClickBox"
            :disabled="isEventClickBox"
          >
            <SvgIcon size="16" type="mdi" :path="path.boxSelect" />
          </BaseButton>
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
          <div class="identify-control-body">
            <div v-if="loading" class="identify-control-state">
              <div class="identify-control-state__content">
                <div class="identify-control-state__loading"></div>
                <span>{{ trans('map.identify.loading') }}</span>
              </div>
            </div>
            <div v-else-if="!hasSelectedPoint" class="identify-control-state">
              <div class="identify-control-state__content">
                <span>{{ trans('map.identify.no_selection') }}</span>
              </div>
            </div>
            <div v-else-if="items.length === 0" class="identify-control-state">
              <div class="identify-control-state__content">
                <span>{{ trans('map.identify.no_data') }}</span>
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
                          v-for="(menu, i) in child.identify.getMenus()"
                          :key="i"
                        >
                          <MenuItem
                            :item="menu"
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
