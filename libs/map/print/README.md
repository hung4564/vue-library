# Map Print

> Vue.js library for printing maps with customizable options

## 🚀 Introduction

Map Print is a Vue.js library that provides components for printing maps with customizable options. The library supports printing maps in different formats, custom layouts, and advanced printing options.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-print
```

```bash
yarn add @hungpvq/vue-map-print
```

## 🎯 Features

- ✅ **Print controls** - Easy-to-use print controls
- ✅ **Custom layouts** - Customizable print layouts
- ✅ **Multiple formats** - Support for various print formats
- ✅ **Print preview** - Preview before printing
- ✅ **Advanced options** - Advanced printing settings
- ✅ **Export support** - Export to PDF and images
- ✅ **TypeScript support** - Full TypeScript support
- ✅ **Vue 3 Composition API** - Modern Vue 3 Composition API

## 🚀 Basic Usage

### Basic Print Control

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <PrintControl />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { PrintControl } from '@hungpvq/vue-map-print';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-print/style.css';

function onMapLoaded(map: any) {
  console.log('Map loaded:', map);
}
</script>
```

## 📚 API Reference

### PrintControl Component

#### Props

| Prop             | Type       | Default       | Description        |
| ---------------- | ---------- | ------------- | ------------------ |
| `mapId`          | `string`   | `''`          | Map identifier     |
| `position`       | `Position` | `'top-right'` | Control position   |
| `controlVisible` | `boolean`  | `true`        | Control visibility |

#### Events

| Event            | Payload       | Description                      |
| ---------------- | ------------- | -------------------------------- |
| `print-start`    | -             | Fired when printing starts       |
| `print-complete` | `PrintResult` | Fired when printing completes    |
| `print-error`    | `Error`       | Fired when printing error occurs |

### PrintAdvancedControl Component

#### Props

| Prop             | Type       | Default       | Description        |
| ---------------- | ---------- | ------------- | ------------------ |
| `mapId`          | `string`   | `''`          | Map identifier     |
| `position`       | `Position` | `'top-right'` | Control position   |
| `controlVisible` | `boolean`  | `true`        | Control visibility |

#### Events

| Event             | Payload         | Description                      |
| ----------------- | --------------- | -------------------------------- |
| `print-start`     | -               | Fired when printing starts       |
| `print-complete`  | `PrintResult`   | Fired when printing completes    |
| `print-error`     | `Error`         | Fired when printing error occurs |
| `settings-change` | `PrintSettings` | Fired when settings change       |

### Types

```typescript
interface PrintOptions {
  format?: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  scale?: 'auto' | string;
  includeLegend?: boolean;
  includeScale?: boolean;
  includeNorthArrow?: boolean;
  includeTitle?: boolean;
  includeDate?: boolean;
  includeCoordinates?: boolean;
  customTitle?: string;
  customFooter?: string;
}

interface PrintSettings extends PrintOptions {
  fileName?: string;
  dpi?: number;
  quality?: 'low' | 'medium' | 'high';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

interface PrintLayout {
  id: string;
  name: string;
  template: string;
  settings: {
    titlePosition?: 'top-left' | 'top-center' | 'top-right';
    v?: 'bottom-left' | 'bottom-center' | 'bottom-right';
    scalePosition?: 'bottom-left' | 'bottom-center' | 'bottom-right';
    northArrowPosition?: 'top-left' | 'top-center' | 'top-right';
  };
}

interface PrintTemplate {
  id: string;
  name: string;
  layout: {
    width: number;
    height: number;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  elements: PrintElement[];
}

interface PrintElement {
  type: 'title' | 'map' | 'legend' | 'scale' | 'northArrow' | 'text' | 'image';
  content?: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style?: Record<string, any>;
}

interface PrintResult {
  success: boolean;
  fileName?: string;
  fileSize?: number;
  format?: string;
  error?: string;
}
```

## 🤝 Contributing

All contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

## 🔗 Links

- **[GitHub Repository](https://github.com/hung4564/vue-library)**
- **[Documentation](./docs/)**
- **[Issues](https://github.com/hung4564/vue-library/issues)**
