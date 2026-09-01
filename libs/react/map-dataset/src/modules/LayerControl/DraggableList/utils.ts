import type { IListViewUI } from '@hungpvq/map-dataset';

export type LayerListItem = IListViewUI & {
  group?: { id: string; name: string };
};

export type GroupTree = {
  id: string;
  name: string;
  isGroup: true;
  show: boolean;
  children: LayerListItem[];
};

export type TreeNode = LayerListItem | GroupTree;

export function isGroupNode(node: TreeNode): node is GroupTree {
  return 'isGroup' in node && node.isGroup === true;
}

export function createDefaultGroup(
  group: Partial<GroupTree> & { name?: string; children?: LayerListItem[] },
): GroupTree {
  return {
    id: group.id ?? `group-${Date.now()}`,
    name: group.name ?? 'New Group',
    isGroup: true,
    show: group.show ?? true,
    children: group.children ?? [],
  };
}

export function convertListToTree(value: LayerListItem[]): TreeNode[] {
  const treeLayer: TreeNode[] = [];
  if (!value?.length) return treeLayer;

  const groupCache: Record<string, GroupTree> = {};
  value.forEach((item) => {
    if (!item.group) {
      treeLayer.push(item);
      return;
    }
    if (!groupCache[item.group.id]) {
      groupCache[item.group.id] = createDefaultGroup({
        id: item.group.id,
        name: item.group.name,
      });
      treeLayer.push(groupCache[item.group.id]);
    }
    groupCache[item.group.id].children.push(item);
  });
  return treeLayer;
}

export function convertTreeToList(tree: TreeNode[]): LayerListItem[] {
  return tree.reduce<LayerListItem[]>((acc, cur) => {
    if (isGroupNode(cur)) {
      if (cur.children.length > 0) {
        acc.push(
          ...cur.children.map((child) => {
            child.group = { id: cur.id, name: cur.name };
            return child;
          }),
        );
      }
    } else {
      cur.group = undefined;
      acc.push(cur);
    }
    return acc;
  }, []);
}

/** Empty groups exist only in the UI tree (the flat item list cannot store them). Re-insert them after converting from items, matching Vue. */
export function mergeEmptyGroups(
  next: TreeNode[],
  previous: TreeNode[],
): TreeNode[] {
  if (!previous.length) return next;
  const present = new Set(next.map((node) => node.id));
  const merged = [...next];
  previous.forEach((node, index) => {
    if (!isGroupNode(node) || node.children.length > 0) return;
    if (present.has(node.id)) return;
    merged.splice(Math.min(index, merged.length), 0, {
      ...node,
      children: [],
    });
    present.add(node.id);
  });
  return merged;
}
