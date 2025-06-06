---
category: Extra
---

# Extra Crs

<FunctionInfo fn="Extra Crs" package="Map - Core" :frontmatter="$frontmatter" />

## Usage

```ts
import { useMapCrsItems, useCoordinate } from '@hungpvq/vue-map-core';
```

## crsStore

```ts
import { useMapCrsItems } from '@hungpvq/vue-map-core';
const crsHandle = useMapCrsItems(mapId);
```

## useCoordinate

```ts
import { useCoordinate } from '@hungpvq/vue-map-core';
const { format } = useCoordinate(mapId.value);
format(
  { longitude, latitude }: { longitude: number; latitude: number },
  isDMS:boolean
): { longitude: number , latitude: number};
```
