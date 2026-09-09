# @hungpvq/map-core

> Framework-agnostic core library for map operations - reusable for Vue, React, and other frameworks

## 🚀 Introduction

This is the core vanilla JavaScript/TypeScript library extracted from `@hungpvq/vue-map-core`. It contains framework-agnostic logic that can be reused across Vue, React, Angular, and other frameworks.

## 📦 Installation

```bash
npm install @hungpvq/map-core
```

```bash
yarn add @hungpvq/map-core
```

## 🎯 Features

- ✅ **Error Classes** - MapError, MapInitializationError, MapEventError
- ✅ **Error Handler** - Centralized error handling system
- ✅ **Utilities** - Color utilities and helper functions
- ✅ **Base Model** - Base class for map-related entities
- ✅ **Types** - Framework-agnostic TypeScript types
- ✅ **Framework-agnostic** - Pure JavaScript/TypeScript, no framework dependencies

## 📚 API Reference

### Errors

#### MapError

Base error class for all map-related errors.

```typescript
import { MapError } from '@hungpvq/map-core';

const error = new MapError('Something went wrong', 'ERROR_CODE', {
  context: { mapId: 'map-1' },
  recoverable: true,
  cause: originalError,
});
```

#### MapInitializationError

Error thrown when map initialization fails.

```typescript
import { MapInitializationError } from '@hungpvq/map-core';

throw new MapInitializationError('Failed to initialize map', {
  context: { mapId: 'map-1' },
  cause: originalError,
});
```

#### MapEventError

Error thrown when map events fail.

```typescript
import { MapEventError } from '@hungpvq/map-core';

throw new MapEventError('Map event failed', {
  context: { event: 'click' },
  cause: originalError,
});
```

### Services

#### ErrorHandler

Centralized error handler for map operations. The singleton already logs via `@hungpvq/shared-log` (`map:core` / `ErrorHandler`). Adapters do not re-export it — import from `@hungpvq/map-core` only. Docs: [error-handling.md](./docs/core/error-handling.md).

```typescript
import { errorHandler, MapErrorHandler } from '@hungpvq/map-core';

// Default singleton (built-in logger)
errorHandler.handle(new Error('Something went wrong'), {
  mapId: 'map-1',
});

// Subscribe to errors (e.g. Devtools Errors tab)
const unsubscribe = errorHandler.onError((error: MapError) => {
  console.error('Error occurred:', error);
});

// Optional: wire production tracking on the singleton
errorHandler.configure({
  logToService: (error) => {
    // Send to Sentry, LogRocket, etc.
  },
});

// Or create an isolated custom instance
const customHandler = new MapErrorHandler({
  isDevelopment: false,
  logError: (error) => {
    // Custom logging
  },
  logToService: (error) => {
    // Send to error tracking service
  },
});
```

### Utils

#### Color Utilities

```typescript
import { getChartRandomColor, Color } from '@hungpvq/map-core';

const randomColor: Color = getChartRandomColor();
```

### Model

#### Base Class

```typescript
import { Base } from '@hungpvq/map-core';

class MyMapEntity extends Base {
  // Automatically gets unique ID
}

const entity = new MyMapEntity();
console.log(entity.id); // Unique ID
```

### Types

```typescript
import type { Position, WithMapPropType } from '@hungpvq/map-core';

const position: Position = 'top-right';

const props: WithMapPropType = {
  mapId: 'map-1',
  position: 'top-right',
  controlVisible: true,
  // ...
};
```

## 🔧 Usage Examples

### Error Handling

```typescript
import { errorHandler, MapInitializationError, MapError } from '@hungpvq/map-core';

try {
  // Map initialization logic
} catch (error) {
  const mapError = new MapInitializationError('Failed to initialize map', {
    context: { mapId: 'map-1' },
    cause: error,
  });

  errorHandler.handle(mapError);
}

// Subscribe to errors
errorHandler.onError((error: MapError) => {
  // Handle error globally
  console.error('Map error:', error.code, error.message);
});
```

### Custom Error Handler

Prefer `errorHandler.configure({ logToService })` on the singleton so Devtools and map shell share the same handler. Use `new MapErrorHandler({ … })` only when you need an isolated instance.

```typescript
import { errorHandler } from '@hungpvq/map-core';

errorHandler.configure({
  logToService: (error) => {
    Sentry.captureException(error);
  },
});
```

## 🧪 Testing

Unit tests live next to sources as `*.spec.ts` and run with Vitest (`environment: 'node'`). Cover behavioral domains (utils, store/services, toolbar/menu, workers, MapLibre fakes) — not line-by-line.

**Out of unit scope:** full interactive draw UX, real Worker threads, canvas screenshot fidelity, and SCSS.

```bash
npx nx test @hungpvq/map-core
```

## 🤝 Contributing

This is an extracted core library from `@hungpvq/vue-map-core`. Changes should maintain framework-agnostic nature.

## 📄 License

MIT License

## 🔗 Related Packages

- `@hungpvq/vue-map-core` - Vue implementation
- `@hungpvq/react-map-core` - React implementation
- `@hungpvq/map-dataset` - Dataset tree, builders, identify
- Docs hub: [docs/index.md](./docs/index.md) · [Stable API](./docs/core/stable-api.md)
