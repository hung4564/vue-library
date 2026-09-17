# shared-store

Framework-agnostic process store (`GlobalStoreService`, `defineStore`, `getOrCreateStore`, Vue plugin).

**Stable API:** [docs/stable-api.md](./docs/stable-api.md) (locked by `public-api.spec.ts`).

**SoT:** all app / process stores use this package only — `getOrCreateStore` / `defineStore` / `GlobalStoreService`. Backing bag is `globalThis.$_hungpv_store` (browser + SSR Node, **process-wide**; not per-request ALS). Do not use `@hungpvq/shared` for stores.

## Install

```bash
npm install @hungpvq/shared-store
```

## Usage

### Core (Vue / any framework — no React)

```ts
import {
  GlobalStoreService,
  defineStore,
  getOrCreateStore,
  createStoreRegistryPlugin,
} from '@hungpvq/shared-store';

// Eager singleton (services, class statics)
const errorHandler = getOrCreateStore('my:errorHandler', () => createHandler());

// Lazy getter (hooks / modules)
const useMyStore = defineStore('my:domain', () => ({ count: 0 }));
```

### React hooks

Import from the React entry so Vue apps never resolve `react`:

```ts
import {
  useStoreValue,
  useStoreSubscribe,
  defineStoreReact,
} from '@hungpvq/shared-store/react';
```

## Building

Run `nx build shared-store` to build the library.

## Running unit tests

Run `nx test shared-store` to execute the unit tests via [Jest](https://jestjs.io).
