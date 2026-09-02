<script setup lang="ts">
import {
  buildMapCrsCatalog,
  formatCrsLabel,
  searchCrsCatalog,
  type CrsItem,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDelete, mdiInboxOutline, mdiPlus } from '@mdi/js';
import { computed, ref } from 'vue';
import MapCommonButton from '../../../../components/MapCommonButton.vue';
import { useLang } from '../../../../extra/lang';
import { Collapse, InputSelect, InputText } from '../../../../field';
import {
  defaultMapProps,
  useMap,
  useShow,
  WithShowProps,
} from '../../../../hooks';
import ModuleContainer from '../../../../modules/ModuleContainer/ModuleContainer.vue';
import { useToolbarControl } from '../../../toolbar';
import { useMapCrsDisplayEpsgs, useMapCrsItems } from '../../hooks';

const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);

setLocaleDefault({
  map: {
    'crs-control': {
      title: 'Crs setting',
      filter: 'Search CRS…',
      custom: 'Custom CRS',
      field: {
        name: 'name',
        unit: 'unit',
        epsg: 'epsg',
        proj4js: 'proj4js',
      },
    },
    'crs-display': {
      show: 'Show in measure',
    },
  },
});
const [show, setShow] = useShow(props.show);

function onToggleShow() {
  setShow(!show.value);
}
const { items: crs_items, setItems } = useMapCrsItems(mapId.value);
const { displayEpsgs, setDisplayEpsgs } = useMapCrsDisplayEpsgs(mapId.value);
const filterQuery = ref('');

const catalogItems = computed(() => buildMapCrsCatalog(crs_items.value));
const filteredCatalog = computed(() => {
  const q = filterQuery.value.trim();
  if (!q) return catalogItems.value;
  return searchCrsCatalog(catalogItems.value, q);
});
const customItems = computed(() => crs_items.value.filter((item) => !item.default));

const unit_items = [
  { text: 'degree', value: 'degree' },
  { text: 'meter', value: 'meter' },
];
const path = {
  delete: mdiDelete,
  plus: mdiPlus,
};

const onRemove = (item: CrsItem) => {
  setItems(crs_items.value.filter((x) => x.epsg !== item.epsg));
  if (displayEpsgs.value.includes(item.epsg)) {
    setDisplayEpsgs(displayEpsgs.value.filter((epsg) => epsg !== item.epsg));
  }
};
const onAdd = () => {
  crs_items.value.push({ name: '', unit: 'degree', epsg: '' });
  setItems(crs_items.value);
};
const patchCustomItem = (item: CrsItem, patch: Partial<CrsItem>) => {
  Object.assign(item, patch);
  setItems([...crs_items.value]);
};
const isDisplayed = (epsg: string) => displayEpsgs.value.includes(epsg);
const toggleDisplay = (epsg: string, checked: boolean) => {
  if (epsg === '4326') return;
  if (checked) {
    if (!displayEpsgs.value.includes(epsg)) {
      setDisplayEpsgs([...displayEpsgs.value, epsg]);
    }
    return;
  }
  setDisplayEpsgs(displayEpsgs.value.filter((code) => code !== epsg));
};

const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapCrsControl',
  getState() {
    return {
      visible: true,
      title: trans.value('map.crs-control.title'),
      icon: {
        type: 'mdi',
        path: mdiInboxOutline,
      },
    };
  },
  onClick() {
    onToggleShow();
  },
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
      <DraggableItemPopup
        v-if="show"
        :height="480"
        :width="400"
        v-bind="props"
        v-model:show="show"
        :title="trans('map.crs-control.title')"
      >
        <div class="crs-container">
          <div class="crs-catalog">
            <input
              v-model="filterQuery"
              type="search"
              class="crs-catalog__filter"
              :placeholder="trans('map.crs-control.filter')"
            />
            <ul class="crs-catalog__list">
              <li
                v-for="item in filteredCatalog"
                :key="item.epsg"
                class="crs-catalog__item"
              >
                <label
                  class="crs-item-header__display"
                  :title="trans('map.crs-display.show')"
                >
                  <input
                    type="checkbox"
                    :checked="isDisplayed(item.epsg)"
                    :disabled="item.epsg === '4326'"
                    @change="
                      toggleDisplay(
                        item.epsg,
                        ($event.target as HTMLInputElement).checked,
                      )
                    "
                  />
                </label>
                <span class="crs-catalog__label">{{ formatCrsLabel(item) }}</span>
              </li>
            </ul>
          </div>

          <div v-if="customItems.length" class="crs-custom">
            <div class="crs-custom__title">{{ trans('map.crs-control.custom') }}</div>
            <div class="crs-custom__list">
              <Collapse
                v-for="(crs_item, index) in customItems"
                :key="crs_item.epsg || `custom-${index}`"
                :selected="false"
              >
                <template #header>
                  <div class="crs-item-header">
                    <div class="crs-item-header__title">
                      {{ crs_item.name || crs_item.epsg || 'New CRS' }}
                    </div>
                    <div class="crs-item-header__action">
                      <button
                        type="button"
                        class="clickable"
                        @click.stop="onRemove(crs_item)"
                      >
                        <SvgIcon size="16" type="mdi" :path="path.delete" />
                      </button>
                    </div>
                  </div>
                </template>
                <div class="crs-item">
                  <div>
                    <InputText
                      :model-value="crs_item.name"
                      :label="trans('map.crs-control.field.name')"
                      @update:model-value="patchCustomItem(crs_item, { name: $event })"
                    />
                  </div>
                  <div>
                    <InputText
                      :model-value="crs_item.epsg"
                      :label="trans('map.crs-control.field.epsg')"
                      @update:model-value="patchCustomItem(crs_item, { epsg: $event })"
                    />
                  </div>
                  <div>
                    <InputText
                      :model-value="crs_item.proj4js"
                      :label="trans('map.crs-control.field.proj4js')"
                      @update:model-value="patchCustomItem(crs_item, { proj4js: $event })"
                    />
                  </div>
                  <div>
                    <InputSelect
                      :model-value="crs_item.unit"
                      :label="trans('map.crs-control.field.unit')"
                      :items="unit_items"
                      @update:model-value="patchCustomItem(crs_item, { unit: $event })"
                    />
                  </div>
                </div>
              </Collapse>
            </div>
          </div>

          <div class="crs-item__add">
            <button
              type="button"
              class="layer-item__button clickable"
              @click.stop="onAdd()"
            >
              <SvgIcon size="16" type="mdi" :path="path.plus" />
            </button>
          </div>
        </div>
      </DraggableItemPopup>
    </template>

    <slot />
  </ModuleContainer>
</template>
