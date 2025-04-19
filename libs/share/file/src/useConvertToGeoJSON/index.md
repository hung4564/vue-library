---
category: Geojson
---

<script setup>
import Demo from './demo.vue'
</script>

# useConvertToGeoJSON

<FunctionInfo :frontmatter="$frontmatter" package="Share - File" fn="useConvertToGeoJSON" />
Easily convert raw input data into GeoJSON format, with automatic geometry detection, validation.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Return Values

| Name             | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| `convertFeature` | Convert a single item with geometry into a valid GeoJSON Feature |
| `convertList`    | Convert an array of items into a GeoJSON FeatureCollection       |

## Input Format

Each input item should follow this structure:

- `geometry` (`any`)  
  An array representing the coordinates. The geometry type is auto-detected based on its structure.
- Additional key-value pairs will be preserved in the GeoJSON `properties`.

## Example Input

```ts
const rawData = [
  {
    name: 'Line A',
    geometry: [
      [105.8, 20.9],
      [105.9, 21.0],
    ],
  },
  {
    name: 'Polygon B',
    geometry: [
      [
        [105.8, 20.8],
        [105.9, 20.8],
        [105.9, 20.9],
        [105.8, 20.9],
        [105.8, 20.8],
      ],
    ],
  },
];
```

## Usage

```ts
import { useConvertToGeoJSON } from '@hungpvq/shared-file';

const { convertFeature, convertList } = useConvertToGeoJSON();

const feature = convertFeature({
  name: 'Test Line',
  geometry: [
    [105.8, 20.9],
    [105.9, 21.0],
  ],
});

const collection = convertList([
  {
    name: 'Test Line',
    geometry: [
      [105.8, 20.9],
      [105.9, 21.0],
    ],
  },
]);
```
