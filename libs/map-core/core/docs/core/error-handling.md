# Error handling

Centralized errors live in **`@hungpvq/map-core`**. Vue / React adapters do **not** re-export `errorHandler` (and do not ship a separate `handleError` helper).

## Default behavior

The singleton `errorHandler` already logs through `@hungpvq/shared-log` (`map:core` → `ErrorHandler`):

- **Development** — `logError` (structured error log)
- **Production** — `logToService` (default warn that no external service is wired)

`isDevelopment` is detected from Vite `import.meta.env` / `NODE_ENV`.

## Usage

```ts
import {
  errorHandler,
  MapError,
  MapInitializationError,
} from '@hungpvq/map-core';

errorHandler.handle(new Error('Something went wrong'), { mapId: 'map-1' });

const off = errorHandler.onError((error: MapError) => {
  // Devtools Errors tab, toasts, etc.
});
```

Map shell (`useMapInstance`) already calls `errorHandler.handle` on init / map failures.

## Optional app configuration

Override logging (e.g. Sentry) without replacing the singleton:

```ts
import { errorHandler } from '@hungpvq/map-core';

errorHandler.configure({
  logToService: (error) => {
    // Send to your tracking service
  },
});
```

Or create a custom `MapErrorHandler` instance if you need an isolated handler (advanced).

## Devtools

[`vue-map-devtools` / `react-map-devtools`](./devtools.md) subscribe to the same `errorHandler` for the Errors tab.

See also [Stable API](./stable-api.md) · [Map store](./map-store.md) · package README ErrorHandler section.
