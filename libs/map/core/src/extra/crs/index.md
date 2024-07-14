---
category: Extra
---

# Extra Crs

<FunctionInfo fn="Extra Crs" package="Map - Core" :frontmatter="$frontmatter" />

## Usage

```ts
import { crsStore, type MapCrsStore, type CrsItem, useCoordinate } from '@hungpvq/vue-map-core';
```

## crsStore

```ts
import { crsStore, type MapCrsStore } from '@hungpvq/vue-map-core';
imageStore.setCrsItems(mapId: string, items: CrsItem[]): void
imageStore.getCrsItems(mapId: string): CrsItem[]
imageStore.getCrs(mapId: string): CrsItem
imageStore.setCrs(mapId: string, crs: CrsItem): void
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
