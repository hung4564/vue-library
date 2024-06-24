<template>
  <div class="layer-item-container">
    <div class="layer-item__info">
      <LayerItemIcon
        class="layer-item__icon"
        :loading="loading"
        :item="{ item }"
      />
      <span
        class="layer-item__title"
        :title="item.name"
        @click="emit('click', item)"
      >
        <span>{{ item.name }}</span>
      </span>
      <div class="v-spacer"></div>
      <div class="layer-item__title-action">
        <slot name="pre-btn" :loading="loading" />
        <template v-for="(menu, i) in extra_menus" :key="i">
          <LayerMenu
            class="layer-item__button"
            :item="menu"
            :data="item"
            :disabled="loading"
            :mapId="mapId"
            @click="onLayerAction(menu)"
          />
        </template>
        <button
          class="layer-item__button"
          v-if="!item.config.disable_delete"
          :disabled="loading"
          @click.stop="onRemove"
        >
          <SvgIcon size="14" type="mdi" :path="path.delete" />
        </button>
        <slot name="extra-btn" :loading="loading" />
        <button
          v-if="content_menus.length > 0"
          class="layer-item__button"
          :disabled="loading"
          @click.prevent.stop="handleContextClick"
        >
          <SvgIcon size="14" type="mdi" :path="path.menu" />
        </button>
        <button
          class="layer-item__button"
          v-if="!showBottom && isHasLegend"
          @click.stop="onToggleLegend"
        >
          <SvgIcon
            size="14"
            type="mdi"
            :path="legendShow ? path.legendClose : path.legendOpen"
          />
        </button>
      </div>
    </div>
    <div class="layer-item__action" v-if="showBottom">
      <div class="layer-item__opacity" v-if="!item.config.disabled_opacity">
        <LayerItemSlider
          v-model.number="opacity"
          max="1"
          step="0.01"
          :disabled="loading"
        />
      </div>
      <div class="v-spacer"></div>
      <template v-for="(menu, i) in extra_bottoms" :key="i">
        <LayerMenu
          class="layer-item__button"
          :item="menu"
          :data="item"
          :disabled="loading"
          :mapId="mapId"
          @click="onLayerAction(menu)"
        />
      </template>
      <button
        class="layer-item__button"
        @click.stop="onToggleLegend"
        v-if="isHasLegend"
      >
        <SvgIcon
          size="14"
          type="mdi"
          :path="legendShow ? path.legendClose : path.legendOpen"
        />
      </button>
    </div>

    <div :id="bottomLayerItem" />
    <div v-if="legendShow && legendConfig">
      <component
        :is="item.component"
        :value="item.option"
        v-for="(item, i) of legendConfig.fields"
        :key="i"
      ></component>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, markRaw, ref, shallowRef } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import LayerItemSlider from './layer-item-slider.vue';
import LayerItemIcon from './layer-item-icon.vue';
import LayerMenu from './menu/index.vue';
import {
  mdiCrosshairsGps,
  mdiDelete,
  mdiDotsVertical,
  mdiEye,
  mdiEyeOff,
  mdiLayers,
  mdiLoading,
  mdiMenuDown,
  mdiMenuLeft,
  mdiPencilOutline,
} from '@mdi/js';
import { getLayerFromView } from '../../../helper';
import { IListView, Menu } from '@hungpvq/vue-map-core';
const props = defineProps<{ item: IListView; mapId: string }>();
const emit = defineEmits([
  'update:item',
  'click',
  'click:remove',
  'click:action',
  'click:edit',
  'click:content-menu',
]);
const isHasLegend = computed(
  () => props.item && getLayerFromView(props.item)?.getView('legend')
);
const legendShow = ref(false);
const legendConfig = shallowRef();
const path = {
  menu: mdiDotsVertical,
  loading: mdiLoading,
  layer: mdiLayers,
  flyTo: mdiCrosshairsGps,
  show: mdiEye,
  hide: mdiEyeOff,
  delete: mdiDelete,
  edit: mdiPencilOutline,
  legendOpen: mdiMenuLeft,
  legendClose: mdiMenuDown,
};
const loading = computed(() => {
  return props.item.metadata && props.item.metadata.loading;
});
const opacity = computed({
  get() {
    return props.item.opacity;
  },
  set(value) {
    let item = props.item;
    item.opacity = value;
    emit('update:item', item);
  },
});
const onRemove = () => {
  emit('click:remove', props.item);
};

function onToggleLegend() {
  legendShow.value = !legendShow.value;
  if (legendShow.value) {
    const config = getLayerFromView(props.item)?.getView('legend').config;
    if (!config) {
      return;
    }
    config.fields = config.fields.map((x) => ({
      component: markRaw(x.component),
      option: x.option,
    }));
    legendConfig.value = config;
  }
}
const button_menus = computed<Menu[]>(() => {
  if (!props.item) {
    return [];
  }
  return getLayerFromView(props.item)!.getView('action')?.menus || [];
});
const extra_menus = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'extra')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const content_menus = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'menu')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const showBottom = computed(() => {
  return !props.item.config.disabled_opacity || extra_bottoms.value.length > 0;
});
function handleContextClick(event: MouseEvent) {
  emit('click:content-menu', {
    event,
    actions: content_menus.value,
    item: props.item,
  });
}
function onLayerAction(action: Menu) {
  emit('click:action', { action, item: props.item });
}
const extra_bottoms = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'bottom')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const bottomLayerItem = computed(() => {
  return `layer-item-${props.item.id}-bottom`;
});
</script>

<style scoped>
.spin {
  animation: 2s linear 0s infinite normal none running spin;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
.layer-item-container {
  overflow: hidden;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.layer-item__info {
  width: 100%;
}
.layer-item__info,
.layer-item__action {
  display: flex;
  align-items: center;
}
.layer-item__action {
  padding-top: 4px;
}
.layer-item__opacity {
  flex: 1 1 auto;
  max-width: 50%;
}
.layer-item__icon {
  flex-grow: 0;
  flex-shrink: 0;
  width: 25px;
}
.layer-item__icon > div {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.layer-item__title {
  display: inline-block;
  text-align: left;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.75rem !important;
  font-weight: 400;
  line-height: 1.25rem;
  letter-spacing: 0.0333333333em !important;
}
.layer-item__title-action {
  display: flex;
  flex-grow: 0;
  align-items: center;
}

.v-spacer {
  flex: 1 1 auto;
}
</style>
