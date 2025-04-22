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
              class="draggable-group-container"
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
const currentSelectId = computed({
  get() {
    return props.selected as string[];
  },
  set(value) {
    emit('update:selected', value);
  },
});
// Hàm kiểm tra phần tử có phải cha (có children)
const isParent = (item: TreeItem) => item && item.isGroup;

const checkMove = (evt: any) => {
  const draggedElement = evt.draggedContext.element;
  const toParent = evt.to.__vue__?.element;

  const isDraggingParent = isParent(draggedElement); // Kiểm tra xem phần tử đang kéo có phải là nhóm cấp 1 hay không
  const isDroppingIntoChildren = toParent && isParent(toParent); // Kiểm tra xem phần tử đang được kéo có phải vào cấp 1 hay không

  // Điều kiện 1: Không cho kéo cấp 1 vào cấp 1 khác
  if (isDraggingParent && isDroppingIntoChildren) {
    return false; // Chặn di chuyển nếu cấp 1 được kéo vào cấp 1 khác
  }

  // Điều kiện 2: Kéo item từ cấp 2 ra ngoài (cấp 2 trở thành cấp 1)
  if (!isDraggingParent && !toParent) {
    // Nếu item không phải cấp 1 và đang được kéo ra ngoài (không vào cấp 1), đảm bảo nó trở thành cấp 1
    return true; // Cho phép kéo, item sẽ được chuyển thành cấp 1 khi thả
  }

  // Điều kiện 3: Kéo item từ cấp 2 vào một cấp 1 khác
  if (!isDraggingParent && toParent && !isParent(toParent)) {
    // Nếu phần tử đang kéo là cấp 2 và đang kéo vào một cấp 1, thì cho phép di chuyển
    return true;
  }

  return true; // Nếu không rơi vào các điều kiện trên, cho phép di chuyển
};
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
