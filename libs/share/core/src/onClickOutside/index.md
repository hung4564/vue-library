---
category: Sensors
---

<script setup>
import Demo from './demo.vue'
</script>

# onClickOutside

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="onClickOutside" />
Listen for clicks outside of an element. Useful for modal or dropdown.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { onClickOutside } from '@hungpvq/shared-core';

const target = ref(null);

onClickOutside(target, (event) => console.info(event));
</script>

<template>
  <div ref="target">Hello world</div>
  <div>Outside element</div>
</template>
```

> This function uses [Event.composedPath()](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath) which is NOT supported by IE 11, Edge 18 and below. If you are targeting these browsers, we recommend you to include [this code snippet](https://gist.github.com/sibbng/13e83b1dd1b733317ce0130ef07d4efd) on your project.
