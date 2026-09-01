import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { hasMoveLayer } from '../../utils/check';
import { traverseTree } from '../visitors';
import type { IGroupListViewUI, IListViewUI } from './types';

type GroupNode = {
  id: string;
  name: string;
  isGroup: true;
  children: IListViewUI[];
};

type TreeNode = IListViewUI | GroupNode;

function isGroupNode(node: TreeNode): node is GroupNode {
  return 'isGroup' in node && node.isGroup === true;
}

export function sortListViews(views: IListViewUI[]): IListViewUI[] {
  return [...views].sort((a, b) => b.index - a.index);
}

export function getListViewGroupInfo(
  group: IGroupListViewUI<IListViewUI> | undefined,
): { id: string; name: string } | undefined {
  if (!group) return undefined;
  if (typeof group === 'string') return { id: group, name: group };
  return { id: group.id, name: group.name };
}

function toTree(views: IListViewUI[]): TreeNode[] {
  const tree: TreeNode[] = [];
  const groups: Record<string, GroupNode> = {};
  for (const item of views) {
    const group = getListViewGroupInfo(item.group);
    if (!group) {
      tree.push(item);
      continue;
    }
    if (!groups[group.id]) {
      groups[group.id] = {
        id: group.id,
        name: group.name,
        isGroup: true,
        children: [],
      };
      tree.push(groups[group.id]);
    }
    groups[group.id].children.push(item);
  }
  return tree;
}

function fromTree(tree: TreeNode[]): IListViewUI[] {
  const list: IListViewUI[] = [];
  for (const node of tree) {
    if (isGroupNode(node)) {
      if (node.children.length === 0) continue;
      for (const child of node.children) {
        child.group = { id: node.id, name: node.name };
        list.push(child);
      }
    } else {
      node.group = undefined;
      list.push(node);
    }
  }
  return list;
}

function reindex(views: IListViewUI[]): IListViewUI[] {
  views.forEach((view, index) => {
    view.index = views.length - index;
  });
  return views;
}

function locate(
  tree: TreeNode[],
  itemId: string,
):
  | { kind: 'root'; index: number }
  | { kind: 'group'; groupIndex: number; childIndex: number }
  | undefined {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (isGroupNode(node)) {
      const childIndex = node.children.findIndex((child) => child.id === itemId);
      if (childIndex !== -1) {
        return { kind: 'group', groupIndex: i, childIndex };
      }
    } else if (node.id === itemId) {
      return { kind: 'root', index: i };
    }
  }
  return undefined;
}

export function canMoveListView(
  views: IListViewUI[],
  itemId: string,
  direction: 'up' | 'down',
): boolean {
  const tree = toTree(sortListViews(views));
  const loc = locate(tree, itemId);
  if (!loc) return false;
  if (direction === 'up') {
    return loc.kind === 'group' || loc.index > 0;
  }
  if (loc.kind === 'group') return true;
  return loc.index < tree.length - 1;
}

export function moveListView(
  views: IListViewUI[],
  itemId: string,
  direction: 'up' | 'down',
): IListViewUI[] {
  const tree = toTree(sortListViews(views));
  const loc = locate(tree, itemId);
  if (!loc) return views;

  if (loc.kind === 'group') {
    const group = tree[loc.groupIndex];
    if (!isGroupNode(group)) return views;
    const children = group.children;
    if (direction === 'up') {
      if (loc.childIndex > 0) {
        const prev = children[loc.childIndex - 1];
        children[loc.childIndex - 1] = children[loc.childIndex];
        children[loc.childIndex] = prev;
      } else {
        const [item] = children.splice(loc.childIndex, 1);
        item.group = undefined;
        tree.splice(loc.groupIndex, 0, item);
        if (children.length === 0) {
          tree.splice(loc.groupIndex + 1, 1);
        }
      }
    } else if (loc.childIndex < children.length - 1) {
      const next = children[loc.childIndex + 1];
      children[loc.childIndex + 1] = children[loc.childIndex];
      children[loc.childIndex] = next;
    } else {
      const [item] = children.splice(loc.childIndex, 1);
      item.group = undefined;
      const insertAt = loc.groupIndex + 1;
      tree.splice(insertAt, 0, item);
      if (children.length === 0) {
        tree.splice(loc.groupIndex, 1);
      }
    }
    return reindex(fromTree(tree));
  }

  const nextIndex = direction === 'up' ? loc.index - 1 : loc.index + 1;
  if (nextIndex < 0 || nextIndex >= tree.length) return views;
  const current = tree[loc.index];
  tree[loc.index] = tree[nextIndex];
  tree[nextIndex] = current;
  return reindex(fromTree(tree));
}

export function addListViewsToNewGroup(
  views: IListViewUI[],
  itemIds: string[],
  name = 'New Group',
): IListViewUI[] {
  if (itemIds.length === 0) return views;
  const ids = new Set(itemIds);
  const tree = toTree(sortListViews(views));
  const children: IListViewUI[] = [];
  const nextTree: TreeNode[] = [];

  for (const node of tree) {
    if (isGroupNode(node)) {
      const kept: IListViewUI[] = [];
      for (const child of node.children) {
        if (ids.has(child.id)) children.push(child);
        else kept.push(child);
      }
      if (kept.length > 0) {
        nextTree.push({ ...node, children: kept });
      }
    } else if (ids.has(node.id)) {
      children.push(node);
    } else {
      nextTree.push(node);
    }
  }

  if (children.length === 0) return views;

  const group: GroupNode = {
    id: `group-${getUUIDv4()}`,
    name,
    isGroup: true,
    children,
  };
  nextTree.unshift(group);
  return reindex(fromTree(nextTree));
}

export function listListViewGroups(
  views: IListViewUI[],
): { id: string; name: string }[] {
  const groups: { id: string; name: string }[] = [];
  for (const node of toTree(sortListViews(views))) {
    if (isGroupNode(node)) {
      groups.push({ id: node.id, name: node.name });
    }
  }
  return groups;
}

export function addListViewsToGroup(
  views: IListViewUI[],
  itemIds: string[],
  group: { id: string; name: string },
): IListViewUI[] {
  if (itemIds.length === 0 || !group.id) return views;
  const ids = new Set(itemIds);
  const tree = toTree(sortListViews(views));
  const moving: IListViewUI[] = [];
  const nextTree: TreeNode[] = [];
  let existing: GroupNode | undefined;

  for (const node of tree) {
    if (isGroupNode(node)) {
      const kept: IListViewUI[] = [];
      for (const child of node.children) {
        if (ids.has(child.id)) moving.push(child);
        else kept.push(child);
      }
      if (node.id === group.id) {
        existing = { ...node, name: group.name || node.name, children: kept };
        nextTree.push(existing);
      } else if (kept.length > 0) {
        nextTree.push({ ...node, children: kept });
      }
    } else if (ids.has(node.id)) {
      moving.push(node);
    } else {
      nextTree.push(node);
    }
  }

  if (moving.length === 0) return views;

  if (existing) {
    existing.children.push(...moving);
  } else {
    nextTree.unshift({
      id: group.id,
      name: group.name,
      isGroup: true,
      children: moving,
    });
  }
  return reindex(fromTree(nextTree));
}

export function syncListViewLayerOrder(map: MapSimple, views: IListViewUI[]) {
  let beforeId = '';
  views.forEach((view, index, items) => {
    view.index = items.length - index;
    const parent = view.getParent();
    traverseTree(
      parent || view,
      (node) => {
        if (hasMoveLayer(node)) {
          node.moveLayer(map, beforeId);
          beforeId = node.getBeforeId() || '';
        }
      },
      { direction: 'rtl' },
    );
  });
}
