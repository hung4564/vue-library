---
category: Elements
---

<script setup>
import Demo from './demo.vue'
</script>

# useElementVisibility

<FunctionInfo fn="useElementVisibility" :frontmatter="$frontmatter" package="Share - Core" />

Tracks the visibility of an element within the viewport.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { useElementVisibility } from '@hungpv97/shared-core';

const target = ref(null);
const targetIsVisible = useElementVisibility(target);
</script>

<template>
  <div ref="target">
    <h1>Hello world</h1>
  </div>
</template>
```

## Directive Usage

```vue
<script setup>
import { ref } from 'vue';
import { vElementVisibility } from '@hungpv97/shared-core';

const target = ref(null);
const isVisible = ref(false);

function onElementVisibility(state) {
  isVisible.value = state;
}
</script>

<template>
  <div v-element-visibility="onElementVisibility">
    {{ isVisible ? 'inside' : 'outside' }}
  </div>

  <!-- with options -->
  <div ref="target">
    <div v-element-visibility="[onElementVisibility, { scrollTarget: target }]">
      {{ isVisible ? 'inside' : 'outside' }}
    </div>
  </div>
</template>
```
