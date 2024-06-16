---
category: Browser
---

<script setup>
import Demo from './demo.vue'
</script>

# useTimeoutFn

<FunctionInfo fn="useTimeoutFn" :frontmatter="$frontmatter" package="Share" />
Wrapper for `setTimeout` with controls.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { useTimeoutFn } from '@hungpv97/shared-core';

const { isPending, start, stop } = useTimeoutFn(() => {
  /* ... */
}, 3000);
```
