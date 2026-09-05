<template>
  <div class="layer-item-container">
    <div class="layer-item__info">
      <div v-if="isHasIcon" class="layer-item__icon">
        <RegistryItem
          v-if="props.item.icon?.componentKey"
          :componentKey="props.item.icon.componentKey"
          v-bind="props.item.icon.attr"
          :data="item"
          :mapId="mapId"
        ></RegistryItem>
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
            :disabled="loading || isMenuItemDisabled(menu, conditionCtx)"
            :mapId="mapId"
            @click="onLayerAction($event, menu)"
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
              :disabled="loading || isMenuItemDisabled(menu, conditionCtx)"
              :mapId="mapId"
              @click="onLayerAction($event, menu)"
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
          :disabled="loading || isMenuItemDisabled(menu, conditionCtx)"
          :mapId="mapId"
          @click="onLayerAction($event, menu)"
        />
      </template>
      <div class="v-spacer"></div>
      <template v-for="(menu, i) in extra_bottoms" :key="i">
        <LayerMenu
          :item="menu"
          :data="item"
          :disabled="loading || isMenuItemDisabled(menu, conditionCtx)"
          :mapId="mapId"
          @click="onLayerAction($event, menu)"
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
      <RegistryItem
        v-if="props.item.legend?.componentKey"
        :componentKey="props.item.legend.componentKey"
        :data="item"
        v-bind="props.item.legend.attr"
      ></RegistryItem>
    </div>
    <div v-if="isHasChildren && childrenShow" class="layer-item__children">
      <LayerSubItem
        v-for="item in children"
        :key="item.id"
        :item="item"
        :mapId="mapId"
        :readonly="readonly"
        :disabledMove="disabledMove"
        :disabledCreateGroup="disabledCreateGroup"
        :menuContext="menuContext"
        @click:action="emit('click:action', $event)"
        @click:content-menu="emit('click:content-menu', $event)"
      ></LayerSubItem>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { IListViewUI, MenuAction, MenuContextSource } from '@hungpvq/map-dataset';
import {
  createMenuConditionContext,
  findAllComponentsByType,
  isMenuItemDisabled,
  isMenuItemHidden,
} from '@hungpvq/map-dataset';
import { BaseButton, RegistryItem, useShow } from '@hungpvq/vue-map-core';
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
import { computed, onMounted, ref, watch } from 'vue';
import { useMenuConditionSource } from '../../../../extra/menu/condition-context';
import LayerSubItem from './layer-sub-item.vue';
import LayerMenu from './menu/index.vue';
const props = defineProps<{
  item: IListViewUI;
  mapId: string;
  readonly: boolean;
  disabledMove?: boolean;
  disabledCreateGroup?: boolean;
  menuContext?: MenuContextSource;
}>();
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
  delete: mdiDelete,
  edit: mdiPencilOutline,
  legendOpen: mdiMenuLeft,
  legendClose: mdiMenuDown,
};
const loading = ref(false);
const injectedMenuContext = useMenuConditionSource();
const conditionCtx = computed(() =>
  createMenuConditionContext(props.item, {
    mapId: props.mapId,
    context: [
      {
        readonly: props.readonly,
        disabledMove: props.disabledMove,
        disabledCreateGroup: props.disabledCreateGroup,
      },
      injectedMenuContext,
      props.menuContext,
    ],
  }),
);
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
    .filter((x) => !isMenuItemHidden(x, conditionCtx.value))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const bottoms = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'prebottom')
    .filter((x) => !isMenuItemHidden(x, conditionCtx.value))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const extra_bottoms = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'bottom')
    .filter((x) => !isMenuItemHidden(x, conditionCtx.value))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const content_menus = computed(() => {
  return button_menus.value
    .filter((x) => x.location == 'menu')
    .filter((x) => !isMenuItemHidden(x, conditionCtx.value))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});
const showBottom = computed(() => {
  return (
    !props.readonly &&
    (!props.item.config.disabled_opacity || extra_bottoms.value.length > 0)
  );
});
function onLayerAction(event: MouseEvent, action: MenuAction<IListViewUI>) {
  if (isMenuItemDisabled(action, conditionCtx.value)) return;
  emit('click:action', { event, action, item: props.item });
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

function refreshChildren() {
  const allComponentsOfType = findAllComponentsByType(
    props.item,
    'list-item',
  ) as IListViewUI[];
  isHasChildren.value = allComponentsOfType.length > 0;
  children.value = allComponentsOfType.sort((a, b) => b.index - a.index) || [];
}

onMounted(refreshChildren);
watch(() => props.item.id, refreshChildren);
</script>
