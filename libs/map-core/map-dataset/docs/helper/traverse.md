# Tree helpers

Import from `@hungpvq/map-dataset` or `@hungpvq/vue-map-dataset`.

```typescript
import {
  traverseTree,
  findAllComponentsByType,
  findFirstLeafByType,
  findRoot,
} from '@hungpvq/vue-map-dataset';

traverseTree(root, (node, level) => {
  console.info(node.getName(), level);
});

traverseTree(root, visitor, { strategy: 'bfs' });

const lists = findAllComponentsByType(root, 'list');
const source = findFirstLeafByType(listNode, 'source');
const root = findRoot(listNode);
```

`traverseTree` options: `strategy: 'dfs' | 'bfs'`, `direction: 'ltr' | 'rtl'`, `check(node, level)` to stop early.
