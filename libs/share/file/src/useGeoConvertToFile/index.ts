import shpwrite, { DownloadOptions, ZipOptions } from '@mapbox/shp-write';
import type { FeatureCollection } from 'geojson';
import Papa from 'papaparse';
import tokml from 'tokml';

export type SupportedFormat = 'geojson' | 'shapefile' | 'kml' | 'csv';

interface ConvertOptions {
  format?: SupportedFormat;
  filename?: string;
}
function detectFormatFromFilename(filename: string): SupportedFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'geojson':
    case 'json':
      return 'geojson';
    case 'zip':
    case 'shp':
      return 'shapefile';
    case 'kml':
      return 'kml';
    case 'csv':
      return 'csv';
    default:
      return null;
  }
}

export function useGeoConvertToFile() {
  async function convert(
    data: FeatureCollection,
    { format, filename = 'data' }: ConvertOptions = {}
  ): Promise<Blob | null> {
    const detectedFormat = format || detectFormatFromFilename(filename);
    if (!detectedFormat) {
      console.error('Không xác định được định dạng đầu ra.');
      return null;
    }

    switch (detectedFormat) {
      case 'geojson':
        return new Blob([JSON.stringify(data)], {
          type: 'application/geo+json',
        });

      case 'shapefile': {
        const options: DownloadOptions & ZipOptions = {
          folder: 'shapefile',
          types: {
            point: 'points',
            polygon: 'polygons',
            line: 'lines',
          },
          compression: 'DEFLATE', // Sử dụng 'gzip' hoặc 'deflate' là các giá trị hợp lệ cho Compression
          outputType: 'blob',
        };
        const result = await shpwrite.zip(data, options);
        // Chỉ trả về Blob cho việc tải xuống
        if (result instanceof Blob) {
          return result;
        } else if (result instanceof ArrayBuffer) {
          return new Blob([result]); // Chuyển ArrayBuffer thành Blob
        } else if (result instanceof Uint8Array) {
          return new Blob([result.buffer]); // Chuyển Uint8Array thành Blob
        } else if (Array.isArray(result)) {
          return new Blob([new Uint8Array(result).buffer]); // Chuyển mảng số nguyên thành Blob
        } else if (typeof result === 'string') {
          return new Blob([result], { type: 'text/plain' }); // Chuyển string thành Blob
        } else {
          console.error('Kết quả không xác định:', result);
          return null;
        }
      }

      case 'kml': {
        const kmlStr = tokml(data);
        return new Blob([kmlStr], {
          type: 'application/vnd.google-earth.kml+xml',
        });
      }
      case 'csv': {
        const features = data.features.map((f) => ({
          ...f.properties,
          geometry: JSON.stringify(f.geometry),
        }));
        const csv = Papa.unparse(features);
        return new Blob([csv], { type: 'text/csv' });
      }

      default:
        console.error('Định dạng không được hỗ trợ:', detectedFormat);
        return null;
    }
  }

  return {
    convert,
  };
}
