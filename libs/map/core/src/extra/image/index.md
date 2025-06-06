---
category: Extra
---

# Extra Image

<FunctionInfo fn="Extra Image" package="Map - Core" :frontmatter="$frontmatter" />

## Usage

```ts
import { useMapImage } from '@hungpvq/vue-map-core';
```

## imageStore

```ts
import { useMapImage } from '@hungpvq/vue-map-core';
const imageHandle = useMapImage()
imageHandle.addImage(
  mapId: string,
  key: string,
  image_url: string,
  option: any = {}): Promise<void>
```
