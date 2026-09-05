<template>
  <li
    class="layer-context-menu__item layer-context-menu__item--has-children"
    :class="{ 'is-open': open }"
    @click.stop="open = !open"
  >
    <div class="layer-context-menu__item-icon">
      <SvgIcon
        size="16"
        type="mdi"
        :path="('icon' in item && item.icon) || mdiFolderPlusOutline"
      />
    </div>
    <span>{{ 'name' in item ? item.name : 'Add to group' }}</span>
    <div class="layer-context-menu__chevron">
      <SvgIcon size="16" type="mdi" :path="mdiChevronRight" />
    </div>
    <ul class="context-menu layer-context-menu layer-context-menu--submenu">
      <template v-for="(child, index) in children" :key="child.id || index">
        <li
          v-if="child.type === 'divider'"
          class="layer-context-menu__item layer-context-menu__divider"
        >
          <div class="layer-context-menu__divider-line"></div>
        </li>
        <li
          v-else
          class="layer-context-menu__item"
          @click.stop="onChildClick(child, $event)"
        >
          <div class="layer-context-menu__item-icon">
            <SvgIcon
              size="16"
              type="mdi"
              :path="('icon' in child && child.icon) || mdiCircleSmall"
            />
          </div>
          <span>{{ 'name' in child ? child.name : '' }}</span>
        </li>
      </template>
    </ul>
  </li>
</template>
<script setup lang="ts">
import type { MenuAction } from '@hungpvq/map-dataset';
import {
  createAddToGroupSubmenu,
  getListViewGroupInfo,
  handleMenuAction,
} from '@hungpvq/map-dataset';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiChevronRight,
  mdiCircleSmall,
  mdiFolderPlusOutline,
} from '@mdi/js';
import { computed, ref } from 'vue';
import type { WithLayerItemMenuComponentType } from './types';

defineOptions({ name: 'LayerActionAddToGroup' });

const props = defineProps<WithLayerItemMenuComponentType>();

const emit = defineEmits<{
  close: [];
}>();

const open = ref(false);

const children = computed(() => {
  void open.value;
  const groups = props.getGroups?.() ?? [];
  const excludeGroupId = getListViewGroupInfo(props.data?.group)?.id;
  return createAddToGroupSubmenu(groups, excludeGroupId);
});

function onChildClick(action: MenuAction, event: MouseEvent) {
  if (!props.data) return;
  handleMenuAction(action, {
    event,
    layer: props.data,
    mapId: props.mapId,
    value: props.data,
  });
  emit('close');
}
</script>
