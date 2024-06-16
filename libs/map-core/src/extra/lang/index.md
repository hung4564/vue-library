---
category: Extra
---

# Extra Lang

<FunctionInfo fn="Extra Lang" package="Map - Core" :frontmatter="$frontmatter"  />

## Usage

```ts
import { langStore, useLang, type MapLocateStore } from '@hungpvq/vue-map-core';
const { trans, setLocale } = useLang(mapId.value);
```

## langStore

```ts
import { langStore, type MapLocateStore } from '@hungpvq/vue-map-core';
langStore.getMapLang(mapId:string): MapLocateStore
langStore.setMapLang(mapId: string, locale: Record<string, string>): void
```

## useLang

```ts
import { useLang } from '@hungpvq/vue-map-core';
const { trans, setLocale } = useLang(mapId.value);
setLocale({
  map: {
    basemap: {
      title: 'Map basemap',
      setting: 'Setting',
    },
  },
});
trans('map.basemap.title');
```
