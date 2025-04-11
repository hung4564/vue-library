<script setup lang="ts">
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDelete, mdiInboxOutline, mdiPlus } from '@mdi/js';
import { computed } from 'vue';
import MapControlButton from '../../components/MapControlButton.vue';
import { CrsItem, crsStore } from '../../extra/crs';
import { useLang } from '../../extra/lang';
import { Collapse, InputSelect, InputText } from '../../field';
import { useMap, useShow, withMapProps } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const { getCrsItems, setCrsItems } = crsStore;
const props = defineProps({
  ...withMapProps,
});
const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocale } = useLang(mapId.value);

setLocale({
  map: {
    'crs-control': {
      title: 'Crs setting',
      field: {
        name: 'name',
        unit: 'unit',
        epsg: 'epsg',
        proj4js: 'proj4js',
      },
    },
  },
});
const [show, setShow] = useShow(false);

function onToggleShow() {
  setShow(!show.value);
}
const crs_items = computed(() => {
  return getCrsItems(mapId.value);
});
const unit_items = [
  { text: 'degree', value: 'degree' },
  { text: 'meter', value: 'meter' },
];
const path = {
  delete: mdiDelete,
  plus: mdiPlus,
};
const onRemove = (item: CrsItem) => {
  setCrsItems(
    mapId.value,
    crs_items.value.filter((x) => x.epsg !== item.epsg)
  );
};
const onAdd = () => {
  crs_items.value.push({ name: '', unit: 'degree', epsg: '' });
};
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        @click.stop="onToggleShow"
        :tooltip="trans('map.crs-control.title')"
      >
        <SvgIcon :size="18" type="mdi" :path="mdiInboxOutline" />
      </MapControlButton>
    </template>
    <template #draggable="props">
      <DraggableItemPopup
        v-if="show"
        :height="200"
        :width="400"
        v-bind="props"
        v-model:show="show"
        :title="trans('map.crs-control.title')"
      >
        <div class="crs-container">
          <div class="grow">
            <Collapse
              v-for="crs_item in crs_items"
              :key="crs_item.epsg"
              :selected="false"
            >
              <template #header>
                <div class="crs-item-header">
                  <div class="crs-item-header__title">
                    {{ crs_item.name }}
                  </div>
                  <div class="crs-item-header__action">
                    <button
                      class="clickable"
                      v-if="!crs_item.default"
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
                    :readonly="crs_item.default"
                    v-model="crs_item.name"
                    :label="trans('map.crs-control.field.name')"
                  />
                </div>
                <div>
                  <InputText
                    :readonly="crs_item.default"
                    v-model="crs_item.epsg"
                    :label="trans('map.crs-control.field.epsg')"
                  />
                </div>
                <div v-if="!crs_item.default">
                  <InputText
                    v-model="crs_item.proj4js"
                    :label="trans('map.crs-control.field.proj4js')"
                  />
                </div>
                <div v-if="!crs_item.default">
                  <InputSelect
                    v-model="crs_item.unit"
                    :label="trans('map.crs-control.field.unit')"
                    :items="unit_items"
                  />
                </div>
              </div>
            </Collapse>
          </div>
          <div class="crs-item__add">
            <button class="layer-item__button clickable" @click.stop="onAdd()">
              <SvgIcon size="16" type="mdi" :path="path.plus" />
            </button>
          </div>
        </div>
      </DraggableItemPopup>
    </template>

    <slot />
  </ModuleContainer>
</template>
<style scoped>
.crs-container {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.crs-item-header {
  display: flex;
  flex-grow: 1;
}
.grow {
  flex: 1;
  overflow: auto;
}
.crs-item-header__title {
  flex-grow: 1;
}
.crs-item-header__action {
  flex-grow: 0;
}
.crs-item {
  padding: 4px 16px;
}
.crs-item .form-group {
  padding-bottom: 4px;
}
.crs-item__add {
  padding: 8px;
}
.crs-item__add .layer-item__button {
  padding: 8px;
  width: 100%;
  background: transparent;
}
.crs-item-header__action button {
  background-color: transparent;
}
.clickable {
  cursor: pointer;
}

.clickable {
  position: relative;
}

.clickable:hover::before {
  opacity: 0.04;
}

.clickable:before {
  background-color: currentColor;
  bottom: 0;
  content: '';
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.clickable[disabled='disabled'] {
  cursor: default;
  pointer-events: none;
  opacity: 0.25;
}
</style>
