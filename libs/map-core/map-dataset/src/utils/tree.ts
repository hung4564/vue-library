export type Item = Record<string, unknown> & {
  id: string;
  group?: Group;
};
export type Group = Record<string, unknown> & {
  id: string;
  name: string;
};
export type GroupTree = Record<string, unknown> & {
  id: string;
  name: string;
  isGroup: true;
  show: boolean;
  children: Item[];
};
export type TreeItem = Item | GroupTree;

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
  let temp: GroupTree = {
    id: `group-${new Date().getTime()}`,
    name: 'New Group',
    isGroup: true,
    show: true,
    children: [],
  };
  temp = Object.assign({}, temp, group);
  return temp;
}
