---
category: Component
---

# tryOnMounted

<FunctionInfo fn="tryOnMounted" />
Safe `onMounted`. Call `onMounted()` if it's inside a component lifecycle, if not, just call the function

## Usage

```js
import { tryOnMounted } from '@hungpv97/shared';

tryOnMounted(() => {});
```
