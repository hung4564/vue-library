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
        :title="item.getName()"
        @click="emit('click', item)"
      >
        <span>{{ item.getName() }}</span>
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
            @click="onLayerAction(menu)"
          />
        </template>
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
        <button
          v-if="content_menus.length > 0"
          class="layer-item__button"
          :disabled="loading"
          @click.prevent.stop="handleContextClick"
        >
          <SvgIcon size="14" type="mdi" :path="path.menu" />
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
    </div>

    <div :id="bottomLayerItem" />
  </div>
</template>
<script setup lang="ts">
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
import { computed, ref } from 'vue';
import { IListViewUI, MenuAction } from '../../../../interfaces';
import LayerItemIcon from './layer-item-icon.vue';
import LayerItemSlider from './layer-item-slider.vue';
import LayerMenu from './menu/index.vue';
const props = defineProps<{ item: IListViewUI; mapId: string }>();
const emit = defineEmits([
  'update:item',
  'click',
  'click:remove',
  'click:action',
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
const loading = ref(false);
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
const bottomLayerItem = computed(() => {
  return `layer-item-${props.item.id}-bottom`;
});
const button_menus = computed<MenuAction<IListViewUI>[]>(() => {
  if (!props.item) {
    return [];
  }
  return props.item.menus || [];
});
const extra_menus = computed(() => {
  return button_menus.value
    .filter((x) => !x.location || x.location == 'extra')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const extra_bottoms = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'bottom')
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
function onLayerAction(action: MenuAction<IListViewUI>) {
  emit('click:action', { action, item: props.item });
}
function handleContextClick(event: MouseEvent) {
  emit('click:content-menu', {
    event,
    actions: content_menus.value,
    item: props.item,
  });
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
