import {
  THUMB_ARCGIS_SATELLITE_JPG,
  THUMB_CARTO_DARK_JPG,
  THUMB_GOOGLE_SATELLITE_JPG,
  THUMB_NONE_PNG,
  THUMB_OSM_JPG,
} from './default-thumbnails';
import { BaseMapItem } from './types';

export const INIT_BASEMAPS: BaseMapItem[] = [
  {
    link: '',
    thumbnail: THUMB_NONE_PNG,
    type: 'no-basemap',
    title: 'None',
    id: 'null',
  },
  {
    id: '2',
    title: 'ArcGIS Satellite',
    type: 'raster',
    thumbnail: THUMB_ARCGIS_SATELLITE_JPG,
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
    thumbnail: THUMB_CARTO_DARK_JPG,
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
    thumbnail: THUMB_OSM_JPG,
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
    thumbnail: THUMB_GOOGLE_SATELLITE_JPG,
    attribution: 'Google',
    links: [
      'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    ],
  },
];
