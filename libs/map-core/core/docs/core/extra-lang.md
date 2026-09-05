# Extra Lang – How to Use Store & Hook

## 1. Using the Store (`langStore`)

The `langStore` provides methods to manage language data for each map instance via `mapId`.

**Import:**

```ts
import { langStore, type MapLocateStore } from '@hungpvq/vue-map-core';
```

**API:**

```ts
langStore.getMapLang(mapId: string): MapLocateStore
langStore.setMapLang(mapId: string, locale: Record<string, string>): void
```

**Example:**

```ts
const store = langStore.getMapLang('map1');
langStore.setMapLang('map1', {
  map: {
    basemap: {
      title: 'Base Map',
      setting: 'Settings',
    },
  },
});
```

## 2. Using the Hook (`useLang`)

The `useLang` hook provides a reactive way to work with language data for a specific map.

**Import:**

```ts
import { useLang } from '@hungpvq/vue-map-core';
```

**Usage:**

```ts
const { trans, setLocale } = useLang(mapId.value);

// Dynamically update locale
setLocale({
  map: {
    basemap: {
      title: 'Base Map',
      setting: 'Settings',
    },
  },
});

// Translate a key
trans('map.basemap.title'); // → 'Base Map'
```

**Explanation:**

- `trans(key: string)`: Translates the given key using the current locale.
- `setLocale(locale: object)`: Updates the locale for the current map instance.

---

### Summary

- Use `langStore` for direct store operations (get/set language data).
- Use `useLang` for reactive language handling in components (translation, dynamic locale updates).
