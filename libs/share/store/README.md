# shared-store

Framework-agnostic store (`GlobalStoreService`, `defineStore`, Vue plugin).

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
  createStoreRegistryPlugin,
} from '@hungpvq/shared-store';
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
