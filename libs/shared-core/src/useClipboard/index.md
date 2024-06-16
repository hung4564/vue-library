---
category: Browser
---

<script setup>
import Demo from './demo.vue'
</script>

# useClipboard

<FunctionInfo fn="useClipboard" :frontmatter="$frontmatter" package="Share - Core" />

Reactive [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API). Provides the ability to respond to clipboard commands (cut, copy, and paste) as well as to asynchronously read from and write to the system clipboard. Access to the contents of the clipboard is gated behind the [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API). Without user permission, reading or altering the clipboard contents is not permitted.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```vue
<script setup lang="ts">
import { useClipboard } from '@hungpvq/shared-core';

const source = ref('Hello');
const { text, copy, copied, isSupported } = useClipboard({ source });
</script>

<template>
  <div v-if="isSupported">
    <button @click="copy(source)">
      <!-- by default, `copied` will be reset in 1.5s -->
      <span v-if="!copied">Copy</span>
      <span v-else>Copied!</span>
    </button>
    <p>
      Current copied: <code>{{ text || 'none' }}</code>
    </p>
  </div>
  <p v-else>Your browser does not support Clipboard API</p>
</template>
```

Set `legacy: true` to keep the ability to copy if [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) is not available. It will handle copy with [execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) as fallback.

## Type

<<< ./index.ts#type
