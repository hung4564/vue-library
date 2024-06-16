---
category: Sensors
---

<script setup>
import Demo from './demo.vue'
</script>

# onStartTyping

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="onStartTyping" />

Fires when users start typing on non-editable elements.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```vue
<input ref="input" type="text" placeholder="Start typing to focus" />
```

```ts {7-10}
import { onStartTyping } from '@hungpvq/shared-core';

export default {
  setup() {
    const input = ref(null);

    onStartTyping(() => {
      if (!input.value.active) input.value.focus();
    });

    return {
      input,
    };
  },
};
```
