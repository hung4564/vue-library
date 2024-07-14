---
category: Utilities
---

# useSupported

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="useSupported" />
SSR compatibility `isSupported`

## Usage

```ts
import { useSupported } from '@hungpvq/shared-core';

const isSupported = useSupported(() => navigator && 'getBattery' in navigator);

if (isSupported.value) {
  // do something
  navigator.getBattery;
}
```
