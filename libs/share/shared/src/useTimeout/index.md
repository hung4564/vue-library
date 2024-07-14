---
category: Animation
---

<script setup>
import Demo from './demo.vue'
</script>

# useTimeout

<FunctionInfo fn="useTimeout" :frontmatter="$frontmatter" package="Share" />
Update value after a given time with controls.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { promiseTimeout, useTimeout } from '@hungpvq/shared';

const ready = useTimeout(1000);
```

```js
const { ready, start, stop } = useTimeout(1000, { controls: true });
```

```js
console.info(ready.value); // false

await promiseTimeout(1200);

console.info(ready.value); // true
```
