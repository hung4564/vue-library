---
category: Elements
---

<script setup>
import Demo from './demo.vue'
</script>

# useWindowSize

<FunctionInfo fn="useWindowSize" :frontmatter="$frontmatter" package="Share - Core" />

Reactive window size

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>
## Usage

```js
import { useWindowSize } from '@hungpvq/shared-core';

const { width, height } = useWindowSize();
```
