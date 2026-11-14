# Shared Utilities

The `share` folder contains a collection of reusable utility packages that are consumed by the map and draggable libraries.

## Packages
- **@hungpvq/shared** – General purpose helpers.
- **@hungpvq/shared-core** – Core functions used across the monorepo.
- **@hungpvq/shared-file** – File system utilities for the browser and Node.
- **@hungpvq/shared-store** – Store utilities for global state management.
- **@hungpvq/shared-log** – Logging utilities and devtools integration.

## Documentation
Each sub‑package has its own `docs/` directory with API reference and usage examples.

## Development
```bash
npm run share:lint      # lint + type‑check shared packages
npm run share:test      # run Vitest unit tests for shared utilities
```