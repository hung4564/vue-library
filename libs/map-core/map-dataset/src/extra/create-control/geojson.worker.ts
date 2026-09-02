import type { GeoJSON } from 'geojson';
// Vite workers cannot resolve workspace package names and would leave
// `@hungpvq/map-core` external; import the source file so reproject is bundled.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { reprojectGeojsonToWgs84 } from '../../../../core/src/utils/geojson-reproject';
import { detectGeojsonCrs, parseGeojsonText } from './geojson-parse';

export type GeojsonWorkerRequest =
  | {
      id: string;
      type: 'parse-geojson';
      text: string;
    }
  | {
      id: string;
      type: 'read-geojson';
      file: File;
    }
  | {
      id: string;
      type: 'reproject-geojson';
      geojson: GeoJSON;
      crs?: string | null;
    };

export type GeojsonWorkerResponse = {
  id: string;
  ok: boolean;
  geojson?: GeoJSON | null;
  crs?: string | null;
  error?: string;
};

function parseAndDetect(text: string): {
  geojson: GeoJSON | null;
  crs: string | null;
} {
  const geojson = parseGeojsonText(text);
  return {
    geojson,
    crs: geojson ? detectGeojsonCrs(geojson) : null,
  };
}

self.onmessage = (event: MessageEvent<GeojsonWorkerRequest>) => {
  void handleMessage(event.data);
};

async function handleMessage(message: GeojsonWorkerRequest) {
  try {
    let geojson: GeoJSON | null = null;
    let crs: string | null = null;

    switch (message.type) {
      case 'parse-geojson': {
        const parsed = parseAndDetect(message.text);
        geojson = parsed.geojson;
        crs = parsed.crs;
        break;
      }
      case 'read-geojson': {
        const text = await message.file.text();
        const parsed = parseAndDetect(text);
        geojson = parsed.geojson;
        crs = parsed.crs;
        break;
      }
      case 'reproject-geojson': {
        geojson = reprojectGeojsonToWgs84(message.geojson, message.crs);
        break;
      }
      default:
        throw new Error('Unknown GeoJSON worker task');
    }

    const response: GeojsonWorkerResponse = {
      id: message.id,
      ok: true,
      geojson,
      crs,
    };
    self.postMessage(response);
  } catch (error) {
    const response: GeojsonWorkerResponse = {
      id: message.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
}
