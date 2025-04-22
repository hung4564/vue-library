---
category: Geojson
---

<script setup>
import Demo from './demo.vue'
</script>

# useGeoConvertToFile

<FunctionInfo :frontmatter="$frontmatter" package="Share - File" fn="useGeoConvertToFile" />
Easily convert GeoJSON data into multiple formats, including Shapefile, KML, GPX, CSV, and more.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Return Values

| Name      | Description                                                                             |
| --------- | --------------------------------------------------------------------------------------- |
| `convert` | Function to convert GeoJSON data into various formats such as Shapefile, KML, GPX, etc. |

## Input Parameters

- `data` (GeoJSON FeatureCollection)
  - This parameter represents the GeoJSON data that needs to be converted. The `data` should be a valid GeoJSON object following the `FeatureCollection` format.
  - Example of a valid `FeatureCollection`:
    ```ts
    const geojsonData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [102.0, 0.5],
          },
          properties: {
            name: 'Sample Point',
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [102.0, 0.0],
                [103.0, 0.0],
                [103.0, 1.0],
                [102.0, 1.0],
                [102.0, 0.0],
              ],
            ],
          },
          properties: {
            name: 'Sample Polygon',
          },
        },
      ],
    };
    ```
- `options` (ConvertOptions)
  - This is an optional object that allows you to specify the output format and filename.
  - Properties:
    - `format` (string): The desired output format. Can be one of the following values:
      - `'geojson'`
      - `'shapefile'`
      - `'kml'`
      - `'gpx'`
      - `'csv'`
    - `filename` (string): The name of the output file. Default is `'data'`.
  - Example of `ConvertOptions`:
    ```ts
    const options = {
      format: 'shapefile', // Converts the GeoJSON data to Shapefile
      filename: 'shapefile_output',
    };
    ```

## Usage

```ts
import { useGeoConvertToFile } from '@hungpvq/shared-file';

const { convert } = useGeoConvertToFile();

// Convert GeoJSON to Shapefile
const geojsonData = {
  type: 'FeatureCollection',
  features: [
    /* your features here */
  ],
};

const blob = await convert(geojsonData, { format: 'shapefile' });

// Convert GeoJSON to KML
const kmlBlob = await convert(geojsonData, { format: 'kml' });

// Convert GeoJSON to CSV
const csvBlob = await convert(geojsonData, { format: 'csv' });
```
