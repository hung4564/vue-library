import type { IDataset, IDatasetVisitor } from '../../interfaces';
type VisitFunction = (
  node: IDataset,
  level: number,
  path: number[],
) => void | false;
export function traverseTreeBFS(
  root: IDataset,
  visitor: IDatasetVisitor | VisitFunction,
  {
    check,
    direction = 'ltr',
  }: {
    check?: (node: IDataset, level: number) => boolean;
    direction?: 'ltr' | 'rtl';
  } = {},
): boolean {
  const queue: Array<{ node: IDataset; level: number; path: number[] }> = [
    { node: root, level: 0, path: [1] },
  ];

  while (queue.length > 0) {
    const { node, level, path } = queue.shift()!;
    if (callVisit(node, level, path, visitor) === false) return true;
    if (check?.(node, level)) return true;

    if ('getChildren' in node && typeof node.getChildren === 'function') {
      const children = node.getChildren() || [];
      const ordered = direction === 'rtl' ? [...children].reverse() : children;

      for (let i = 0; i < ordered.length; i++) {
        const child = ordered[i];
        queue.push({
          node: child,
          level: level + 1,
          path: [...path, i + 1],
        });
      }
    }
  }

  return false;
}
export function traverseTreeDFS(
  root: IDataset,
  visitor: IDatasetVisitor | VisitFunction,
  {
    check,
    direction = 'ltr',
  }: {
    check?: (node: IDataset, level: number) => boolean;
    direction?: 'ltr' | 'rtl';
  } = {},
): boolean {
  const stack: Array<{ node: IDataset; level: number; path: number[] }> = [
    { node: root, level: 0, path: [1] },
  ];

  while (stack.length > 0) {
    const { node, level, path } = stack.pop()!;

    if (callVisit(node, level, path, visitor) === false) return true;
    if (check?.(node, level)) return true;

    if ('getChildren' in node && typeof node.getChildren === 'function') {
      const children = node.getChildren() || [];
      // For DFS, we push children in reverse order of visitation so they are popped in correct order.
      // LTR: visit 0, 1, 2 -> push 2, 1, 0
      // RTL: visit 2, 1, 0 -> push 0, 1, 2
      const start = 0;
      const end = children.length - 1;

      if (direction === 'ltr') {
        for (let i = end; i >= start; i--) {
          stack.push({
            node: children[i],
            level: level + 1,
            path: [...path, i + 1],
          });
        }
      } else {
        for (let i = start; i <= end; i++) {
          stack.push({
            node: children[i],
            level: level + 1,
            path: [...path, i + 1],
          });
        }
      }
    }
  }

  return false;
}
export function traverseTree(
  node: IDataset,
  visitor: IDatasetVisitor | VisitFunction,
  {
    check,
    direction = 'ltr', // 'ltr' = left to right, 'rtl' = right to left
    strategy = 'dfs',
  }: {
    check?: (node: IDataset, level: number) => boolean;
    direction?: 'ltr' | 'rtl';
    strategy?: 'dfs' | 'bfs';
  } = {},
): boolean {
  if (strategy === 'bfs') {
    return traverseTreeBFS(node, visitor, { check, direction });
  }
  return traverseTreeDFS(node, visitor, { check, direction });
}
function callVisit(
  node: IDataset,
  level: number,
  path: number[],
  visitor: IDatasetVisitor | VisitFunction,
): void | false {
  if (typeof visitor === 'function') {
    return visitor(node, level, path);
  }
  if (level === 0) return visitor.visitRoot(node);

  const isLeaf =
    !('getChildren' in node) ||
    typeof node.getChildren !== 'function' ||
    (node.getChildren()?.length ?? 0) === 0;

  return isLeaf ? visitor.visitLeaf(node) : visitor.visitComposite(node);
}
