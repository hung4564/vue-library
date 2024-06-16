---
category: Elements
---

<script setup>
import Demo from './demo.vue'
</script>

# useIntersectionObserver

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="useIntersectionObserver" />
Detects that a target element's visibility.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { useIntersectionObserver } from '@hungpv97/shared-core';

const target = ref(null);
const targetIsVisible = ref(false);

const { stop } = useIntersectionObserver(target, ([{ isIntersecting }], observerElement) => {
  targetIsVisible.value = isIntersecting;
});
</script>

<template>
  <div ref="target">
    <h1>Hello world</h1>
  </div>
</template>
```

## Directive Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { vIntersectionObserver } from '@hungpv97/shared-core';

const root = ref(null);

const isVisible = ref(false);

function onIntersectionObserver([{ isIntersecting }]: IntersectionObserverEntry[]) {
  isVisible.value = isIntersecting;
}
</script>

<template>
  <div>
    <p>Scroll me down!</p>
    <div v-intersection-observer="onIntersectionObserver">
      <p>Hello world!</p>
    </div>
  </div>

  <!-- with options -->
  <div ref="root">
    <p>Scroll me down!</p>
    <div v-intersection-observer="[onIntersectionObserver, { root }]">
      <p>Hello world!</p>
    </div>
  </div>
</template>
```

[IntersectionObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver)
