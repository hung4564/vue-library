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
        <button
          class="layer-item__button"
          :disabled="loading"
          @click.stop="onToggleShow"
        >
          <SvgIcon size="14" type="mdi" :path="path.show" v-if="item.show" />
          <SvgIcon size="14" type="mdi" :path="path.hide" v-else />
        </button>
        <button
          class="layer-item__button"
          v-if="!item.config.disable_delete"
          :disabled="loading"
          @click.stop="onRemove"
        >
          <SvgIcon size="14" type="mdi" :path="path.delete" />
        </button>
        <slot name="extra-btn" :loading="loading" />
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
    </div>

    <div :id="bottomLayerItem" />
  </div>
</template>
<script setup lang="ts">
import { IListView, Menu } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
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
import { computed } from 'vue';
import LayerItemIcon from './layer-item-icon.vue';
import LayerItemSlider from './layer-item-slider.vue';
const props = defineProps<{ item: IListView; mapId: string }>();
const emit = defineEmits([
  'update:item',
  'click',
  'click:remove',
  'click:action',
  'click:edit',
  'click:content-menu',
]);
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
const onToggleShow = () => {
  let item = props.item;
  item.show = !item.show;
  emit('update:item', item);
};
const showBottom = computed(() => {
  return !props.item.config.disabled_opacity;
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
