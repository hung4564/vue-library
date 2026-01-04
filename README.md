# VueLibrary

> A powerful Vue.js library collection for building interactive map applications and modern UI components

## 🚀 Introduction

VueLibrary is a monorepo containing Vue.js libraries designed to build interactive map applications and modern user interface components. The project is built with Nx and TypeScript, providing complete solutions for:

- **Interactive maps** with MapLibre GL
- **Drag and drop interactions** with components
- **Data management** and visualization
- **Shared utilities** for Vue.js

## 📦 Main Libraries

### 🗺️ Map Libraries

- **[@hungpvq/vue-map-core](./libs/map/core/)** - Core map functionality and components
- **[@hungpvq/vue-map-basemap](./libs/map/basemap/)** - Base map controls and switching
- **[@hungpvq/vue-map-draw](./libs/map/draw/)** - Drawing and editing tools
- **[@hungpvq/vue-map-measurement](./libs/map/measurement/)** - Distance and area measurement tools
- **[@hungpvq/vue-map-print](./libs/map/print/)** - Map printing functionality
- **[@hungpvq/vue-map-dataset](./libs/map/dataset/)** - Dataset management and visualization
- **[@hungpvq/vue-map-legend](./libs/map/legend/)** - Legend components

### 🎯 UI Libraries

- **[@hungpvq/vue-draggable](./libs/draggable/)** - Draggable components
- **[@hungpvq/content-menu](./libs/content-menu/)** - Context menu

### 🔧 Shared Libraries

- **[@hungpvq/shared](./libs/share/shared/)** - Shared utilities
- **[@hungpvq/shared-core](./libs/share/core/)** - Core shared functions
- **[@hungpvq/shared-file](./libs/share/file/)** - File utilities
- **[@hungpvq/shared-store](./libs/share/store/)** - Store utilities
- **[@hungpvq/shared-log](./libs/share/log/)** - Logging utilities

## 🛠️ Installation

### Install the entire project

```bash
# Clone repository
git clone https://github.com/hung4564/vue-library.git
cd vue-library

# Install dependencies
npm install

# Build all libraries
npm run build
```

### Install individual libraries

```bash
# Map libraries
npm install @hungpvq/vue-map-core
npm install @hungpvq/vue-map-basemap
npm install @hungpvq/vue-map-draw
npm install @hungpvq/vue-map-measurement
npm install @hungpvq/vue-map-print
npm install @hungpvq/vue-map-dataset
npm install @hungpvq/vue-map-legend

# UI libraries
npm install @hungpvq/vue-draggable
npm install @hungpvq/content-menu

# Shared libraries
npm install @hungpvq/shared
npm install @hungpvq/shared-core
npm install @hungpvq/shared-file
npm install @hungpvq/shared-store
```

## 🚀 Quick Start

### Basic Map Component

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <BaseMapControl position="bottom-left" />
    <DrawControl position="top-right" />
    <MeasurementControl position="top-right" />
    <PrintControl />
  </Map>
</template>

<script setup>
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
import { DrawControl } from '@hungpvq/vue-map-draw';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { PrintControl } from '@hungpvq/vue-map-print';
import '@hungpvq/vue-map-core/style.css';
</script>
```

### Advanced Map with Dataset Management

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <DatasetControl position="top-left" show />
    <LayerControl position="top-left" show />
    <BaseMapControl position="bottom-left" />
    <DrawControl position="top-right" />
    <MeasurementControl position="top-right" />
    <PrintAdvancedControl />
  </Map>
</template>

<script setup>
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
import { DrawControl } from '@hungpvq/vue-map-draw';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { PrintAdvancedControl } from '@hungpvq/vue-map-print';
import { DatasetControl, LayerControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
</script>
```

## 📚 Documentation

- **[Documentation](./docs/)** - Detailed documentation
- **[Demos](./apps/)** - Demo applications

## 🏗️ Development

### Available Scripts

```bash
# Development
npm run docs:dev          # Run docs development server
npm run map:dev           # Build map libraries

# Testing
npm run lint              # Lint code
npm run ts-check          # TypeScript check

# Release
npm run map:release       # Release map libraries
npm run share:release     # Release shared libraries
```

### Project Structure

```
vue-library/
├── apps/                 # Demo applications
├── libs/                 # Libraries
│   ├── map/             # Map-related libraries
│   ├── share/           # Shared utilities
```

## 👨‍💻 Author

**hung.pv** - [GitHub](https://github.com/hung4564)

---

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/hung4564/vue-library/issues)
- **Repository**: [GitHub Repository](https://github.com/hung4564/vue-library)

## Idea

- [x] Introduce a new `dataset` type: **`data-management`**

  - This dataset type supports **CRUD operations** (create, read, update, delete).

- [ ] Provide templates for `data-management` datasets:

  - [ ] **Local template** – handles local data sources in:
    - [x] **GeoJSON format**, or
    - [ ] **List-based format** (which may or may not be convertible to GeoJSON).
  - [ ] **API template** – handles data through remote APIs, supporting responses in:
    - [x] **GeoJSON format**, or
    - [ ] **List-based format** (which may or may not be convertible to GeoJSON).

- [ ] Extend **DrawControl**
  - [] with a **Draft mechanism**:
    - [x] Enables temporary drawing and editing before committing changes.
    - [x] Allows **external customization** to adapt Draft behavior to different workflows or integrations.
  - [ ] support default draw
    - draw normal
    - download
