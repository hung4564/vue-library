---
category: Browser
---

<script setup>
import Demo from './demo.vue'
</script>

# useFileReader

<FunctionInfo :frontmatter="$frontmatter" package="Share - File" fn="useFileReader" />
Open file dialog with ease.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```ts
import { useFileReader } from '@hungpvq@shared-file';

const { read } = useFileReader();
```
