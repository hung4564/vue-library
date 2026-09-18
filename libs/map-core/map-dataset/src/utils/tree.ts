export type Item = Record<string, unknown> & {
  id: string;
  group?: Group;
};
export type Group = Record<string, unknown> & {
  id: string;
  name: string;
};
export type GroupTree<T extends Item = Item> = Record<string, unknown> & {
  id: string;
  name: string;
  isGroup: true;
  show: boolean;
  children: T[];
};
export type TreeItem<T extends Item = Item> = T | GroupTree<T>;

export function isGroupNode<T extends Item = Item>(
  node: TreeItem<T>,
): node is GroupTree<T> {
  return 'isGroup' in node && node.isGroup === true;
}

export function createDefaultGroup<T extends Item = Item>(
  group: Partial<GroupTree<T>> & { name?: string; children?: T[] } = {},
): GroupTree<T> {
  return {
    id: group.id ?? `group-${Date.now()}`,
    name: group.name ?? 'New Group',
    isGroup: true,
    show: group.show ?? true,
    children: group.children ?? [],
  };
}

export function convertListToTree<T extends Item>(value: T[]): TreeItem<T>[] {
  const treeLayer: TreeItem<T>[] = [];
  if (!value || value.length === 0) {
    return treeLayer;
  }
  const groupCache: Record<string, GroupTree<T>> = {};
  value.forEach((item) => {
    if (!item.group) {
      treeLayer.push(item);
      return;
    }
    if (!groupCache[item.group.id]) {
      groupCache[item.group.id] = createDefaultGroup<T>({
        id: item.group.id,
        name: item.group.name,
      });
      treeLayer.push(groupCache[item.group.id]);
    }
    groupCache[item.group.id].children.push(item);
  });
  return treeLayer;
}

export function convertTreeToList<T extends Item>(tree: TreeItem<T>[]): T[] {
  return tree.reduce<T[]>((acc, cur) => {
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

/**
 * Empty groups exist only in the UI tree (the flat item list cannot store them).
 * Re-insert them after converting from items so drag/group UI keeps empty folders.
 */
export function mergeEmptyGroups<T extends Item>(
  next: TreeItem<T>[],
  previous: TreeItem<T>[],
): TreeItem<T>[] {
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
