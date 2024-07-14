---
category: Animation
---

<script setup>
import Demo from './demo.vue'
</script>

# useInterval

<FunctionInfo fn="useInterval" :frontmatter="$frontmatter" package="Share" />
Reactive counter increases on every interval

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js {4}
import { useInterval } from '@hungpvq/shared';

// count will increase every 200ms
const counter = useInterval(200);
```

```ts
const { counter, reset, pause, resume } = useInterval(200, { controls: true });
```
