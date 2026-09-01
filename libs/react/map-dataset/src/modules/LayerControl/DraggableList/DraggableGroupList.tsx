import Sortable from 'sortablejs';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { ListItem } from '../../List/ListItem';
import { DraggableGroupItem } from './DraggableGroupItem';
import {
  convertListToTree,
  convertTreeToList,
  createDefaultGroup,
  isGroupNode,
  mergeEmptyGroups,
  type GroupTree,
  type LayerListItem,
  type TreeNode,
} from './utils';

export interface DraggableGroupListRef {
  update: (items?: LayerListItem[]) => void;
  addNewGroup: (name: string) => void;
  getGroups: () => { id: string; name: string }[];
}

export interface DraggableGroupListProps {
  items: LayerListItem[];
  selected?: string[];
  disabledDrag?: boolean;
  disabledSelect?: boolean;
  onItemsChange?: (items: LayerListItem[]) => void;
  onDragDone?: () => void;
  onGroupRemove?: (group: GroupTree) => void;
  onSelectedChange?: (selected: string[]) => void;
  renderItem: (props: {
    item: LayerListItem;
    isSelected: boolean;
    toggleSelect: () => void;
  }) => ReactNode;
}

type SortableHandlers = {
  onEnd: (evt: Sortable.SortableEvent) => void;
  onMove: (evt: Sortable.MoveEvent) => boolean | void;
};

function reorder<T>(list: T[], oldIndex: number, newIndex: number): T[] {
  const next = [...list];
  const [removed] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, removed);
  return next;
}

function isPersistentSortableItem(el: Element) {
  return (
    el.classList.contains('draggable__item') &&
    !el.classList.contains('sortable-ghost') &&
    !el.classList.contains('sortable-fallback') &&
    !el.classList.contains('sortable-drag')
  );
}

function restoreSortableItem(evt: Sortable.SortableEvent) {
  const item = evt.item;
  const from = evt.from;
  if (!item || !from) return;
  const oldIndex = evt.oldIndex ?? 0;
  const siblings = Array.from(from.children).filter(
    (child) => child !== item && isPersistentSortableItem(child),
  );
  const reference = siblings[oldIndex];
  if (reference) from.insertBefore(item, reference);
  else from.appendChild(item);
}

function getListTarget(el: HTMLElement): { kind: 'root' } | { kind: 'group'; groupId: string } {
  const listId = el.dataset.listId ?? 'root';
  if (listId === 'root') return { kind: 'root' };
  return { kind: 'group', groupId: listId };
}

function createLayerSortable(
  el: HTMLElement,
  draggable: string,
  handlersRef: MutableRefObject<SortableHandlers>,
) {
  return Sortable.create(el, {
    group: {
      name: 'layers',
      pull: true,
      put: (to, _from, dragEl) => {
        const target = getListTarget(to.el);
        if (target.kind === 'group' && dragEl.dataset.nodeId?.startsWith('group-')) {
          return false;
        }
        return true;
      },
    },
    handle: '.draggable-handle',
    animation: 200,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    emptyInsertThreshold: 80,
    ghostClass: 'sortable-ghost',
    draggable,
    onEnd: (evt) => {
      restoreSortableItem(evt);
      handlersRef.current.onEnd(evt);
    },
    onMove: (evt) => handlersRef.current.onMove(evt),
  });
}

export const DraggableGroupList = forwardRef<
  DraggableGroupListRef,
  DraggableGroupListProps
>(function DraggableGroupList(
  {
    items,
    selected = [],
    disabledDrag,
    disabledSelect,
    onItemsChange,
    onDragDone,
    onGroupRemove,
    onSelectedChange,
    renderItem,
  },
  ref,
) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const treeRef = useRef<TreeNode[]>([]);
  treeRef.current = tree;
  const selectedObjectsRef = useRef<Record<string, LayerListItem>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const handlersRef = useRef<SortableHandlers>({
    onEnd: () => undefined,
    onMove: () => true,
  });

  const emitChange = useCallback(
    (nextTree: TreeNode[]) => {
      onItemsChange?.(convertTreeToList(nextTree));
      onDragDone?.();
    },
    [onItemsChange, onDragDone],
  );

  const updateTree = useCallback((nextItems: LayerListItem[] = items) => {
    setTree((prev) => mergeEmptyGroups(convertListToTree(nextItems), prev));
  }, [items]);

  useImperativeHandle(ref, () => ({
    update: (nextItems?: LayerListItem[]) => updateTree(nextItems),
    getGroups: () =>
      treeRef.current
        .filter(isGroupNode)
        .map((group) => ({ id: group.id, name: group.name })),
    addNewGroup: (name: string) => {
      setTree((prev) => {
        let next = [...prev];
        let children: LayerListItem[] = [];

        if (selected.length > 0) {
          next = next
            .filter((node) => !selected.includes(node.id))
            .map((node) => {
              if (isGroupNode(node)) {
                return {
                  ...node,
                  children: node.children.filter((child) => !selected.includes(child.id)),
                };
              }
              return node;
            });
          children = selected
            .map((id) => selectedObjectsRef.current[id])
            .filter(Boolean);
          onSelectedChange?.([]);
          selectedObjectsRef.current = {};
        }

        const group = createDefaultGroup({ name: name || 'New Group', children });
        next.unshift(group);
        // Match Vue: empty groups stay local until they have children —
        // convertTreeToList drops empty groups, so emitChange would wipe them.
        if (group.children.length > 0) {
          queueMicrotask(() => emitChange(next));
        }
        return next;
      });
    },
  }));

  useEffect(() => {
    updateTree(items);
  }, [items, updateTree]);

  const toggleSelect = useCallback(
    (layer: LayerListItem) => {
      if (disabledSelect) return;
      if (selected.includes(layer.id)) {
        onSelectedChange?.(selected.filter((id) => id !== layer.id));
        delete selectedObjectsRef.current[layer.id];
      } else {
        selectedObjectsRef.current[layer.id] = layer;
        onSelectedChange?.([...selected, layer.id]);
      }
    },
    [disabledSelect, onSelectedChange, selected],
  );

  const handleSortEnd = useCallback(
    (evt: Sortable.SortableEvent) => {
      const from = getListTarget(evt.from as HTMLElement);
      const to = getListTarget(evt.to as HTMLElement);
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;
      if (oldIndex == null || newIndex == null) return;

      setTree((prev) => {
        let next = [...prev];

        if (from.kind === to.kind && (from.kind === 'root' || from.groupId === to.groupId)) {
          if (from.kind === 'root') {
            next = reorder(next, oldIndex, newIndex);
          } else {
            const groupId = from.groupId;
            next = next.map((node) => {
              if (isGroupNode(node) && node.id === groupId) {
                return { ...node, children: reorder(node.children, oldIndex, newIndex) };
              }
              return node;
            });
          }
        } else {
          let moved: LayerListItem | undefined;
          if (from.kind === 'root') {
            const removed = next.splice(oldIndex, 1)[0];
            if (removed && !isGroupNode(removed)) moved = removed;
            else if (removed) next.splice(oldIndex, 0, removed);
          } else {
            const fromGroupId = from.groupId;
            next = next.map((node) => {
              if (isGroupNode(node) && node.id === fromGroupId) {
                const children = [...node.children];
                moved = children.splice(oldIndex, 1)[0];
                return { ...node, children };
              }
              return node;
            });
          }

          if (!moved) return prev;

          const movedItem = moved;
          if (to.kind === 'root') {
            movedItem.group = undefined;
            next.splice(newIndex, 0, movedItem);
          } else {
            const toGroupId = to.groupId;
            const targetGroup = next.find(
              (node): node is GroupTree => isGroupNode(node) && node.id === toGroupId,
            );
            if (!targetGroup) return prev;
            movedItem.group = { id: targetGroup.id, name: targetGroup.name };
            next = next.map((node) => {
              if (isGroupNode(node) && node.id === toGroupId) {
                const children = [...node.children];
                children.splice(newIndex, 0, movedItem);
                return { ...node, children };
              }
              return node;
            });
          }
        }

        queueMicrotask(() => emitChange(next));
        return next;
      });
    },
    [emitChange],
  );

  const checkMove = useCallback((evt: Sortable.MoveEvent) => {
    const draggedId = (evt.dragged as HTMLElement).dataset.nodeId;
    const to = getListTarget(evt.to as HTMLElement);
    const isDraggingGroup = draggedId?.startsWith('group-');
    if (isDraggingGroup && to.kind === 'group') return false;
    return true;
  }, []);

  handlersRef.current = { onEnd: handleSortEnd, onMove: checkMove };

  const createGroupSortable = useCallback(
    (el: HTMLElement) => createLayerSortable(el, '> .draggable__item', handlersRef),
    [],
  );

  useEffect(() => {
    const rootEl = rootRef.current;
    if (disabledDrag || !rootEl) return;
    const instance = createLayerSortable(
      rootEl,
      '> .draggable__item.item',
      handlersRef,
    );
    return () => instance.destroy();
  }, [disabledDrag]);

  function deleteGroup(group: GroupTree, groupIndex: number) {
    setTree((prev) => {
      const next = [...prev];
      next.splice(groupIndex, 1);
      onGroupRemove?.(group);
      queueMicrotask(() => emitChange(next));
      return next;
    });
  }

  function unGroup(group: GroupTree, groupIndex: number) {
    setTree((prev) => {
      const next = [...prev];
      next.splice(groupIndex, 1);
      if (group.children.length > 0) {
        const ungrouped = group.children.map((child) => {
          child.group = undefined;
          return child;
        });
        next.splice(groupIndex, 0, ...ungrouped);
      }
      queueMicrotask(() => emitChange(next));
      return next;
    });
  }

  return (
    <div ref={rootRef} className="draggable-group-container" data-list-id="root">
      {tree.map((node, index) => {
        if (isGroupNode(node)) {
          return (
            <div
              key={node.id}
              className="draggable__item item"
              data-node-id={node.id}
            >
              <DraggableGroupItem
                layerGroup={node}
                disabledDrag={disabledDrag}
                childrenListId={node.id}
                createSortable={createGroupSortable}
                onDelete={() => deleteGroup(node, index)}
                onUngroup={() => unGroup(node, index)}
              >
                {node.children.map((child) => (
                  <div
                    key={child.id}
                    className="draggable__item"
                    data-node-id={child.id}
                  >
                    <ListItem
                      item={child}
                      isSelected={selected.includes(child.id)}
                      disabledDrag={disabledDrag}
                    >
                      {renderItem({
                        item: child,
                        isSelected: selected.includes(child.id),
                        toggleSelect: () => toggleSelect(child),
                      })}
                    </ListItem>
                  </div>
                ))}
              </DraggableGroupItem>
            </div>
          );
        }

        return (
          <div
            key={node.id}
            className="draggable__item item"
            data-node-id={node.id}
          >
            <ListItem
              item={node}
              isSelected={selected.includes(node.id)}
              disabledDrag={disabledDrag}
            >
              {renderItem({
                item: node,
                isSelected: selected.includes(node.id),
                toggleSelect: () => toggleSelect(node),
              })}
            </ListItem>
          </div>
        );
      })}
    </div>
  );
});
