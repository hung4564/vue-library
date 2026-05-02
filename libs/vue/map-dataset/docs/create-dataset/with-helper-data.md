# data System in Dataset Components

## Overview

## Use Cases

## API

You can create an event system for your dataset component using `createWithDataHelper`. The returned object provides the following methods:

- `getData()`
- `setData(data)`

## Basic Usage Example

```typescript
const data = createWithDataHelper();
data.setData([1, 2, 3]);
```

## Example: Using Events in a Custom Leaf

```typescript
import { createDatasetLeaf, createWithEventHelper } from '@hungpvq/vue-map-dataset';
import type { EventIListViewUI } from '@hungpvq/vue-map-dataset/src/model/list-view/types';

const data = createWithDataHelper<number>();

const customLeaf = {
  ...createDatasetLeaf('My Custom Leaf'),
  type: 'my-custom-type',
  data,
};

customLeaf.data.setData(1);

const data = customLeaf.data.getData();
```

## Best Practices
