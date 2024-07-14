---
category: Reactivity
---

# toValue

<FunctionInfo fn="toValue" />
Get the value of value/ref/getter.

## Usage

```ts
import { toValue } from '@hungpvq/shared';

const foo = ref('hi');

const a = toValue(0); // 0
const b = toValue(foo); // 'hi'
const c = toValue(() => 'hi'); // 'hi'
```
