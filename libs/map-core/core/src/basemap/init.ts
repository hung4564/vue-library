import { BaseMapItem } from './types';

/** Thumbnail URL from published package assets (see vite rewrite → `./assets/basemap/*`). */
function basemapThumb(file: string): string {
  return new URL(
    /* @vite-ignore */ `../../assets/basemap/${file}`,
    import.meta.url,
  ).href;
}

export const INIT_BASEMAPS: BaseMapItem[] = [
  {
    link: '',
    thumbnail: basemapThumb('none.png'),
    type: 'no-basemap',
    title: 'None',
    id: 'null',
  },
  {
    id: '2',
    title: 'ArcGIS Satellite',
    type: 'raster',
    thumbnail: basemapThumb('arcgis-satellite.jpg'),
    attribution: 'Esri, Maxar, Earthstar Geographics',
    links: [
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    maxzoom: 19,
  },
  {
    id: '3',
    title: 'Dark',
    type: 'raster',
    thumbnail: basemapThumb('carto-dark.jpg'),
    attribution: '© CARTO, © OpenStreetMap contributors',
    links: [
      'https://cartodb-basemaps-1.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      'https://cartodb-basemaps-2.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      'https://cartodb-basemaps-3.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    ],
  },
  {
    id: '4',
    title: 'Open Street Map',
    type: 'raster',
    thumbnail: basemapThumb('osm.jpg'),
    attribution: '© OpenStreetMap contributors',
    links: [
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ],
  },
  {
    id: '5',
    title: 'Google Satellite',
    type: 'raster',
    thumbnail: basemapThumb('google-satellite.jpg'),
    attribution: 'Google',
    links: [
      'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    ],
  },
];
