# LanguageControl

## Usecase

- Switch map UI language (`en` / `vi` by default; any string code).
- **Collapsed** face always shows the **active** language code (`VI`, `EN`, …).
- **Hover** expands like ThemeControl: language chips + current face (`fr | vi | en | <current>` visually on right corners).
- **Click a chip** to select that language; **click `<current>`** to cycle the next code in `languages`.
- Optional **API loader** merges flat or nested JSON into the active catalog.

Built-in default catalog: `MAP_CORE_LOCALE_EN` (seeded once per map). Extra languages
are app-owned — pass packs via `locales[code]` for each code in `languages`
(e.g. `locales.vi = MAP_CORE_LOCALE_VI`, plus dataset/draw VI). Preference is stored
under `localStorage` key `hungpvq.map-language`.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `labels` | `Record<string, string>` | — | Tooltip titles (chips still show uppercase codes `EN` / `VI`) |
| `languages` | `string[]` | `['en','vi']` | Codes shown as text chips (e.g. `['en','vi','fr']`) |
| `defaultLanguage` | `string` | `'vi'` | Used when nothing stored / stored code not in `languages` |
| `fallbackLanguage` | `string` | `'en'` store default | Catalog used when a key is missing |
| `localeLoader` | `(lang) => Promise<flat \| nested>` | — | Fetch on mount (initial) and when selecting a language |
| `reloadOnSelect` | `boolean` | `false` | Force re-fetch on every select |
| `translate` | `MapTranslateFunction \| null` | — | External i18n (`(key, params, fallback) => string`); `null` clears |

<!--@include: ./props.md-->

## Examples

### Vue

```vue
<script setup lang="ts">
import { deepMergeLocale, MAP_CORE_LOCALE_VI } from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_VI } from '@hungpvq/map-dataset';
import { LanguageControl, Map, HomeControl } from '@hungpvq/vue-map-core';

async function localeLoader(lang: string) {
  const res = await fetch(`/demo-i18n/${lang}.json`);
  return res.ok ? res.json() : null;
}
</script>

<template>
  <Map>
    <LanguageControl
      default-language="vi"
      :languages="['en', 'vi']"
      :locales="{ vi: deepMergeLocale(MAP_CORE_LOCALE_VI, MAP_DATASET_LOCALE_VI) }"
      :locale-loader="localeLoader"
    />
    <HomeControl />
  </Map>
</template>
```

### React

```tsx
import { LanguageControl, Map, HomeControl } from '@hungpvq/react-map-core';
import { deepMergeLocale, MAP_CORE_LOCALE_VI } from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_VI } from '@hungpvq/map-dataset';

<Map>
  <LanguageControl
    defaultLanguage="vi"
    languages={['en', 'vi']}
    locales={{ vi: deepMergeLocale(MAP_CORE_LOCALE_VI, MAP_DATASET_LOCALE_VI) }}
    localeLoader={async (lang) => {
      const res = await fetch(`/demo-i18n/${lang}.json`);
      return res.ok ? res.json() : null;
    }}
  />
  <HomeControl />
</Map>
```

Demo: `/#/language` (Vue & React demo-map).

## Related

- [Extra Lang](../extra-lang.md) — `registerLocale`, `loadLocale`, override & add languages
- Registry id: `mapLanguageControl`
