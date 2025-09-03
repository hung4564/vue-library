# Map Legend

> Vue.js library for creating and managing map legends with high customization capabilities

## 🚀 Introduction

Map Legend is a powerful Vue.js library for creating and managing map legends. The library supports various legend types, from simple legends to complex interactive and highly customizable legends.

## 📦 Installation

```bash
npm install @hungpvq/vue-map-legend
```

```bash
yarn add @hungpvq/vue-map-legend
```

## 🎯 Features

- ✅ **Multiple legend types** - Support for various legend types
- ✅ **Interactive legends** - Interactive legends
- ✅ **Customizable styling** - Customizable interface
- ✅ **Layer integration** - Integration with layers
- ✅ **Responsive design** - Responsive design
- ✅ **TypeScript support** - Full TypeScript support
- ✅ **Vue 3 Composition API** - Uses Composition API

## 🚀 Basic Usage

### Basic Legend

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <LegendControl />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-legend';

function onMapLoaded(map: any) {
  console.log('Map loaded:', map);
}
</script>
```

### Categorized Legend

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <Legend :categories="legendCategories" title="Categorized Legend" @category-toggle="handleCategoryToggle" @item-toggle="handleItemToggle" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Legend } from '@hungpvq/vue-map-legend';

const legendCategories = ref([
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    expanded: true,
    items: [
      {
        id: 'highways',
        label: 'Highways',
        type: 'line',
        color: '#e74c3c',
        width: 4,
      },
      {
        id: 'streets',
        label: 'Streets',
        type: 'line',
        color: '#95a5a6',
        width: 2,
      },
    ],
  },
  {
    id: 'landuse',
    label: 'Land Use',
    expanded: false,
    items: [
      {
        id: 'residential',
        label: 'Residential',
        type: 'polygon',
        fillColor: '#f39c12',
        strokeColor: '#e67e22',
      },
      {
        id: 'commercial',
        label: 'Commercial',
        type: 'polygon',
        fillColor: '#9b59b6',
        strokeColor: '#8e44ad',
      },
    ],
  },
]);

function handleCategoryToggle(categoryId: string, expanded: boolean) {
  const category = legendCategories.value.find((c) => c.id === categoryId);
  if (category) {
    category.expanded = expanded;
  }
}

function handleItemToggle(itemId: string, visible: boolean) {
  // Find and toggle item visibility
  legendCategories.value.forEach((category) => {
    const item = category.items.find((i) => i.id === itemId);
    if (item) {
      item.visible = visible;
    }
  });
}
</script>
```

### Gradient Legend

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <Legend :gradient="gradientLegend" title="Population Density" type="gradient" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Legend } from '@hungpvq/vue-map-legend';

const gradientLegend = ref({
  type: 'gradient',
  colors: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'],
  labels: ['0', '100', '500', '1000', '5000', '10000+'],
  unit: 'people/km²',
  min: 0,
  max: 10000,
});
</script>
```

## 📚 API Reference

### Legend Component

#### Props

| Prop          | Type                                                           | Default       | Description            |
| ------------- | -------------------------------------------------------------- | ------------- | ---------------------- |
| `items`       | `LegendItem[]`                                                 | `[]`          | Danh sách legend items |
| `categories`  | `LegendCategory[]`                                             | `[]`          | Danh sách categories   |
| `gradient`    | `GradientLegend`                                               | `null`        | Gradient legend config |
| `title`       | `string`                                                       | `''`          | Tiêu đề legend         |
| `type`        | `'simple' \| 'categorized' \| 'gradient'`                      | `'simple'`    | Loại legend            |
| `collapsible` | `boolean`                                                      | `true`        | Có thể thu gọn         |
| `position`    | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Vị trí legend          |

#### Events

| Event             | Payload                           | Description              |
| ----------------- | --------------------------------- | ------------------------ |
| `item-click`      | `LegendItem`                      | Khi item được click      |
| `item-toggle`     | `{id: string, visible: boolean}`  | Khi item được toggle     |
| `category-toggle` | `{id: string, expanded: boolean}` | Khi category được toggle |

### LegendItem Interface

```typescript
interface LegendItem {
  id: string;
  label: string;
  type: 'point' | 'line' | 'polygon' | 'raster';
  color?: string;
  fillColor?: string;
  strokeColor?: string;
  size?: number;
  width?: number;
  visible: boolean;
  icon?: string;
  description?: string;
}
```

### LegendCategory Interface

```typescript
interface LegendCategory {
  id: string;
  label: string;
  expanded: boolean;
  items: LegendItem[];
  visible: boolean;
}
```

### GradientLegend Interface

```typescript
interface GradientLegend {
  type: 'gradient';
  colors: string[];
  labels: string[];
  unit?: string;
  min: number;
  max: number;
  direction?: 'vertical' | 'horizontal';
}
```

## 🔧 Advanced Usage

### Dynamic Legend

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <Legend :items="dynamicLegendItems" :title="legendTitle" @item-click="handleLegendItemClick" />
  </Map>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Legend } from '@hungpvq/vue-map-legend';

const activeLayers = ref(['cities', 'roads']);
const allLayers = ref([
  { id: 'cities', name: 'Cities', type: 'point', color: '#ff6b6b' },
  { id: 'roads', name: 'Roads', type: 'line', color: '#4ecdc4' },
  { id: 'parks', name: 'Parks', type: 'polygon', fillColor: '#45b7d1' },
]);

const dynamicLegendItems = computed(() => {
  return allLayers.value
    .filter((layer) => activeLayers.value.includes(layer.id))
    .map((layer) => ({
      ...layer,
      visible: true,
    }));
});

const legendTitle = computed(() => {
  return `Active Layers (${activeLayers.value.length})`;
});

function handleLegendItemClick(item: any) {
  // Remove from active layers
  const index = activeLayers.value.indexOf(item.id);
  if (index > -1) {
    activeLayers.value.splice(index, 1);
  }
}
</script>
```

### Custom Legend Styling

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <Legend :items="legendItems" title="Custom Legend" class="custom-legend" />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Legend } from '@hungpvq/vue-map-legend';

const legendItems = ref([
  {
    id: 'custom-item',
    label: 'Custom Item',
    type: 'point',
    color: '#ff6b6b',
    size: 12,
    visible: true,
    icon: 'custom-icon',
  },
]);
</script>

<style>
.custom-legend {
  --legend-bg: #2c3e50;
  --legend-text: #ecf0f1;
  --legend-border: #34495e;
  --legend-item-hover: #3498db;
  --legend-item-active: #e74c3c;
}

.custom-legend .legend-item {
  border-radius: 6px;
  margin: 4px 0;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.custom-legend .legend-item:hover {
  background-color: var(--legend-item-hover);
  transform: translateX(4px);
}

.custom-legend .legend-symbol {
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
```

### Legend with Statistics

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <Legend :items="legendWithStats" title="Legend with Statistics" show-stats />
  </Map>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Legend } from '@hungpvq/vue-map-legend';

const legendWithStats = ref([
  {
    id: 'cities',
    label: 'Cities',
    type: 'point',
    color: '#ff6b6b',
    size: 8,
    visible: true,
    stats: {
      count: 150,
      area: '2,500 km²',
      population: '8.5M',
    },
  },
  {
    id: 'roads',
    label: 'Road Network',
    type: 'line',
    color: '#4ecdc4',
    width: 3,
    visible: true,
    stats: {
      length: '1,200 km',
      density: '0.48 km/km²',
    },
  },
]);
</script>
```

## 🎨 Styling và Theming

### CSS Variables

```css
:root {
  --legend-bg: #ffffff;
  --legend-text: #333333;
  --legend-border: #e5e5e5;
  --legend-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --legend-item-bg: #f8f9fa;
  --legend-item-hover: #e9ecef;
  --legend-item-active: #007bff;
  --legend-symbol-size: 16px;
  --legend-symbol-border: #dee2e6;
}
```

### Responsive Legend

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <Legend :items="legendItems" :position="legendPosition" :collapsible="isMobile" class="responsive-legend" />
  </Map>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Legend } from '@hungpvq/vue-map-legend';

const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);
const legendPosition = computed(() => (isMobile.value ? 'bottom-right' : 'top-right'));

function updateWindowWidth() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});
</script>

<style>
.responsive-legend {
  max-width: 300px;
}

@media (max-width: 768px) {
  .responsive-legend {
    max-width: 250px;
    font-size: 14px;
  }

  .responsive-legend .legend-symbol {
    width: 12px;
    height: 12px;
  }
}
</style>
```

## 🔗 Integration với Layers

### Auto-generate Legend from Layers

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLegendGenerator } from '@hungpvq/vue-map-legend';

const { generateLegendFromLayers } = useLegendGenerator();

const layers = ref([
  {
    id: 'cities',
    name: 'Cities',
    type: 'geojson',
    style: {
      'circle-color': '#ff6b6b',
      'circle-radius': 8,
    },
  },
  {
    id: 'roads',
    name: 'Roads',
    type: 'geojson',
    style: {
      'line-color': '#4ecdc4',
      'line-width': 3,
    },
  },
]);

const autoLegend = computed(() => {
  return generateLegendFromLayers(layers.value);
});
</script>
```

## 🧪 Testing

```bash
# Chạy tests
nx test map-legend

# Chạy tests với coverage
nx test map-legend --coverage
```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem [LICENSE](../../LICENSE) để biết thêm chi tiết.

## 🔗 Liên kết

- **[GitHub Repository](https://github.com/hung4564/vue-library)**
- **[Documentation](./docs/)**
- **[Issues](https://github.com/hung4564/vue-library/issues)**
