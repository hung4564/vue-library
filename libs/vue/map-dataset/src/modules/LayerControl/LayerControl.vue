<script lang="ts">
export default {
  name: 'layer-control',
};
</script>

<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  getLayerControlTitleMenuState,
  registerAddGeojsonHereForMap,
  warnIfDatasetRegistryMissing,
  type IDataset,
} from '@hungpvq/map-dataset';
import {
  MENU_CONTROL_ID,
  resolveMenuContextSource,
  type MenuContextSource,
} from '@hungpvq/map-dataset/menu';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import {
  defaultMapProps,
  MapCommonButton,
  MapControlButton,
  ModuleContainer,
  UniversalRegistry,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
  type WithShowProps,
} from '@hungpvq/vue-map-core';

import SvgIcon from '@jamescoyle/vue-icon';
import { mdiLayers, mdiPlus } from '@mdi/js';
import { computed, onUnmounted, watch } from 'vue';
import { provideMenuConditionContext } from '../../extra/menu/condition-context';
import DatasetMenus from '../../extra/menu/dataset-menus.vue';
import { useEnsureDatasetBuiltinLocales } from '../../extra/lang/ensure-builtin-locales';
import { useMapDataset } from '../../store/dataset-api';
import CreateControl from '../CreateControl/CreateControl.vue';
import LayerMenuDefaultHandle from '../LayerMenuDefaultHandle.vue';
import LayerList from './part/LayerList.vue';

const props = withDefaults(
  defineProps<
    WithMapPropType &
      WithShowProps & {
        disabledCreate?: boolean;
        disabledCreateGroup?: boolean;
        disabledDeleteAll?: boolean;
        disabledMove?: boolean;
        menuContext?: MenuContextSource;
      }
  >(),
  {
    ...defaultMapProps,
    disabledCreate: false,
    disabledCreateGroup: false,
    disabledDeleteAll: false,
    disabledMove: false,
  },
);
provideMenuConditionContext(() => ({
  control: MENU_CONTROL_ID.layerControl,
  ...resolveMenuContextSource(props.menuContext),
}));
defineSlots<{
  titleList: (props: { mapId: string }) => any;
  endList: (props: { mapId: string }) => any;
  default(): any;
}>();
const { mapId, moduleContainerProps, order } = useMap(props);
const { trans } = useLang(mapId.value);
useEnsureDatasetBuiltinLocales(mapId.value);
warnIfDatasetRegistryMissing(
  (key) => UniversalRegistry.getComponent(key),
  'vue-map-dataset',
);

const path = {
  icon: mdiLayers,
  layer: { create: mdiPlus },
};
const [show, setShow] = useShow(props.show);
const [showCreate, toggleShowCreate] = useShow();
function openAddLayer() {
  toggleShowCreate();
}
const { panelPosition } = useRegisterMapControl(mapId, {
  id: 'mapLayerControl',
  panelKind: 'sidebar',
  title: () => trans.value('map.layer-control.title'),
  buttonPosition: () => props.position,
  show,
  setShow,
  initialPanelPosition: { location: 'left' },
  getProps: () => ({
    disabledCreate: props.disabledCreate,
    disabledCreateGroup: props.disabledCreateGroup,
    disabledDeleteAll: props.disabledDeleteAll,
    disabledMove: props.disabledMove,
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapLayerControl',
      run: () => setShow(),
    },
  ],
});
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapLayerControl',
  getState() {
    return mdiButtonState(path.icon, {
      active: show.value,
      title: trans.value('map.layer-control.title'),
      order: order.value,
    });
  },
  onClick() {
    setShow();
  },
});
watch(show, () => control.sync());

const { addDataset, getDatasets, getDatasetIds } = useMapDataset(mapId.value);
onUnmounted(
  registerAddGeojsonHereForMap(mapId.value, (dataset) => {
    void addDataset(dataset);
  }),
);

const datasetIds = computed(() => getDatasetIds().value);

const titleMenuState = computed(() => {
  void datasetIds.value;
  const roots = getDatasets().filter(Boolean) as IDataset[];
  return getLayerControlTitleMenuState(roots);
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>

    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        v-model:show="show"
        :title="trans('map.layer-control.title')"
        :location="panelPosition.location || 'left'"
      >
        <template #title>
          <span class="layer-control__title">
            {{ trans('map.layer-control.title') }}
          </span>
        </template>
        <template v-if="titleMenuState.data" #after-title>
          <DatasetMenus
            :menus="titleMenuState.menus"
            :data="titleMenuState.data"
            :mapId="mapId"
            :locations="['title']"
            :menuContext="menuContext"
          />
        </template>
        <div class="layer-control">
          <LayerList
            :mapId="mapId"
            :disabledCreate="disabledCreate"
            :disabledCreateGroup="disabledCreateGroup"
            :disabledDeleteAll="disabledDeleteAll"
            :disabledMove="disabledMove"
            @create="openAddLayer"
          >
            <template #title>
              <slot name="titleList" :mapId="mapId">
                <MapControlButton
                  data-testid="map-layer-create"
                  @click.stop="openAddLayer()"
                  v-if="!disabledCreate"
                  variant="plain"
                >
                  <SvgIcon size="14" type="mdi" :path="path.layer.create" />
                </MapControlButton>
              </slot>
            </template>
          </LayerList>
          <div class="base-map-card-container">
            <slot name="endList" :mapId="mapId"> </slot>
          </div>
        </div>
      </DraggableItemSideBar>
    </template>
    <CreateControl v-model:show="showCreate" />
    <slot />
    <LayerMenuDefaultHandle />
  </ModuleContainer>
</template>
