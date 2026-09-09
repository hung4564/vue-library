# @hungpvq/react-map-core

React MapLibre map container, controls, and hooks over `@hungpvq/map-core`.

## Install

```bash
npm install @hungpvq/react-map-core @hungpvq/map-core
```

## Styles

```ts
import '@hungpvq/react-map-core/style.css';
```

## Usage

```tsx
import { Map, ZoomControl, HomeControl, FullScreenControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

export function App() {
  return (
    <Map
      mapId="demo"
      onMapLoaded={(map) => {
        console.info('loaded', map);
      }}
    >
      <ZoomControl position="top-right" />
      <HomeControl position="top-right" />
      <FullScreenControl position="top-right" />
    </Map>
  );
}
```

For layers / identify / menus, use `@hungpvq/react-map-dataset` and call `createDatasetRegistryPlugin().install()` at bootstrap.

## Docs

- Hub: [map docs](../../map-core/core/docs/index.md)
- Controls & registry: [map-core docs](../../map-core/core/docs/core/index.md)
- Stable API: [stable-api.md](../../map-core/core/docs/core/stable-api.md)
- Error handling (`errorHandler` from `@hungpvq/map-core`): [error-handling.md](../../map-core/core/docs/core/error-handling.md)
- Demo: [React demo](https://hung4564.github.io/demo-map/react/)
