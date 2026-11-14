# Vue Adapters Library

The Vue adapters expose framework‑specific components and hooks that wrap the framework‑agnostic core libraries.

## Packages
- `@hungpvq/vue-map-core` – Map container, controls, and hooks (`useMap`, `useMapState`).
- `@hungpvq/vue-map-dataset` – Dataset UI and hooks.
- `@hungpvq/vue-map-draw` – Draw / edit UI.
- `@hungpvq/vue-map-devtools` – Debug panel.
- `@hungpvq/vue-draggable` – Vue draggable container and items.

## Documentation
Each package contains a `docs/` folder with:
- API reference (`api.md`)
- Usage guides (`quick-start.md`, `minimal-starter.md`)
- Component reference (`components/*.md`)

## Development
```bash
npm run vue:lint      # lint + type‑check Vue packages
npm run vue:test      # run Vitest unit tests for Vue adapters
npm run vue:dev-vue   # serve Vue demo app
```

Add or update documentation here as needed.
