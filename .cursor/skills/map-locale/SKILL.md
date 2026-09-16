---
name: map-locale
description: >-
  Fixed map UI language packs live in locale/locale.<en|vi|...>.ts; domain
  slices in <domain>/locale/locale.<lang>.ts. Use when adding a language,
  editing map strings, LanguageControl catalogs, or EN↔VI key parity.
---

# Map Locale (fixed languages)

## File layout (required)

Fixed (built-in) language catalogs always live **inside a `locale/` directory**
(`map-core`, `map-dataset`, `map-draw`):

| Layer | Path | Export example |
|-------|------|----------------|
| **Aggregate pack** | `src/locale/locale.<lang>.ts` | `MAP_CORE_LOCALE_EN`, `MAP_CORE_LOCALE_VI` |
| **Domain slice** | `<domain>/locale/locale.<lang>.ts` | `BASEMAP_CONTROL_LOCALE`, `BASEMAP_CONTROL_LOCALE_VI` |
| **Shell slices** | `src/locale/shell.<lang>.ts` | `HOME_CONTROL_LOCALE`, `MAP_ACTION_LOCALE_VI` |
| **Draw slices** | `src/locale/draw.<lang>.ts` | `DRAW_CONTROL_LOCALE`, `DRAW_CONTROL_LOCALE_VI` |
| **EN compat** | `<domain>/locale/index.ts` → `export * from './locale.en'` | keep `from '.../locale'` imports |

**Never** put `locale.<lang>.ts` (or `locale.ts`) as a sibling file outside a `locale/` folder.

Examples:

```
libs/map-core/core/src/
  locale/
    shell.en.ts / shell.vi.ts
    locale.en.ts / locale.vi.ts   # MAP_CORE_LOCALE_*
    index.ts                      # → shell.en
  basemap/locale/
    locale.en.ts / locale.vi.ts
    index.ts                      # → locale.en

libs/map-core/map-dataset/src/
  locale/locale.en.ts             # MAP_DATASET_LOCALE_EN
  attribute-table/locale/locale.en.ts

libs/map-core/map-draw/src/locale/
  draw.en.ts / draw.vi.ts         # control slices
  locale.en.ts / locale.vi.ts     # MAP_DRAW_LOCALE_*
  index.ts                        # → draw.en
```

Do **not** introduce `locale/en.ts` / `locale/vi.ts` or bare `index.vi.ts` for packs.
Do **not** put a new language’s strings only inside a Vue/React component.

## Adding a language (e.g. `fr`)

1. **Domain / shell / draw slices** — for every existing `locale.en.ts` / `shell.en.ts` /
   `draw.en.ts`, add the matching `*.fr.ts` with the **same dotted key tree**
   (`diffLocaleKeys(en, fr)`). Suffix exports: `*_LOCALE_FR` (EN may stay unsuffixed).
2. **Aggregate pack** — add `locale/locale.fr.ts` exporting `MAP_*_LOCALE_FR` by
   `deepMergeLocale`-reducing the same slice order as EN.
3. **Public export** — root `index.ts`: `export { MAP_*_LOCALE_FR } from './locale/locale.fr'`.
4. **Register** — `MAP_BUILTIN_LANGUAGES` / `LanguageControl` `languages` +
   `locales.fr` (and dataset/draw packs if the app uses those packages).
5. **Parity test** — `diffLocaleKeys(MAP_*_LOCALE_EN, MAP_*_LOCALE_FR)` empty
   `missingInA` / `missingInB`.
6. **SemVer** — new built-in language pack = **minor**; renaming/removing keys = **major**.

## Runtime vs fixed packs

| Concern | API |
|---------|-----|
| Built-in catalogs | `locale/locale.<lang>.ts` → `registerLocale` / LanguageControl `locales` |
| App override / extra lang | `registerLocale`, `loadLocale`, `setLanguage`, `setTranslate` |
| Key helpers | `deepMergeLocale`, `flattenLocaleMessages`, `diffLocaleKeys` |

Apps may load extra languages at runtime; **library-owned** strings still land in
`locale/locale.<lang>.ts` (+ `<domain>/locale/locale.<lang>.ts`) first.

## Editing strings

- Change EN in `locale.en.ts` / `shell.en.ts` / `draw.en.ts`, then mirror every other
  `*.<lang>.ts` for the same keys.
- Prefer editing the **domain slice**, not pasting into the aggregate pack
  (packs only merge).
- Dataset/draw may keep a monolithic `locale/locale.vi.ts` until domain
  `locale/locale.vi.ts` slices exist; when splitting, match core’s slice pattern.

## Docs / demos

- Stable API / `extra-lang` docs list `MAP_*_LOCALE_EN` / `MAP_*_LOCALE_VI`.
- Demo LanguageControl: pass dataset/draw packs via `locales.en` / `locales.vi`.
- See also: `map-dual-framework`, `map-semver-api`, `map-testing`.

## Demo apps (required)

- Mount **LanguageControl** (or shared `DemoLanguageControl`) on **every** demo `<Map>`.
- **`defaultLanguage: 'vi'`** for demos (library store fallback may stay `en`).
- Demo guides / help panels: always ship **EN + VI** via `guideI18n({ en, vi })` / `helpI18n(en, vi)` in `@hungpvq/demo-map-datasets`. Do not add EN-only guides.
- `DemoHelpPanel` resolves copy from map language (fallback `vi`).
