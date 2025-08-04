<template>
  <div class="layer-item-container">
    <div class="layer-item__info">
      <div v-if="isHasIcon" class="layer-item__icon">
        <component
          :is="props.item.icon!()"
          :data="item"
          :mapId="mapId"
        ></component>
      </div>
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
            :item="menu"
            :data="item"
            :disabled="loading"
            :mapId="mapId"
            @click="onLayerAction(menu)"
          />
        </template>
        <BaseButton
          v-if="!item.config.disabled_delete && !props.readonly"
          :disabled="loading"
          @click.stop="onRemove"
        >
          <SvgIcon size="14" type="mdi" :path="path.delete" />
        </BaseButton>
        <slot name="extra-btn" :loading="loading" />
        <BaseButton
          v-if="content_menus.length > 0"
          :disabled="loading"
          @click.prevent.stop="handleContextClick"
        >
          <SvgIcon size="14" type="mdi" :path="path.menu" />
        </BaseButton>
        <template v-if="!showBottom">
          <template v-for="(menu, i) in extra_bottoms" :key="i">
            <LayerMenu
              :item="menu"
              :data="item"
              :disabled="loading"
              :mapId="mapId"
              @click="onLayerAction(menu)"
            />
          </template>
          <BaseButton @click.stop="onToggleLegend()" v-if="isHasLegend">
            <SvgIcon
              size="14"
              type="mdi"
              :path="legendShow ? path.legendClose : path.legendOpen"
            />
          </BaseButton>
        </template>
      </div>
    </div>
    <div class="layer-item__action" v-if="showBottom">
      <template v-for="(menu, i) in bottoms" :key="i">
        <LayerMenu
          :item="menu"
          :data="item"
          :disabled="loading"
          :mapId="mapId"
          @click="onLayerAction(menu)"
        />
      </template>
      <div class="v-spacer"></div>
      <template v-for="(menu, i) in extra_bottoms" :key="i">
        <LayerMenu
          :item="menu"
          :data="item"
          :disabled="loading"
          :mapId="mapId"
          @click="onLayerAction(menu)"
        />
      </template>
      <BaseButton @click.stop="onToggleChildren()" v-if="isHasChildren">
        <SvgIcon
          size="14"
          type="mdi"
          :path="childrenShow ? path.legendClose : path.legendOpen"
        />
      </BaseButton>
      <BaseButton @click.stop="onToggleLegend()" v-if="isHasLegend">
        <SvgIcon
          size="14"
          type="mdi"
          :path="legendShow ? path.legendClose : path.legendOpen"
        />
      </BaseButton>
    </div>

    <div v-if="isHasLegend && legendShow">
      <component :is="props.item.legend!()"></component>
    </div>
    <div v-if="isHasChildren && childrenShow" class="layer-item__children">
      <LayerSubItem
        v-for="item in children"
        :key="item.id"
        :item="item"
        :mapId="mapId"
      ></LayerSubItem>
    </div>
  </div>
</template>
<script setup lang="ts">
import { MapSimple } from '@hungpvq/shared-map';
import { BaseButton, useMap, useShow } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiCrosshairsGps,
  mdiDelete,
  mdiDotsVertical,
  mdiLayers,
  mdiLoading,
  mdiMenuDown,
  mdiMenuLeft,
  mdiPencilOutline,
} from '@mdi/js';
import { computed, onMounted, ref } from 'vue';
import type { IDataset, MenuAction } from '../../../../interfaces';
import { WithSetOpacity } from '../../../../interfaces/dataset.extra';
import type { IListViewUI } from '../../../../model';
import {
  findAllComponentsByType,
  runAllComponentsWithCheck,
} from '../../../../model';
import { isHasSetOpacity } from '../../../../utils/check';
import LayerSubItem from './layer-sub-item.vue';
import LayerMenu from './menu/index.vue';
const props = defineProps<{
  item: IListViewUI;
  mapId: string;
  readonly: boolean;
}>();
const emit = defineEmits([
  'update:item',
  'click',
  'click:remove',
  'click:action',
  'click:content-menu',
]);
const { callMap } = useMap(props);
const path = {
  menu: mdiDotsVertical,
  loading: mdiLoading,
  layer: mdiLayers,
  flyTo: mdiCrosshairsGps,
  delete: mdiDelete,
  edit: mdiPencilOutline,
  legendOpen: mdiMenuLeft,
  legendClose: mdiMenuDown,
};
const loading = ref(false);
const onRemove = () => {
  emit('click:remove', props.item);
};
const button_menus = computed<MenuAction<any>[]>(() => {
  if (!props.item) {
    return [];
  }
  return props.item.getMenus() || [];
});
const extra_menus = computed(() => {
  return button_menus.value
    .filter((x) => !x.location || x.location == 'extra')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const bottoms = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'prebottom')
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
  return (
    !props.readonly &&
    (!props.item.config.disabled_opacity || extra_bottoms.value.length > 0)
  );
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

const isHasIcon = computed(() => props.item && props.item.icon);
const isHasLegend = computed(() => props.item && !!props.item.legend);
const [childrenShow, onToggleChildren] = useShow(
  props.item.config.init_show_children ?? false,
);
const [legendShow, onToggleLegend] = useShow(
  props.item.config.init_show_legend ?? false,
);
const isHasChildren = ref(false);
const children = ref<IListViewUI[]>([]);
onMounted(() => {
  const allComponentsOfType = findAllComponentsByType(
    props.item,
    'list-item',
  ) as IListViewUI[];
  isHasChildren.value = allComponentsOfType.length > 0;
  children.value = allComponentsOfType.slice().reverse();
});
function onSetOpacity(view: IListViewUI) {
  const parent = props.item.getParent() || props.item;
  callMap((map: MapSimple) => {
    runAllComponentsWithCheck(
      parent,
      (dataset): dataset is IDataset & WithSetOpacity =>
        isHasSetOpacity(dataset),
      [
        (dataset) => {
          if (!view.config.disabled_opacity) {
            dataset.setOpacity(map, view.opacity);
          }
        },
      ],
    );
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

.layer-item__icon {
  flex-grow: 0;
  flex-shrink: 0;
  width: 25px;
  display: flex;
  align-items: center;
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
.layer-item__children {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px;
  box-sizing: border-box;
}
</style>
