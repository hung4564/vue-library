---
category: Animation
---

<script setup>
import Demo from './demo.vue'
</script>

# useIntervalFn

<FunctionInfo fn="useIntervalFn" :frontmatter="$frontmatter" package="Share" />
Wrapper for `setInterval` with controls

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { useIntervalFn } from '@hungpvq/shared-core';

const { pause, resume, isActive } = useIntervalFn(() => {
  /* your function */
}, 1000);
```
