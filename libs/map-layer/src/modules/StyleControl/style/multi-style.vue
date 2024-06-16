<script setup lang="ts">
import { useShow, InputSelect, BaseButton } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import SingleStyle from './single-style.vue';
import { mdiClose, mdiDelete, mdiPlus } from '@mdi/js';
import { Layer } from 'mapbox-gl';
import { computed, nextTick, ref, watch } from 'vue';
import { LayerSimpleMapboxBuild } from '../../../builder';
const props = defineProps({
  trans: {
    required: true,
  },
  mapId: {
    required: true,
  },
});
const emit = defineEmits(['input', 'update-style', 'close']);
const layers = defineModel<Layer[]>({ required: true, default: () => [] });
watch(layers, () => {
  if (!tab.value && layers.value.length > 0) {
    tab.value = layers.value[layers.value.length - 1].id;
  }
});
const onSelectTab = (layer_id: string) => {
  tab.value = undefined;
  nextTick(() => {
    tab.value = layer_id;
  });
};
const onUpdateStyleLayer = (layer: Layer, layer_id: string) => {
  emit('update-style', {
    type: 'update-one-layer',
    layer,
    index: layers.value.findIndex((x) => x.id === layer_id),
  });
};
const onAddStyleLayer = (type: string) => {
  tab.value = undefined;
  emit('update-style', {
    type: 'add-one-layer',
    layer: new LayerSimpleMapboxBuild()
      .setStyleType(type)
      .setColor('#fff')
      .build(),
  });
  onShowAddStyle(false);
};
const onRemoveStyleLayer = (layer_id: string) => {
  let index = layers.value.findIndex((x) => x.id === layer_id);
  if (!layers.value[index]) {
    return;
  }
  tab.value = undefined;
  emit('update-style', {
    type: 'remove-one-layer',
    index,
    layer: layers.value[index],
  });
  layers.value.splice(index, 1);
  if (layers.value[0]) onSelectTab(layers.value[0].id);
};
const tab = ref<string | undefined>(layers.value[0].id);
const tabs = computed(() => {
  return layers.value.map((x, i) => {
    return { text: `#${i + 1}`, value: x.id };
  });
});
const current_layer = computed(() => {
  return layers.value.find((x) => x.id === tab.value);
});
const path = {
  delete: mdiDelete,
  create: mdiPlus,
  close: mdiClose,
};
const [showAdd, setShowAdd] = useShow(false);
const onShowAddStyle = (value: boolean) => {
  setShowAdd(value);
};
</script>
<template lang="">
  <div class="multi-style-edit-container">
    <div class="tab-container">
      <div class="tab-item">
        <input-select
          :modelValue="tab"
          @update:modelValue="onSelectTab"
          :items="tabs"
        ></input-select>
      </div>
      <div
        class="tab-item tab-add clickable"
        @click="onRemoveStyleLayer(tab)"
        :disabled="!tab"
      >
        <div>
          <SvgIcon size="14" type="mdi" :path="path.delete" :disabled="!tab" />
        </div>
      </div>
      <div
        class="tab-item tab-add clickable"
        @click="onShowAddStyle(true)"
        v-if="!showAdd"
      >
        <div>
          <SvgIcon size="14" type="mdi" :path="path.create" />
        </div>
      </div>
      <div
        class="tab-item tab-add clickable"
        @click="onShowAddStyle(false)"
        v-else
      >
        <SvgIcon size="14" type="mdi" :path="path.close" />
      </div>
    </div>
    <div class="style-container" v-if="showAdd">
      <div class="add-style-container">
        <base-button @click="onAddStyleLayer('area')">
          {{ trans('map.style-control.add.area') }}
        </base-button>
        <base-button @click="onAddStyleLayer('line')">
          {{ trans('map.style-control.add.line') }}
        </base-button>
        <base-button @click="onAddStyleLayer('point')">
          {{ trans('map.style-control.add.point') }}
        </base-button>
        <base-button @click="onAddStyleLayer('symbol')">
          {{ trans('map.style-control.add.symbol') }}
        </base-button>
      </div>
    </div>
    <div class="style-container" v-else-if="tab">
      <SingleStyle
        :modelValue="current_layer"
        :trans="trans"
        :mapId="mapId"
        @update-style="onUpdateStyleLayer($event, tab)"
      />
    </div>
  </div>
</template>
<style lang="scss">
.multi-style-edit-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.style-container {
  flex-grow: 1;
  overflow: auto;
  display: flex;
  height: 100%;
}
.add-style-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  & > .map-control__button {
    padding: 8px;
  }
}
.tab-container {
  display: flex;
  border-bottom-width: thin;
  border-bottom-color: #fff;
  border-bottom-style: solid;
  .tab-item {
    flex-grow: 1;
    padding: 8px 16px;
  }
  .tab-add {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    max-width: 20px;
  }
}
</style>
