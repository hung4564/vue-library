---
category: '@Integrations'
---

# useSortable

Wrapper for [`sortable`](https://github.com/SortableJS/Sortable).

For more information on what options can be passed, see [`Sortable.options`](https://github.com/SortableJS/Sortable#options) in the `Sortable` documentation.

## Install

```bash
npm i sortablejs@^1
```

## Usage

### Use template ref

```vue
<script setup lang="ts">
import { useStoreSortable } from '@hungpvq/shared-integrations';
import { ref } from 'vue';

const el = ref<HTMLElement | null>(null);
const list = ref([
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
  { id: 3, name: 'c' },
]);

useStoreSortable(el, list);
</script>

<template>
  <div ref="el">
    <div v-for="item in list" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>
```

### Use specifies the selector to operate on

```vue
<script setup lang="ts">
import { useSortable } from '@hungpvq/shared-core';
import { ref } from 'vue';

const el = ref<HTMLElement | null>(null);
const list = ref([
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
  { id: 3, name: 'c' },
]);

const animation = 200;

const { option } = useSortable(el, list, {
  handle: '.handle',
  // or option set
  // animation
});

// You can use the option method to set and get the option of Sortable
option('animation', animation);
// option('animation') // 200
</script>

<template>
  <div ref="el">
    <div v-for="item in list" :key="item.id">
      <span>{{ item.name }}</span>
      <span class="handle">*</span>
    </div>
  </div>
</template>
```

### Use a selector to get the root element

```vue
<script setup lang="ts">
import { useSortable } from '@hungpvq/shared-integrations';
import { ref } from 'vue';

const list = ref([
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
  { id: 3, name: 'c' },
]);

useSortable('#dv', list);
</script>

<template>
  <div id="dv">
    <div v-for="item in list" :key="item.id">
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>
```
