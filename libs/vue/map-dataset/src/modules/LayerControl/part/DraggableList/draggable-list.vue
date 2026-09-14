<template>
  <draggable
    v-model="treeLayer"
    group="layers"
    item-key="id"
    :animation="200"
    :move="checkMove"
    handle=".draggable-handle"
    class="draggable-group-container"
    @end="onEnd"
  >
    <template #item="{ element, index }">
      <div class="draggable__item item">
        <DraggableListGroupItem
          v-if="element.isGroup"
          :key="element.id"
          :layer-group="element"
          @update:layer-group="onUpdateGroup($event, index)"
          :disabledDrag="disabledDrag"
          @click:delete="deleteGroup(element, index)"
          @click:un-group="unGroup(element, index)"
          @drag-done="onEnd"
          @click:select="toggleSelect"
          @end="onEnd"
        >
          <template #item>
            <draggable
              v-model="element.children"
              group="layers"
              handle=".draggable-handle"
              item-key="id"
              :animation="200"
              :move="checkMove"
              class="draggable-group__children"
            >
              <template #item="{ element: child, index: indexChild }">
                <div class="draggable__item">
                  <DraggableListItem
                    :disabledDrag="disabledDrag"
                    :isSelected="currentSelectId.includes(child.id)"
                    :item="child"
                    :key="child.id + '-child'"
                  >
                    <slot
                      :isSelected="currentSelectId.includes(child.id)"
                      :item="child"
                      :index="indexChild"
                      name="item"
                      :toggleSelect="toggleSelect"
                    ></slot>
                  </DraggableListItem>
                </div>
              </template>
            </draggable>
          </template>
        </DraggableListGroupItem>
        <DraggableListItem
          :disabledDrag="disabledDrag"
          :isSelected="currentSelectId.includes(element.id)"
          :item="element"
          :key="element.id + '-child'"
          v-else
        >
          <slot
            :isSelected="currentSelectId.includes(element.id)"
            :item="element"
            :index="index"
            name="item"
            :toggleSelect="toggleSelect"
          ></slot>
        </DraggableListItem>
      </div>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import {
  convertListToTree,
  convertTreeToList,
  createDefaultGroup,
  isGroupNode,
  mergeEmptyGroups,
  type GroupTree,
  type Item,
  type TreeItem,
} from '@hungpvq/map-dataset';
import { computed, nextTick, onMounted, ref } from 'vue';
import draggable from 'vuedraggable';
import DraggableListGroupItem from './draggable-list-group.vue';
import DraggableListItem from './draggable-list-item.vue';

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
const treeLayer = ref<TreeItem[]>([]);
const currentSelectLayerObject = ref<Record<string, Item>>({});
const currentSelectId = computed({
  get() {
    return props.selected as string[];
  },
  set(value) {
    emit('update:selected', value);
  },
});
const isParent = (item: TreeItem | undefined) =>
  !!item && isGroupNode(item);

const checkMove = (evt: any) => {
  const draggedElement = evt.draggedContext.element;
  const toParent = evt.to.__vue__?.element;

  const isDraggingParent = isParent(draggedElement);
  const isDroppingIntoChildren = toParent && isParent(toParent);

  if (isDraggingParent && isDroppingIntoChildren) {
    return false;
  }

  if (!isDraggingParent && !toParent) {
    return true;
  }

  if (!isDraggingParent && toParent && !isParent(toParent)) {
    return true;
  }

  return true;
};
onMounted(() => {
  update(props.items as Item[]);
});
function update(items: Item[] = []) {
  if (items == null || items.length === 0) {
    items = props.items as Item[];
  }
  treeLayer.value = mergeEmptyGroups(
    convertListToTree(items),
    treeLayer.value,
  );
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
function getGroups() {
  return treeLayer.value
    .filter(isGroupNode)
    .map((node) => ({ id: node.id, name: node.name }));
}
function addNewGroup(name: string) {
  let children: Item[] = [];
  if (currentSelectId.value && currentSelectId.value.length > 0) {
    treeLayer.value = treeLayer.value
      .filter((layerGroup) => !currentSelectId.value.includes(layerGroup.id))
      .map((layerGroup) => {
        if (isGroupNode(layerGroup)) {
          layerGroup.children = layerGroup.children.filter(
            (layer) => !currentSelectId.value.includes(layer.id),
          );
        }
        return layerGroup;
      });
    children = currentSelectId.value.map(
      (x) => currentSelectLayerObject.value[x],
    );
    currentSelectId.value = [];
    currentSelectLayerObject.value = {};
  }
  const group = createDefaultGroup({ name: name || 'New Group', children });
  treeLayer.value.unshift(group);
  if (group.children.length > 0) onEnd();
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
    emit('update:items', convertTreeToList(treeLayer.value));
    emit('click-drag:done');
  });
}
function deleteGroup(group: GroupTree, groupIndex: number) {
  treeLayer.value.splice(groupIndex, 1);
  emit('click-group:remove', group);
}
defineExpose({ update, addNewGroup, getGroups });
</script>
