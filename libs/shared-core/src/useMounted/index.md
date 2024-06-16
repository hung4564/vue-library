---
category: Component
---

# useMounted

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="useMounted" />

Mounted state in ref.

## Usage

```js
import { useMounted } from '@hungpvq/shared-core';

const isMounted = useMounted();
```

Which is essentially a shorthand of:

```ts
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});
```
