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

Centralized error handler for map operations.

```typescript
import { errorHandler, MapErrorHandler } from '@hungpvq/map-core';

// Use default singleton
errorHandler.handle(new Error('Something went wrong'), {
  mapId: 'map-1',
});

// Subscribe to errors
const unsubscribe = errorHandler.onError((error: MapError) => {
  console.error('Error occurred:', error);
});

// Create custom instance
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

```typescript
import { MapErrorHandler } from '@hungpvq/map-core';

const customHandler = new MapErrorHandler({
  isDevelopment: process.env.NODE_ENV === 'development',
  logError: (error) => {
    // Custom development logging
    console.log('[DEV]', error);
  },
  logToService: (error) => {
    // Send to Sentry, LogRocket, etc.
    Sentry.captureException(error);
  },
});

customHandler.handle(new Error('Something went wrong'));
```

## 🤝 Contributing

This is an extracted core library from `@hungpvq/vue-map-core`. Changes should maintain framework-agnostic nature.

## 📄 License

MIT License

## 🔗 Related Packages

- `@hungpvq/vue-map-core` - Vue implementation
- `@hungpvq/react-map-core` - React implementation (coming soon)
