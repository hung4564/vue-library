---
category: Component
---

# unrefElement

<FunctionInfo fn="unrefElement" />
Retrieves the underlying DOM element from a Vue ref or component instance

## Usage

```vue
<script setup>
import { onMounted, ref } from 'vue';
import { unrefElement } from '@hungpvq/shared';

const div = ref(); // will be bound to the <div> element
const hello = ref(); // will be bound to the HelloWorld Component

onMounted(() => {
  console.info(unrefElement(div)); // the <div> element
  console.info(unrefElement(hello)); // the root element of the HelloWorld Component
});
</script>

<template>
  <div ref="div" />
  <HelloWorld ref="hello" />
</template>
```
