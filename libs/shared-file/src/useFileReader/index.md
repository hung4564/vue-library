---
category: Browser
---

<script setup>
import Demo from './demo.vue'
</script>

# useFileReader

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="useFileReader" />
Open file dialog with ease.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```ts
import { useFileReader } from '@hungpv97@shared-core';

const { read } = useFileReader();
```
