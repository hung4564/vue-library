---
category: Sensors
---

<script setup>
import Demo from './demo.vue'
</script>

# useIdle

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="useIntersectionObserver"  />

Tracks whether the user is being inactive.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { useIdle } from '@hungpvq/shared-core';

const { idle, lastActive } = useIdle(5 * 60 * 1000); // 5 min

console.log(idle.value); // true or false
```

Programatically resetting:

```js
import { watch } from 'vue';
import { useCounter, useIdle } from '@hungpvq/shared-core';

const { inc, count } = useCounter();

const { idle, lastActive, reset } = useIdle(5 * 60 * 1000); // 5 min

watch(idle, (idleValue) => {
  if (idleValue) {
    inc();
    console.log(`Triggered ${count.value} times`);
    reset(); // restarts the idle timer. Does not change lastActive value
  }
});
```
