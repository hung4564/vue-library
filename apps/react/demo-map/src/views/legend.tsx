import type { MapSimple } from '@hungpvq/map-core';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';
import {
  BaseMapControl,
  FullScreenControl,
  GlobeControl,
  GotoControl,
  HomeControl,
  Map,
  MouseCoordinatesControl,
  SettingControl,
  useLayerLegend,
  ZoomControl,
} from '@hungpvq/react-map-core';
import type { LayerSpecification } from 'maplibre-gl';
import { useCallback, useState, type ReactNode } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import './legend.css';

export function LegendPage() {
  const { getLayerLegendNode } = useLayerLegend();
  const [legends, setLegends] = useState<ReactNode[]>([]);

  const onMapLoaded = useCallback(
    (map: MapSimple) => {
      const layers: LayerSpecification[] = [
        {
          id: 'my-line-layer',
          type: 'line',
          source: 'my-line-source',
          layout: {},
          paint: { 'line-pattern': 'aerialway_11' },
        },
        {
          id: 'my-line-dash-layer',
          type: 'line',
          source: 'my-line-source',
          layout: {},
          paint: {
            'line-color': 'red',
            'line-dasharray': [2, 2],
          },
        },
        {
          id: 'my-fill-layer',
          type: 'fill',
          source: 'my-fill-source',
          layout: {},
          paint: {
            'fill-pattern': 'aerialway_11',
            'fill-color': 'red',
          },
        },
        {
          id: 'points-symbol',
          type: 'symbol',
          source: 'points',
          layout: {
            'icon-image': 'aerialway_11',
            'icon-size': 1.5,
            'text-field': ['get', 'title'],
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
          },
          paint: { 'text-color': '#333' },
        },
        {
          id: 'text-labels',
          type: 'symbol',
          source: 'labels',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 14,
            'text-offset': [0, 0.5],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#ff0000',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        },
        new LayerSimpleMapboxBuild().setStyleType('point').build() as LayerSpecification,
        new LayerSimpleMapboxBuild().setStyleType('line').build() as LayerSpecification,
        new LayerSimpleMapboxBuild().setStyleType('area').build() as LayerSpecification,
      ];
      setLegends(layers.map((layer) => getLayerLegendNode(map, layer)));
    },
    [getLayerLegendNode],
  );

  return (
    <MapPageShell>
      <Map onMapLoaded={onMapLoaded}>
        <AsideControl position="top-left" />
        <GotoControl position="top-right" />
        <GlobeControl />
        <SettingControl />
        <FullScreenControl />
        <ZoomControl />
        <HomeControl />
        <MouseCoordinatesControl />
        <BaseMapControl position="bottom-left" />
      </Map>
      <div className="legend-control">
        {legends.map((node, index) => (
          <div key={index}>{node}</div>
        ))}
      </div>
    </MapPageShell>
  );
}
