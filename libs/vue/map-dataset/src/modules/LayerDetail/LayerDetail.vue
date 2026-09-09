<script lang="ts">
export default {
  name: 'detail-layer-info',
};
</script>

<script setup lang="ts">
import { fitBounds } from '@hungpvq/map-core';
import {
  convertItemToFeature,
  LAYER_DETAIL_LOCALE,
  resolveDatasetBbox,
  type FieldFeaturesDef,
  type IDataset,
} from '@hungpvq/map-dataset';
import {
  createExportGeoSubmenu,
  createMenuItemExportGeo,
  getDatasetFeatureCollection,
  getExportGeoMenuOptions,
  hasGeojsonExportData,
} from '@hungpvq/map-dataset/geo-export';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { handleMenuAction } from '@hungpvq/map-dataset/menu';
import { ContextMenu, DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCrosshairsGps, mdiDownload } from '@mdi/js';
import type { Feature, Geometry } from 'geojson';
import { computed, ref } from 'vue';
import { useMapDatasetHighlight } from '../../store';
import TableTdLayer from './table-td-layer.vue';

const props = withDefaults(
  defineProps<{
    item?: Record<string, unknown>;
    view?: IDataset;
    fields?: FieldFeaturesDef;
    popupProps?: Record<string, unknown>;
  }>(),
  {
    fields: () => [],
    popupProps: () => ({}),
  },
);

const emit = defineEmits<{ close: [] }>();
const { mapId, callMap } = useMap();
const { setFeatureHighlight } = useMapDatasetHighlight(mapId.value);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault(LAYER_DETAIL_LOCALE);

const show = ref(true);
const exportMenuRef = ref<{
  open: (event: MouseEvent) => void;
  close: () => void;
}>();

function itemAsFeature(
  item: Record<string, unknown> | undefined,
): Feature | undefined {
  if (!item?.geometry || typeof item.geometry !== 'object') return undefined;
  return convertItemToFeature(
    item as { id?: string | number; geometry: Geometry },
  );
}

const detailFeature = computed(() => itemAsFeature(props.item));

const canFillBound = computed(() => {
  if (detailFeature.value) return true;
  return !!(props.view && resolveDatasetBbox(props.view));
});

const canExport = computed(() => {
  if (detailFeature.value) return true;
  return !!(props.view && hasGeojsonExportData(props.view));
});

const layerHost = computed<IDataset>(() => {
  if (props.view) return props.view;
  return {
    id: 'layer-detail-export',
    getName: () => 'feature',
  } as IDataset;
});

const exportMenuItem = computed(() =>
  createMenuItemExportGeo({
    filename: (layer) => layer.getName?.() || 'feature',
    getCollection: async () => {
      if (detailFeature.value) {
        return {
          type: 'FeatureCollection',
          features: [detailFeature.value],
        };
      }
      if (props.view) return getDatasetFeatureCollection(props.view);
      return null;
    },
  }),
);

const exportChildren = computed(() =>
  createExportGeoSubmenu(getExportGeoMenuOptions(exportMenuItem.value)),
);

function handleClose() {
  setFeatureHighlight(undefined, 'detail');
  emit('close');
}

function onUpdateShow(val: boolean) {
  show.value = val;
  if (!val) handleClose();
}

function onFillBound() {
  if (!canFillBound.value) return;
  callMap((map) => {
    if (detailFeature.value) {
      fitBounds(map, detailFeature.value);
      return;
    }
    const bbox = props.view ? resolveDatasetBbox(props.view) : undefined;
    if (!bbox) return;
    fitBounds(map, [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ]);
  });
}

function onExportClick(event: MouseEvent) {
  if (!canExport.value) return;
  exportMenuRef.value?.open(event);
}

function onExportChild(action: MenuAction, event: MouseEvent) {
  handleMenuAction(action, {
    event,
    layer: layerHost.value,
    mapId: mapId.value,
    value: layerHost.value,
  });
  exportMenuRef.value?.close();
}

const { panelBind } = useRegisterMapControl(mapId, {
  id: 'mapLayerDetail',
  panelKind: 'popup',
  title: () => trans.value('map.layer-control.info.title'),
  show,
  setShow: (value) => {
    show.value = value;
    if (!value) handleClose();
  },
  getProps: () => ({
    ...(props.popupProps || {}),
  }),
  actions: [
    {
      type: 'mapLayerDetail',
      run: () => {
        show.value = !show.value;
        if (!show.value) handleClose();
      },
    },
  ],
});
</script>
<template>
  <ModuleContainer v-bind="$attrs">
    <template #draggable="slotProps">
      <DraggableItemPopup
        :show="show"
        @close="handleClose"
        @update:show="onUpdateShow"
        :width="520"
        v-bind="{ ...slotProps, ...popupProps, ...panelBind }"
        :title="trans('map.layer-control.info.title')"
      >
        <template #title>
          {{ trans('map.layer-control.info.title') }}
        </template>
        <template #extra-btn>
          <BaseButton
            v-if="canFillBound"
            class="layer-detail-action"
            :title="trans('map.layer-control.info.fillBound')"
            :aria-label="trans('map.layer-control.info.fillBound')"
            @click.stop="onFillBound"
          >
            <SvgIcon :size="16" type="mdi" :path="mdiCrosshairsGps" />
          </BaseButton>
          <BaseButton
            v-if="canExport"
            class="layer-detail-action"
            :title="trans('map.layer-control.info.export')"
            :aria-label="trans('map.layer-control.info.export')"
            @click.stop="onExportClick"
          >
            <SvgIcon :size="16" type="mdi" :path="mdiDownload" />
          </BaseButton>
        </template>
        <div class="table-show-info">
          <div class="table-content">
            <TableTdLayer
              :field="field"
              :label="field.trans ? trans(field.trans) : field.text"
              :item="item"
              :view="view"
              v-for="(field, i) in fields"
              :key="i"
            />
          </div>
        </div>
      </DraggableItemPopup>
      <ContextMenu ref="exportMenuRef">
        <ul class="context-menu layer-context-menu">
          <li
            v-for="(child, index) in exportChildren"
            :key="child.id || index"
            class="layer-context-menu__item"
            @click.stop="onExportChild(child, $event)"
          >
            <div class="layer-context-menu__item-icon">
              <SvgIcon
                size="16"
                type="mdi"
                :path="('icon' in child && child.icon) || mdiDownload"
              />
            </div>
            <span>{{ 'name' in child ? child.name : '' }}</span>
          </li>
        </ul>
      </ContextMenu>
    </template>
  </ModuleContainer>
</template>
