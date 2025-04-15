<template>
  <!-- Group Item -->
  <ListGroupItem
    :item="item"
    :disabled-drag="disabledDrag"
    v-if="isGroup(item)"
  >
    <template #extra-data="{ item }">
      <slot name="group-extra-data" :item="item" />
    </template>
    <template #items-list>
      <div class="draggable-group__children">
        <template
          v-for="(child, index) in item.children"
          :key="child.id || index"
        >
          <RecursiveList
            :item="child"
            :disabled-drag="disabledDrag"
            :is-group="isGroup"
            :is-leaf="isLeaf"
          >
            <template #group-extra-data="{ item }">
              <slot name="group-extra-data" :item="item" />
            </template>
            <template #leaf="{ item: leafItem }">
              <slot name="leaf" :item="leafItem" />
            </template>
          </RecursiveList>
        </template>
      </div>
    </template>
  </ListGroupItem>

  <ListItem :item="item" :disabled-drag="disabledDrag" v-else>
    <slot name="leaf" :item="item">
      <div class="leaf-item">
        <span class="leaf-item__title" :title="item.name">
          {{ item.name }}
        </span>
      </div>
    </slot>
  </ListItem>
</template>

<script lang="ts">
export default {
  name: 'RecursiveList',
};
</script>
<script setup lang="ts">
import { PropType } from 'vue';
import { Item, TreeItem } from '../../utils/tree';
import ListGroupItem from './ListGroupItem.vue';
import ListItem from './ListItem.vue';

type IsGroupFn = (item: TreeItem) => boolean;
type IsLeafFn = (item: TreeItem) => boolean;

const props = defineProps({
  item: {
    type: Object as PropType<TreeItem>,
    required: true,
  },
  disabledDrag: {
    type: Boolean,
    default: false,
  },
  isGroup: {
    type: Function as PropType<IsGroupFn>,
    default: (item: TreeItem) => Array.isArray(item.children),
  },
  isLeaf: {
    type: Function as PropType<IsLeafFn>,
    default: (item: TreeItem) => !Array.isArray(item.children),
  },
});

defineSlots<{
  group(props: { item: TreeItem }): any;
  leaf(props: { item: Item }): any;
  'group-extra-data'(props: { item: TreeItem }): any;
}>();
</script>

<style scoped>
.leaf-item {
  display: flex;
  align-items: center;
  width: 100%;
}

.leaf-item__title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.draggable-group__children {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
