---
category: Browser
---

<script setup>
import Demo from './demo.vue'
</script>

# useFileDialog

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="useFileDialog" />
Open file dialog with ease.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```ts
import { useFileDialog } from '@hungpv97@shared-core';

const { files, open, reset, onChange } = useFileDialog({
  accept: 'image/*', // Set to accept only image files
  directory: true, // Select directories instead of files if set true
});

onChange((files) => {
  /** do something with files */
});
```

```vue
<template>
  <button type="button" @click="open">Choose file</button>
</template>
```
