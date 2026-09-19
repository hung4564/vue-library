# Extra Lang – locale catalogs & `useLang`

Map UI strings live in **per-language catalogs** on the `LANG` store (`MAP_STORE_KEY.LANG`). Controls register English into `messages.en`; apps / `LanguageControl` register other languages (e.g. `vi`) and call `setLanguage`.

## Model

```ts
type MapLocateStore = {
  language: string;              // active code
  fallbackLanguage: string;      // default 'en'
  messages: Record<string, MapLangLocale>;
  languageLabels: Record<string, string>;
  loadingLanguages: Record<string, boolean>;
  translate?: MapTranslateFunction;
};
```

`trans(key)` resolves: `messages[language]` → `messages[fallbackLanguage]` → raw key.

## Hook (`useLang`)

```ts
import { useLang } from '@hungpvq/vue-map-core'; // or @hungpvq/react-map-core

const {
  trans,
  language,
  fallbackLanguage,
  languages,
  registerLocale,
  registerLocaleFlat,
  registerLanguage,
  setLanguage,
  setFallbackLanguage,
  loadLocale,
  setTranslate,
} = useLang(mapId);
```

### Register (controls)

```ts
registerLocale('en', HOME_CONTROL_LOCALE);
```

### Override keys

```ts
registerLocale('en', MAP_CORE_LOCALE_EN);
registerLocale('vi', MAP_CORE_LOCALE_VI);
registerLocale('vi', {
  map: { home: { title: 'Về trang chính (custom)' } },
});
```

### Add a language

```ts
registerLanguage('fr', { label: 'Français' });
registerLocale('fr', MY_FR_PACK); // partial OK — missing keys use fallbackLanguage
setLanguage('fr');
```

### Default language

Priority: **localStorage** (`hungpvq.map-language`) → `LanguageControl` `defaultLanguage` / `bootstrapMapLanguage` → `'en'`.

```ts
import { bootstrapMapLanguage } from '@hungpvq/map-core';

bootstrapMapLanguage('vi'); // persist initial preference
// or
<LanguageControl defaultLanguage="vi" />
```

Change fallback catalog (when active lang misses a key):

```ts
setFallbackLanguage('en'); // default
```

### Flat key-value (CMS / API)

```ts
registerLocaleFlat('vi', {
  'map.home.title': 'Về mặc định',
  'map.basemap.title': 'Nền bản đồ',
});
```

Helpers: `unflattenLocaleMessages` / `flattenLocaleMessages` / `isMapLangFlatMessages`.

### Load via API

```ts
await loadLocale('vi', async (lang) => {
  const res = await fetch(`/api/i18n/${lang}`);
  return res.json(); // flat KV or nested tree
});
setLanguage('vi');
```

`loadLocale` merges on top of built-in `registerLocale` packs. It skips a
second fetch for the same language unless `{ force: true }` (e.g. LanguageControl
`reloadOnSelect`).

### Custom translator (external i18n)

Plug in vue-i18n, i18next, or any library via `setTranslate` / LanguageControl `translate` prop.

The third argument `fallback` resolves built-in catalogs when your library has no string:

```ts
setTranslate((key, params, fallback) => {
  const fromLib = i18n.t(key, params);
  // vue-i18n / i18next often return the key when missing:
  if (fromLib && fromLib !== key) return String(fromLib);
  return fallback?.() ?? key;
});
```

Or replace catalogs entirely:

```ts
setTranslate((key, params) => myI18n.t(key, params));
```

Clear with `setTranslate(null)`.

On the control:

```vue
<LanguageControl :translate="myTranslate" />
```

```tsx
<LanguageControl translate={myTranslate} />
```

`translateMapLangFromCatalog` is also exported if you need catalog lookup outside the hook.

## Built-in packs

| Export | Package |
|--------|---------|
| `MAP_CORE_LOCALE_EN`, `MAP_CORE_LOCALE_VI`, `LANGUAGE_CONTROL_LOCALE` | `@hungpvq/map-core` |
| `MAP_DATASET_LOCALE_EN`, `MAP_DATASET_LOCALE_VI` | `@hungpvq/map-dataset` |
| `MAP_DRAW_LOCALE_EN`, `MAP_DRAW_LOCALE_VI` | `@hungpvq/map-draw` |

Pack files: `locale/locale.en.ts` / `locale/locale.vi.ts` (full catalogs). Control slices live in `<domain>/locale/locale.<lang>.ts` (EN compat: `locale/index.ts` → `locale.en`) and are merged into the packs. See skill `map-locale`.

See [LanguageControl](./module/LanguageControl.md) for the toolbar control.
