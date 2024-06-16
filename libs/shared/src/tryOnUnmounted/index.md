---
category: Component
---

# tryOnUnmounted

Safe `onUnmounted`. Call `onUnmounted()` if it's inside a component lifecycle, if not, do nothing

## Usage

```js
import { tryOnUnmounted } from '@hungpv97/shared';

tryOnUnmounted(() => {});
```
