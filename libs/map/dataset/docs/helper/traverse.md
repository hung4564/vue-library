# Tree Traversal Utilities (`traverse.ts`)

This module provides utility functions for traversing a dataset tree using either breadth-first search (BFS) or depth-first search (DFS) strategies. These functions are useful for visiting, searching, or processing nodes in a hierarchical dataset structure.

## Functions

### 1. `traverseTreeBFS`

**Signature:**

```typescript
traverseTreeBFS(
  root: IDataset,
  visitor: IDatasetVisitor | VisitFunction,
  options?: {
    check?: (node: IDataset, level: number) => boolean;
    direction?: 'ltr' | 'rtl';
  }
): boolean
```

- Traverses the tree in breadth-first order (level by level).
- Calls the `visitor` function or object for each node.
- Stops early if the visitor returns `false` or the `check` function returns `true`.
- `direction` can be 'ltr' (left-to-right, default) or 'rtl' (right-to-left).

### 2. `traverseTreeDFS`

**Signature:**

```typescript
traverseTreeDFS(
  node: IDataset,
  visitor: IDatasetVisitor | VisitFunction,
  options?: {
    level?: number;
    path?: number[];
    check?: (node: IDataset, level: number) => boolean;
    direction?: 'ltr' | 'rtl';
  }
): boolean
```

- Traverses the tree in depth-first order (visits children before siblings).
- Calls the `visitor` function or object for each node.
- Stops early if the visitor returns `false` or the `check` function returns `true`.
- `direction` can be 'ltr' (left-to-right, default) or 'rtl' (right-to-left).

### 3. `traverseTree`

**Signature:**

```typescript
traverseTree(
  node: IDataset,
  visitor: IDatasetVisitor | VisitFunction,
  options?: {
    check?: (node: IDataset, level: number) => boolean;
    direction?: 'ltr' | 'rtl';
    strategy?: 'dfs' | 'bfs';
  }
): boolean
```

- General-purpose traversal function.
- Uses DFS by default, or BFS if `strategy: 'bfs'` is specified.
- Passes all options to the underlying traversal function.

### 4. `callVisit` (internal)

- Helper function to call the appropriate visitor method based on node type and level.
- Not intended for direct use.

## Visitor Types

- `IDatasetVisitor`: An object with methods `visitRoot(node)`, `visitLeaf(node)`, and `visitComposite(node)`.
- `VisitFunction`: A function `(node, level, path) => void | false`.

## Usage Examples

### Example: Depth-First Traversal (DFS)

```typescript
import { traverseTree } from './traverse';

traverseTree(rootDataset, (node, level, path) => {
  console.log('Visited node:', node.getName(), 'at level', level, 'path', path);
});
```

### Example: Breadth-First Traversal (BFS)

```typescript
import { traverseTree } from './traverse';

traverseTree(
  rootDataset,
  (node, level) => {
    console.log('Visited node:', node.getName(), 'at level', level);
  },
  { strategy: 'bfs' },
);
```

### Example: Using a Visitor Object

```typescript
const visitor = {
  visitRoot(node) {
    console.log('Root:', node.getName());
  },
  visitLeaf(node) {
    console.log('Leaf:', node.getName());
  },
  visitComposite(node) {
    console.log('Composite:', node.getName());
  },
};

traverseTree(rootDataset, visitor);
```

## Parameters

- `root` or `node`: The root node of the dataset tree to traverse.
- `visitor`: A function or object to be called for each node.
- `options.check`: Optional function to stop traversal early if it returns `true`.
- `options.direction`: 'ltr' (default) or 'rtl' for child order.
- `options.strategy`: 'dfs' (default) or 'bfs'.

## Return Value

- Returns `true` if traversal was stopped early (by returning `false` from the visitor or `true` from `check`).
- Returns `false` if traversal completed all nodes.

## Best Practices

- Use DFS for recursive processing or when you want to process children before siblings.
- Use BFS for level-order processing or when you want to process all nodes at a given depth before moving deeper.
- Use the `check` option for efficient early exit (e.g., searching for a node).

---

# Helper Functions for Dataset Trees (`helpers.ts`)

This section documents additional helper functions for working with dataset trees.

## `findRoot(node)`

- Returns the root node of the tree containing `node`.
- Walks up the parent chain until the topmost node is found.

## `findSiblingOrNearestLeaf(startNode, check)`

- Searches for the first leaf node matching `check`, starting from `startNode` and moving up the tree if not found in the current subtree.
- Returns the found node or `undefined` if not found.

## `findFirstLeafByType(sourceLeaf, targetType)`

- Finds the first leaf node of a given `targetType` near `sourceLeaf`.
- Uses `findSiblingOrNearestLeaf` internally.

## `findAllDatasetsMatching(startNode, check, excludeNode?)`

- Returns all nodes in the tree under `startNode` that match the `check` function.
- Optionally excludes a specific node.

## `findAllComponentsByType(rootDataset, targetType)`

- Returns all nodes of a given `targetType` in the tree under `rootDataset`.
- Uses `findAllDatasetsMatching` internally.

## `applyToAllLeaves(rootDataset, functions)`

- Applies an array of functions to every leaf node in the tree under `rootDataset`.
- Returns a Map from node name to an array of results for each function.

## `runAllComponentsWithCheck(rootDataset, typeCheckFunction, functions)`

- Applies an array of functions to every node in the tree under `rootDataset` that passes the `typeCheckFunction`.
- Returns a Map from node name to an array of results for each function.

## `printTreeFromRoot(root)`

- Prints a formatted tree structure to the console, starting from the root node.
- Shows the path, type, and name of each node.

## `printTreeFromNode(leaf)`

- Prints a formatted tree structure to the console, starting from the root of the tree containing `leaf`.
- Shows the path, type, and name of each node.

---

## Example: Finding and Printing

```typescript
import { findRoot, findFirstLeafByType, printTreeFromRoot } from './helpers';

const root = findRoot(someLeaf);
const dataLeaf = findFirstLeafByType(someLeaf, 'dataManagement');
printTreeFromRoot(root);
```

## Example: Applying Functions to All Leaves

```typescript
import { applyToAllLeaves } from './helpers';

const results = applyToAllLeaves(rootDataset, [(leaf) => leaf.getData(), (leaf) => leaf.type]);

results.forEach((resultArray, nodeName) => {
  console.log(nodeName, resultArray);
});
```

## Example: Running Functions on All Components of a Type

```typescript
import { runAllComponentsWithCheck } from './helpers';

const results = runAllComponentsWithCheck(rootDataset, (node) => node.type === 'layer', [(layer) => layer.getData()]);

results.forEach((resultArray, nodeName) => {
  console.log(nodeName, resultArray);
});
```
