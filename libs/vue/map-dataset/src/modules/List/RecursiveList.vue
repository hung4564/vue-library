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
          :key="(child as any).id || index"
        >
          <RecursiveList
            :item="child"
            :disabled-drag="disabledDrag"
            :is-group="isGroup"
            :is-leaf="isLeaf"
          >
            <template #group-extra-data="{ item: groupItem }">
              <slot name="group-extra-data" :item="groupItem" />
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
        <span class="leaf-item__title" :title="(item as any).name">
          {{ item.name }}
        </span>
      </div>
    </slot>
  </ListItem>
</template>

<script setup lang="ts">
import { VNode } from 'vue';
import { GroupTree, Item, TreeItem } from '../../utils/tree';
import ListGroupItem from './ListGroupItem.vue';
import ListItem from './ListItem.vue';

defineOptions({
  name: 'RecursiveList',
});

type IsGroupFn = (item: TreeItem) => boolean;
type IsLeafFn = (item: TreeItem) => boolean;

withDefaults(
  defineProps<{
    item: TreeItem;
    disabledDrag?: boolean;
    isGroup?: IsGroupFn;
    isLeaf?: IsLeafFn;
  }>(),
  {
    disabledDrag: false,
    isGroup: (item: TreeItem): item is GroupTree =>
      Array.isArray(item.children),
    isLeaf: (item: TreeItem): item is Item => !Array.isArray(item.children),
  },
);

defineSlots<{
  group(props: { item: TreeItem }): VNode[];
  leaf(props: { item: Item }): VNode[];
  'group-extra-data'(props: { item: TreeItem }): VNode[];
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
