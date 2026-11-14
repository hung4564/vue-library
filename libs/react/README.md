# React Adapters Library

The React adapters expose framework‑specific components and hooks that wrap the framework‑agnostic core libraries.

## Packages
- `@hungpvq/react-map-core` – Map container, controls, and hooks (`useMap`, `useMapState`).
- `@hungpvq/react-map-dataset` – Dataset UI and hooks.
- `@hungpvq/react-map-draw` – Draw / edit UI.
- `@hungpvq/react-map-devtools` – Debug panel.
- `@hungpvq/react-draggable` – React draggable container and items.

## Documentation
Each package contains a `docs/` folder with:
- API reference (`api.md`)
- Usage guides (`quick-start.md`, `minimal-starter.md`)
- Component reference (`components/*.md`)

## Development
```bash
npm run react:lint      # lint + type‑check React packages
npm run react:test      # run Vitest unit tests for React adapters
npm run react:dev-react # serve React demo app
```

Add or update documentation here as needed.
