---
category: Elements
---

<script setup>
import Demo from './demo.vue'
</script>

# useDropZone

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="useDropZone" />

Create a zone where files can be dropped.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```vue
<script setup lang="ts">
import { useDropZone } from '@hungpvq/share-code';

const dropZoneRef = ref<HTMLDivElement>();

function onDrop(files: File[] | null) {
  // called when files are dropped on zone
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  // specify the types of data to be received.
  dataTypes: ['image/jpeg'],
});
</script>

<template>
  <div ref="dropZoneRef">Drop files here</div>
</template>
```
