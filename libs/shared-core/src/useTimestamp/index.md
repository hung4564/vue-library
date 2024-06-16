---
category: Animation
---

<script setup>
import Demo from './demo.vue'
</script>

# useTimestamp

<FunctionInfo fn="useTimestamp" :frontmatter="$frontmatter" package="Share - Core" />

Reactive current timestamp

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { useTimestamp } from '@hungpv97/shared-core';

const timestamp = useTimestamp({ offset: 0 });
```

```js
const { timestamp, pause, resume } = useTimestamp({ controls: true });
```

## Component Usage

```vue
<template>
  <UseTimestamp v-slot="{ timestamp, pause, resume }">
    Current Time: {{ timestamp }}
    <button @click="pause()">Pause</button>
    <button @click="resume()">Resume</button>
  </UseTimestamp>
</template>
```
