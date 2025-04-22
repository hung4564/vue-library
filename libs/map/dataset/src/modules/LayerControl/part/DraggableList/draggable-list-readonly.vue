<template>
  <div ref="el" class="draggable-group-container">
    <div
      v-for="(layerGroup, index) in treeLayer"
      :key="layerGroup.id"
      :data-id="layerGroup.id"
      class="draggable__item item"
    >
      <template v-if="!layerGroup.isGroup">
        <DraggableListItem disabledDrag :item="layerGroup" :key="layerGroup.id">
          <slot :item="layerGroup" :index="index" name="item"></slot>
        </DraggableListItem>
      </template>
      <template v-else>
        <DraggableListGroupItem
          :key="layerGroup.id"
          :layer-group="layerGroup"
          disabledDrag
          readonly
        >
          <template #item="props">
            <slot v-bind="props" name="item"></slot
          ></template>
        </DraggableListGroupItem>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DraggableListGroupItem from './draggable-list-group.vue';
import DraggableListItem from './draggable-list-item.vue';
const props = defineProps({
  items: { type: Array, required: true },
  selected: { type: Array, default: () => [] },
  disabledDrag: Boolean,
});
type Item = {
  id: string;
  group?: Group;
  isGroup: false;
};
type Group = {
  id: string;
  name: string;
};
type GroupTree = {
  id: string;
  name: string;
  isGroup: true;
  show: boolean;
  children: Item[];
};
type TreeItem = Item | GroupTree;
const treeLayer = ref<TreeItem[]>([]);
const el = ref<HTMLElement | null>(null);

onMounted(() => {
  update(props.items as Item[]);
});
function update(items: Item[] = []) {
  if (items == null || items.length === 0) {
    items = props.items as Item[];
  }
  treeLayer.value = convertListToTree(items);
}
function convertListToTree(value: Item[]): TreeItem[] {
  let treeLayer: TreeItem[] = [];
  if (!value || value.length == 0) {
    return treeLayer;
  }
  let group_cache: Record<string, GroupTree> = {};
  value.forEach((x) => {
    if (!x.group) {
      treeLayer.push(x);
      return;
    }
    if (!group_cache[x.group.id]) {
      group_cache[x.group.id] = createDefaultGroup(x.group);
      treeLayer.push(group_cache[x.group.id]);
    }
    let group = group_cache[x.group.id];

    group.children.push(x);
  });
  return treeLayer;
}
function convertTreeToList(tree: TreeItem[]): Item[] {
  return tree.reduce<Item[]>((acc, cur) => {
    if (cur.isGroup) {
      if (cur.children.length > 0) {
        acc.push(
          ...cur.children.map((x) => {
            x.group = { id: cur.id, name: cur.name };
            return x;
          })
        );
      }
    } else {
      cur.group = undefined;
      acc.push(cur);
    }
    return acc;
  }, []);
}
function createDefaultGroup(group: any) {
  let temp = {
    id: `group-${new Date().getTime()}`,
    name: 'New Group',
    isGroup: true,
    show: true,
    children: [],
  };
  temp = Object.assign({}, temp, group);
  return temp as GroupTree;
}
defineExpose({ update });
</script>
<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}
:deep(.no-move) {
  transition: transform 0s;
}
:deep(.sortable-ghost) {
  opacity: 0.2;
  background: var(--v-primary-base, #1a73e8);
}
.draggable-handle {
  cursor: all-scroll;
}
.draggable-group-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
