---
category: Animation
---

<script setup>
import Demo from './demo.vue'
</script>

# useRafFn

<FunctionInfo fn="useRafFn" :frontmatter="$frontmatter" package="Share - Core" />
Call function on every `requestAnimationFrame`. With controls of pausing and resuming.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { ref } from 'vue';
import { useRafFn } from '@hungpv97/shared-core';

const count = ref(0);

const { pause, resume } = useRafFn(() => {
  count.value++;
  console.log(count.value);
});
```
