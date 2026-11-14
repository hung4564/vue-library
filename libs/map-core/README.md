# Map Core Library

The **Map Core** library provides the framework‑agnostic foundation for interactive maps based on MapLibre GL. It includes three sub‑packages:

- **core** – Engine helpers, store, theme, locale, registry, workers.
- **map-dataset** – Dataset tree, builders, identify, style, GIS worker.
- **map-draw** – Drawing tools, `InspectController`, and related UI components.

## Documentation
- API reference lives in `libs/map-core/**/docs/` (e.g., `core/docs/core/`).
- Stable API description: `libs/map-core/core/docs/core/stable-api.md`.
- Quick start guide: `libs/map-core/core/docs/core/minimal-starter.md`.

## Usage
```bash
npm install @hungpvq/map-core @hungpvq/map-dataset @hungpvq/map-draw
```
Import from the core package and use adapters (Vue/React) for UI components.

## Development
Run lint, type‑check, and tests with Nx:
```bash
npm run map:lint   # lint + type‑check
npm run map:test   # run Vitest unit tests
npm run map:dev-vue   # serve Vue demo
```
