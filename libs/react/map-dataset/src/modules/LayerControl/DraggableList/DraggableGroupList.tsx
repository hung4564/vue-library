import Sortable from 'sortablejs';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ListItem } from '../../List/ListItem';
import { DraggableGroupItem } from './DraggableGroupItem';
import {
  convertListToTree,
  convertTreeToList,
  createDefaultGroup,
  isGroupNode,
  type GroupTree,
  type LayerListItem,
  type TreeNode,
} from './utils';

export interface DraggableGroupListRef {
  update: (items?: LayerListItem[]) => void;
  addNewGroup: (name: string) => void;
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

function reorder<T>(list: T[], oldIndex: number, newIndex: number): T[] {
  const next = [...list];
  const [removed] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, removed);
  return next;
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
  const selectedObjectsRef = useRef<Record<string, LayerListItem>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const groupListRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const sortableInstancesRef = useRef<Sortable[]>([]);

  const emitChange = useCallback(
    (nextTree: TreeNode[]) => {
      onItemsChange?.(convertTreeToList(nextTree));
      onDragDone?.();
    },
    [onItemsChange, onDragDone],
  );

  const updateTree = useCallback((nextItems: LayerListItem[] = items) => {
    setTree(convertListToTree(nextItems));
  }, [items]);

  useImperativeHandle(ref, () => ({
    update: (nextItems?: LayerListItem[]) => updateTree(nextItems),
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
      const fromId = (evt.from as HTMLElement).dataset.listId ?? 'root';
      const toId = (evt.to as HTMLElement).dataset.listId ?? 'root';
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;
      if (oldIndex == null || newIndex == null) return;

      setTree((prev) => {
        let next = [...prev];

        if (fromId === toId) {
          if (fromId === 'root') {
            next = reorder(next, oldIndex, newIndex);
          } else {
            const groupId = fromId.replace('group-', '');
            next = next.map((node) => {
              if (isGroupNode(node) && node.id === groupId) {
                return { ...node, children: reorder(node.children, oldIndex, newIndex) };
              }
              return node;
            });
          }
        } else {
          let moved: LayerListItem | undefined;
          if (fromId === 'root') {
            const removed = next.splice(oldIndex, 1)[0];
            if (removed && !isGroupNode(removed)) moved = removed;
            else if (removed) next.splice(oldIndex, 0, removed);
          } else {
            const fromGroupId = fromId.replace('group-', '');
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
          if (toId === 'root') {
            movedItem.group = undefined;
            next.splice(newIndex, 0, movedItem);
          } else {
            const toGroupId = toId.replace('group-', '');
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
    const toListId = (evt.to as HTMLElement).dataset.listId ?? 'root';
    const isDraggingGroup = draggedId?.startsWith('group-');
    const isDroppingIntoGroup = toListId.startsWith('group-');
    if (isDraggingGroup && isDroppingIntoGroup) return false;
    return true;
  }, []);

  useEffect(() => {
    sortableInstancesRef.current.forEach((instance) => instance.destroy());
    sortableInstancesRef.current = [];

    if (disabledDrag) return;

    if (rootRef.current) {
      sortableInstancesRef.current.push(
        Sortable.create(rootRef.current, {
          group: 'layers',
          handle: '.draggable-handle',
          animation: 200,
          draggable: '.draggable__item.item',
          onEnd: handleSortEnd,
          onMove: checkMove,
        }),
      );
    }

    groupListRefs.current.forEach((el) => {
      sortableInstancesRef.current.push(
        Sortable.create(el, {
          group: 'layers',
          handle: '.draggable-handle',
          animation: 200,
          draggable: '.draggable__item',
          onEnd: handleSortEnd,
          onMove: checkMove,
        }),
      );
    });

    return () => {
      sortableInstancesRef.current.forEach((instance) => instance.destroy());
      sortableInstancesRef.current = [];
    };
  }, [tree, disabledDrag, handleSortEnd, checkMove]);

  const setGroupListRef = useCallback((groupId: string, el: HTMLDivElement | null) => {
    if (el) groupListRefs.current.set(groupId, el);
    else groupListRefs.current.delete(groupId);
  }, []);

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
                onDelete={() => deleteGroup(node, index)}
                onUngroup={() => unGroup(node, index)}
              >
                <div
                  ref={(el) => setGroupListRef(node.id, el)}
                  className="draggable-group__children"
                  data-list-id={`group-${node.id}`}
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
                </div>
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
