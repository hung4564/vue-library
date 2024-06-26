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
          <button
            v-if="menu.type === 'item'"
            class="layer-item__button"
            :disabled="loading"
            :title="menu.name"
            v-bind="menu.attr"
            @click="onLayerAction(menu)"
          >
            <template v-if="menu.icon">
              <component
                v-if="typeof menu.icon != 'string'"
                :is="menu.icon()"
                :item="item"
              ></component>
              <SvgIcon size="14" type="mdi" :path="menu.icon" v-else
            /></template>
          </button>
        </template>
        <!-- <button
          class="layer-item__button"
          @click.stop="toggleShow"
          :disabled="loading"
        >
          <SvgIcon size="14" type="mdi" :path="path.show" v-if="isShow" />
          <SvgIcon size="14" type="mdi" :path="path.hide" v-else />
        </button> -->
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
          v-if="item.config.disabled_opacity && isHasLegend"
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
    <div class="layer-item__action" v-if="!item.config.disabled_opacity">
      <div class="layer-item__opacity" v-if="!item.config.disabled_opacity">
        <LayerItemSlider
          v-model.number="opacity"
          max="1"
          step="0.01"
          :disabled="loading"
        />
      </div>
      <div class="v-spacer"></div>
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
    <div v-if="legendShow && legendConfig">
      <component
        :is="legendConfig.component"
        :value="item"
        v-for="(item, i) of legendConfig.items"
        :key="i"
      ></component>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import SvgIcon from '@jamescoyle/vue-icon';
import LayerItemSlider from './layer-item-slider.vue';
import LayerItemIcon from './layer-item-icon.vue';
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
import type { IListView, Menu } from '../../../types/';
const props = defineProps<{ item: IListView }>();
const emit = defineEmits([
  'update:item',
  'click',
  'click:remove',
  'click:action',
  'click:edit',
  'click:content-menu',
]);
const isHasLegend = computed(
  () => props.item && props.item.parent && props.item.parent.getView('legend')
);
const legendShow = ref(false);
const legendConfig = ref();
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
const isShow = computed(() => {
  return props.item.show;
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
    // legendConfig.value = props.item.parent.getView(KEY_BUILD.LEGEND).config;
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
function isFunction(functionToCheck: any) {
  return (
    functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
  );
}
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
