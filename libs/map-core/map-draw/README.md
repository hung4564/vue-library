# Map Draw Library

The **Map Draw** library provides drawing and editing capabilities on top of the Map Core. It includes a `DrawService` for managing draw modes, an `InspectController` for feature inspection, and UI components for user interaction.

## Packages
- `@hungpvq/map-draw` – Core drawing service and utilities (framework‑agnostic).
- Vue and React adapters are exposed via `@hungpvq/vue-map-draw` and `@hungpvq/react-map-draw`.

## Documentation
- API reference: `libs/map-core/map-draw/docs/api.md`
- Usage guide: `libs/map-core/map-draw/docs/quick-start.md`
- Component reference: `libs/map-core/map-draw/docs/components/*.md`

## Development
```bash
npm run map:lint        # lint + type‑check map‑draw
npm run map:test        # run Vitest unit tests for map‑draw
npm run map:dev-vue     # serve Vue demo with draw features
npm run map:dev-react   # serve React demo with draw features
```

Add or update documentation as needed.
