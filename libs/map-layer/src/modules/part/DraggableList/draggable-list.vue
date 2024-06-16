<template>
  <div ref="el" class="draggable-group-container">
    <div
      v-for="(layerGroup, index) in init_items"
      :key="layerGroup.id"
      :data-id="layerGroup.id"
      class="draggable__item item"
    >
      <template v-if="!layerGroup.isGroup">
        <DraggableListItem
          :disabledDrag="disabledDrag"
          :isSelected="currentSelectId.includes(layerGroup.id)"
          :item="layerGroup"
          :key="layerGroup.id"
        >
          <slot
            :isSelected="currentSelectId.includes(layerGroup.id)"
            :item="layerGroup"
            :index="index"
            name="item"
            :toggleSelect="toggleSelect"
          ></slot>
        </DraggableListItem>
      </template>
      <template v-else>
        <DraggableListGroupItem
          :key="layerGroup.id"
          :layer-group="layerGroup"
          @update:layer-group="onUpdateGroup($event, index)"
          :disabledDrag="disabledDrag"
          @click:delete="deleteGroup(layerGroup, index)"
          @click:un-group="unGroup(layerGroup, index)"
          :checkItemCanPutInChildren="checkItemCanPutInChildren"
          @drag-done="onEnd"
          @click:select="toggleSelect"
          v-model:currentItemDrag="currentItemDrag"
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
import DraggableListItem from './draggable-list-item.vue';
import DraggableListGroupItem from './draggable-list-group.vue';

import { useStoreSortable } from '@hungpv97/shared-integrations';
import { computed, nextTick, onMounted, ref } from 'vue';
const props = defineProps({
  items: { type: Array, required: true },
  selected: { type: Array, default: () => [] },
  disabledSelect: Boolean,
  disabledDrag: Boolean,
});
const emit = defineEmits([
  'update:selected',
  'click-group:remove',
  'click-drag:done',
  'update:items',
]);
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
const currentSelectLayerObject = ref<Record<string, Item>>({});
const currentItemDrag = ref<TreeItem | undefined>(undefined);
const currentSelectId = computed({
  get() {
    return props.selected as string[];
  },
  set(value) {
    emit('update:selected', value);
  },
});
const el = ref<HTMLElement | null>(null);
const { setCache, items: init_items } = useStoreSortable(
  el,
  {
    get() {
      return treeLayer.value;
    },
    set(value) {
      treeLayer.value = value;
    },
  },
  {
    handle: '.draggable-handle',
    group: {
      name: 'layers',
      pull: true,
      put: true,
    },
    onChoose(e) {
      currentItemDrag.value =
        e.oldIndex != null ? treeLayer.value[e.oldIndex] : undefined;
    },
    onEnd() {
      onEnd();
    },
  }
);

onMounted(() => {
  update(props.items as Item[]);
});
function update(items: Item[] = []) {
  if (items == null || items.length === 0) {
    items = props.items as Item[];
  }
  treeLayer.value = convertListToTree(items);
  setCache(items);
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
function toggleSelect(layer: Item) {
  if (props.disabledSelect) return;
  if (currentSelectId.value.includes(layer.id)) {
    currentSelectId.value = currentSelectId.value.filter((x) => x != layer.id);
  } else {
    currentSelectId.value.push(layer.id);
    currentSelectLayerObject.value[layer.id] = layer;
  }
}
function addNewGroup(name: string) {
  let children: Item[] = [];
  if (currentSelectId.value && currentSelectId.value.length > 0) {
    //remove layer from old
    treeLayer.value = treeLayer.value
      .filter((layerGroup) => !currentSelectId.value.includes(layerGroup.id))
      .map((layerGroup) => {
        if ('isGroup' in layerGroup && layerGroup.isGroup) {
          layerGroup.children = layerGroup.children.filter(
            (layer) => !currentSelectId.value.includes(layer.id)
          );
        }
        return layerGroup;
      });
    // add select item to group
    children = currentSelectId.value.map(
      (x) => currentSelectLayerObject.value[x]
    );
    currentSelectId.value = [];
    currentSelectLayerObject.value = {};
  }
  let group = createDefaultGroup({ name: name || 'New Group', children });
  treeLayer.value.unshift(group);
  if (group.children.length > 0) onEnd();
  setCache(treeLayer.value);
}
function unGroup(group: GroupTree, groupIndex: number) {
  treeLayer.value.splice(groupIndex, 1);
  if (group.children.length > 0) {
    treeLayer.value.splice(groupIndex, 0, ...group.children);
  }
}
function onUpdateGroup(newGroup: GroupTree, groupIndex: number) {
  treeLayer.value[groupIndex] = { ...treeLayer.value[groupIndex], ...newGroup };
}
function onEnd() {
  nextTick(() => {
    currentItemDrag.value = undefined;
    emit('update:items', convertTreeToList(treeLayer.value));
    emit('click-drag:done');
  });
}
function checkItemCanPutInChildren() {
  // only 2 lever, group can't drag to other group
  return !(currentItemDrag.value && currentItemDrag.value.isGroup);
}
function deleteGroup(group: GroupTree, groupIndex: number) {
  treeLayer.value.splice(groupIndex, 1);
  emit('click-group:remove', group);
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
defineExpose({ update, addNewGroup });
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
