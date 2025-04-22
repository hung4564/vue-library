export function convertListToTree(value: Item[]): TreeItem[] {
  const treeLayer: TreeItem[] = [];
  if (!value || value.length == 0) {
    return treeLayer;
  }
  const group_cache: Record<string, GroupTree> = {};
  value.forEach((x) => {
    if (!x.group) {
      treeLayer.push(x);
      return;
    }
    if (!group_cache[x.group.id]) {
      group_cache[x.group.id] = createDefaultGroup(x.group);
      treeLayer.push(group_cache[x.group.id]);
    }
    const group = group_cache[x.group.id];

    group.children.push(x);
  });
  return treeLayer;
}
function createDefaultGroup(group: Group | GroupTree) {
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

export type Item = {
  id: string;
  group?: Group;
  [key: string]: any;
};
export type Group = {
  id: string;
  name: string;
  [key: string]: any;
};
type GroupTree = {
  id: string;
  name: string;
  isGroup: true;
  show: boolean;
  children: Item[];
  [key: string]: any;
};
export type TreeItem = Item | GroupTree;
