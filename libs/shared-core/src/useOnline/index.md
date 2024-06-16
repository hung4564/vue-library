---
category: Sensors
---

<script setup>
import Demo from './demo.vue'
</script>

# useOnline

<FunctionInfo fn="useOnline" :frontmatter="$frontmatter" package="Share - Core" />
Reactive online state. A wrapper of `useNetwork`.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { useOnline } from '@hungpvq/shared-core';

const online = useOnline();
```
