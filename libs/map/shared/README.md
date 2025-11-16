# Map Shared

> Thư viện Vue.js cung cấp các utilities và types chung cho các thư viện map

## 🚀 Giới thiệu

Map Shared là một thư viện Vue.js cung cấp các utilities, types, và constants chung được sử dụng trong các thư viện map. Thư viện bao gồm các tính năng như map utilities, coordinate transformations, và các types chung.

## 📦 Cài đặt

```bash
npm install @hungpvq/vue-map-shared
```

```bash
yarn add @hungpvq/vue-map-shared
```

## 🎯 Tính năng

- ✅ **Map utilities** - Các tiện ích cho map
- ✅ **Coordinate transformations** - Chuyển đổi tọa độ
- ✅ **Common types** - Các types chung
- ✅ **Constants** - Các hằng số
- ✅ **Helper functions** - Các hàm helper
- ✅ **TypeScript support** - Hỗ trợ TypeScript đầy đủ
- ✅ **Vue 3 Composition API** - Sử dụng Composition API

## 🚀 Sử dụng cơ bản

### Map Utilities

```vue
<script setup lang="ts">
import { useMapUtils, useCoordinateTransform, useMapConstants } from '@hungpvq/vue-map-shared';

// Map utilities
const { calculateDistance, calculateBearing, isPointInBounds, formatCoordinate } = useMapUtils();

// Coordinate transformation
const { transformCoordinate, transformBounds, getProjection } = useCoordinateTransform();

// Map constants
const { DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, DEFAULT_CENTER } = useMapConstants();

// Sử dụng utilities
function handleMapClick(event: any) {
  const point = event.lngLat;

  // Format coordinate
  const formatted = formatCoordinate(point, 'DD');
  console.info('Formatted coordinate:', formatted);

  // Calculate distance from center
  const distance = calculateDistance(DEFAULT_CENTER, point);
  console.info('Distance from center:', distance, 'meters');

  // Calculate bearing
  const bearing = calculateBearing(DEFAULT_CENTER, point);
  console.info('Bearing:', bearing, 'degrees');
}

// Transform coordinates
function transformPoint() {
  const wgs84Point = [105.8342, 21.0285]; // Hanoi
  const utmPoint = transformCoordinate(wgs84Point, 'EPSG:4326', 'EPSG:32648');
  console.info('UTM coordinate:', utmPoint);
}
</script>
```

### Coordinate Systems

```vue
<script setup lang="ts">
import { useCoordinateSystem, CoordinateSystem, ProjectionType } from '@hungpvq/vue-map-shared';

const { getSupportedProjections, getProjectionInfo, convertBetweenSystems } = useCoordinateSystem();

// Lấy danh sách projections hỗ trợ
const supportedProjections = getSupportedProjections();

// Thông tin projection
const wgs84Info = getProjectionInfo('EPSG:4326');
const utmInfo = getProjectionInfo('EPSG:32648');

// Chuyển đổi giữa các hệ tọa độ
function convertCoordinates() {
  const wgs84Point = [105.8342, 21.0285]; // Hanoi in WGS84

  // Chuyển sang UTM
  const utmPoint = convertBetweenSystems(wgs84Point, 'EPSG:4326', 'EPSG:32648');

  // Chuyển sang Web Mercator
  const webMercatorPoint = convertBetweenSystems(wgs84Point, 'EPSG:4326', 'EPSG:3857');

  console.info('WGS84:', wgs84Point);
  console.info('UTM:', utmPoint);
  console.info('Web Mercator:', webMercatorPoint);
}
</script>
```

### Map Bounds and Extents

```vue
<script setup lang="ts">
import { useMapBounds, useMapExtent } from '@hungpvq/vue-map-shared';

const { createBounds, expandBounds, isBoundsValid, getBoundsCenter, getBoundsArea } = useMapBounds();

const { createExtent, expandExtent, isExtentValid, getExtentCenter } = useMapExtent();

// Tạo bounds
function createMapBounds() {
  const bounds = createBounds([
    [105.0, 20.0], // Southwest
    [106.0, 22.0], // Northeast
  ]);

  console.info('Bounds center:', getBoundsCenter(bounds));
  console.info('Bounds area:', getBoundsArea(bounds));
  console.info('Is valid:', isBoundsValid(bounds));

  // Mở rộng bounds
  const expandedBounds = expandBounds(bounds, 0.1); // 10% buffer
  console.info('Expanded bounds:', expandedBounds);
}

// Tạo extent
function createMapExtent() {
  const extent = createExtent(105.0, 20.0, 106.0, 22.0);

  console.info('Extent center:', getExtentCenter(extent));
  console.info('Is valid:', isExtentValid(extent));
}
</script>
```

## 📚 API Reference

### useMapUtils()

Composable cung cấp các utilities cho map.

```typescript
function useMapUtils(): {
  calculateDistance: (point1: [number, number], point2: [number, number]) => number;
  calculateBearing: (point1: [number, number], point2: [number, number]) => number;
  isPointInBounds: (point: [number, number], bounds: Bounds) => boolean;
  formatCoordinate: (point: [number, number], format: 'DD' | 'DMS' | 'UTM') => string;
  normalizeLongitude: (lng: number) => number;
  normalizeLatitude: (lat: number) => number;
};
```

### useCoordinateTransform()

Composable để chuyển đổi tọa độ.

```typescript
function useCoordinateTransform(): {
  transformCoordinate: (point: [number, number], from: string, to: string) => [number, number];
  transformBounds: (bounds: Bounds, from: string, to: string) => Bounds;
  getProjection: (code: string) => Projection;
  isProjectionSupported: (code: string) => boolean;
};
```

### useMapConstants()

Composable cung cấp các constants.

```typescript
function useMapConstants(): {
  DEFAULT_ZOOM: number;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  DEFAULT_CENTER: [number, number];
  EARTH_RADIUS: number;
  SUPPORTED_PROJECTIONS: string[];
};
```

### Types

```typescript
interface Bounds {
  southwest: [number, number];
  northeast: [number, number];
}

interface Extent {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface Projection {
  code: string;
  name: string;
  unit: string;
  bounds?: Bounds;
}

type CoordinateFormat = 'DD' | 'DMS' | 'UTM';
type ProjectionType = 'geographic' | 'projected';
```

## 🔧 Advanced Usage

### Custom Projection

```vue
<script setup lang="ts">
import { useCustomProjection, ProjectionDefinition } from '@hungpvq/vue-map-shared';

const { defineProjection, useProjection, transformWithCustomProjection } = useCustomProjection();

// Định nghĩa custom projection
const customProjection: ProjectionDefinition = {
  code: 'CUSTOM:12345',
  name: 'Custom Projection',
  unit: 'meters',
  definition: '+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs',
  bounds: {
    southwest: [105.0, 20.0],
    northeast: [106.0, 22.0],
  },
};

// Đăng ký projection
defineProjection(customProjection);

// Sử dụng projection
function useCustomProjection() {
  const point = [105.8342, 21.0285];
  const transformed = transformWithCustomProjection(point, 'EPSG:4326', 'CUSTOM:12345');

  console.info('Custom projection result:', transformed);
}
</script>
```

### Geodesic Calculations

```vue
<script setup lang="ts">
import { useGeodesicCalculations } from '@hungpvq/vue-map-shared';

const { calculateGeodesicDistance, calculateGeodesicBearing, calculateGeodesicDestination, calculateGeodesicMidpoint } = useGeodesicCalculations();

// Tính toán geodesic
function performGeodesicCalculations() {
  const point1: [number, number] = [105.8342, 21.0285]; // Hanoi
  const point2: [number, number] = [106.6297, 10.8231]; // Ho Chi Minh City

  // Khoảng cách geodesic
  const distance = calculateGeodesicDistance(point1, point2);
  console.info('Geodesic distance:', distance, 'meters');

  // Bearing geodesic
  const bearing = calculateGeodesicBearing(point1, point2);
  console.info('Geodesic bearing:', bearing, 'degrees');

  // Điểm đích từ bearing và distance
  const destination = calculateGeodesicDestination(point1, bearing, 100000); // 100km
  console.info('Destination point:', destination);

  // Điểm giữa
  const midpoint = calculateGeodesicMidpoint(point1, point2);
  console.info('Midpoint:', midpoint);
}
</script>
```

### Map Tile Utilities

```vue
<script setup lang="ts">
import { useMapTileUtils } from '@hungpvq/vue-map-shared';

const { getTileCoordinates, getTileBounds, getTileURL, getTileSize } = useMapTileUtils();

// Làm việc với map tiles
function workWithTiles() {
  const point: [number, number] = [105.8342, 21.0285];
  const zoom = 10;

  // Tọa độ tile
  const tileCoords = getTileCoordinates(point, zoom);
  console.info('Tile coordinates:', tileCoords);

  // Bounds của tile
  const tileBounds = getTileBounds(tileCoords, zoom);
  console.info('Tile bounds:', tileBounds);

  // URL của tile
  const tileURL = getTileURL(tileCoords, zoom, {
    baseURL: 'https://tile.openstreetmap.org',
    format: 'png',
  });
  console.info('Tile URL:', tileURL);

  // Kích thước tile
  const tileSize = getTileSize(zoom);
  console.info('Tile size:', tileSize);
}
</script>
```

## 🎨 Utility Functions

### Distance and Area Calculations

```vue
<script setup lang="ts">
import { useDistanceCalculations, useAreaCalculations } from '@hungpvq/vue-map-shared';

const { calculateDistance, calculateBearing, calculateDestination } = useDistanceCalculations();

const { calculatePolygonArea, calculatePolygonPerimeter, isPointInPolygon } = useAreaCalculations();

// Tính toán distance và area
function performCalculations() {
  const points: [number, number][] = [
    [105.0, 21.0],
    [106.0, 21.0],
    [106.0, 22.0],
    [105.0, 22.0],
    [105.0, 21.0], // Close polygon
  ];

  // Diện tích polygon
  const area = calculatePolygonArea(points);
  console.info('Polygon area:', area, 'square meters');

  // Chu vi polygon
  const perimeter = calculatePolygonPerimeter(points);
  console.info('Polygon perimeter:', perimeter, 'meters');

  // Kiểm tra point trong polygon
  const testPoint: [number, number] = [105.5, 21.5];
  const isInside = isPointInPolygon(testPoint, points);
  console.info('Point in polygon:', isInside);
}
</script>
```

### Coordinate Formatting

```vue
<script setup lang="ts">
import { useCoordinateFormatting } from '@hungpvq/vue-map-shared';

const { formatCoordinate, parseCoordinate, convertCoordinateFormat } = useCoordinateFormatting();

// Format coordinates
function formatCoordinates() {
  const point: [number, number] = [105.8342, 21.0285];

  // Decimal degrees
  const dd = formatCoordinate(point, 'DD');
  console.info('Decimal degrees:', dd);

  // Degrees, minutes, seconds
  const dms = formatCoordinate(point, 'DMS');
  console.info('DMS:', dms);

  // UTM
  const utm = formatCoordinate(point, 'UTM');
  console.info('UTM:', utm);

  // Parse coordinate
  const parsed = parseCoordinate('105°50\'3.12"E, 21°1\'43.12"N');
  console.info('Parsed coordinate:', parsed);
}
</script>
```

## 🧪 Testing

```bash
# Chạy tests
nx test shared-map

# Chạy tests với coverage
nx test shared-map --coverage
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
