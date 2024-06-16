---
category: Browser
---

<script setup>
import Demo from './demo.vue'
</script>

# useMediaQuery

<FunctionInfo fn="useMediaQuery" :frontmatter="$frontmatter" package="Share - Core" />
Reactive [Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries). Once you've created a MediaQueryList object, you can check the result of the query or receive notifications when the result changes.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { useMediaQuery } from '@hungpv97/shared-core';

const isLargeScreen = useMediaQuery('(min-width: 1024px)');
const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)');
```
