/* eslint-disable no-unused-vars */

import type { Color, CoordinatesNumber, MapSimple } from '@hungpvq/shared-map';
import { Marker } from 'mapbox-gl';
import { IViewSetting } from '../types';
import { View } from './_view';

type onDragMarker = (
  coordinates: CoordinatesNumber[],
  coordinate: CoordinatesNumber,
  index: number,
  marker: Marker
) => void;
type onRightClickMarker = (
  coordinate: CoordinatesNumber,
  index: number,
  marker: Marker
) => void;
export class MapMarkerView extends View {
  protected map: MapSimple;
  protected markers: Marker[] = [];
  protected bindEvent: Record<string, any> = {};
  protected color: Color = '#fff';
  public onDragMarker?: onDragMarker;
  public onRightClickMarker?: onRightClickMarker;
  constructor(map: MapSimple) {
    super();
    this.map = map;
    this.markers = [];
  }
  setColor(color: Color) {
    this.color = color;
    return this;
  }
  view({ coordinates = [] }: IViewSetting = {}) {
    const draggable = !!this.onDragMarker;
    if (coordinates.length < this.markers.length) {
      while (coordinates.length < this.markers.length) {
        const marker = this.markers.pop();
        if (marker) marker.remove();
      }
    }
    coordinates.forEach((coordinate, index) => {
      if (!coordinate[0] || !coordinate[1]) {
        return;
      }
      let marker = this.markers[index];
      if (!marker) {
        this.bindEvent[index] = {};
        marker = getMarkerNode({ color: this.color, draggable });
        this.markers[index] = marker;
      }
      marker
        .setLngLat({ lng: coordinate[0], lat: coordinate[1] })
        .addTo(this.map);
      if (draggable) {
        if (this.bindEvent[index]['dragend']) {
          marker.off('dragend', this.bindEvent[index]['dragend']);
        }
        this.bindEvent[index]['dragend'] = () => {
          const lngLat = marker.getLngLat();
          const new_coordinate: CoordinatesNumber = [lngLat.lng, lngLat.lat];
          const new_coordinates = coordinates.slice();
          new_coordinates[index] = new_coordinate;
          if (this.onDragMarker)
            this.onDragMarker(new_coordinates, new_coordinate, index, marker);
        };
        marker.on('dragend', this.bindEvent[index]['dragend']);
      }
      const element = marker.getElement();
      if (this.onRightClickMarker) {
        if (this.bindEvent[index]['contextmenu']) {
          element.removeEventListener(
            'contextmenu',
            this.bindEvent[index]['contextmenu']
          );
        }
        this.bindEvent[index]['contextmenu'] = (event: MouseEvent) => {
          event.preventDefault();
          const lngLat = marker.getLngLat();
          if (this.onRightClickMarker)
            this.onRightClickMarker([lngLat.lng, lngLat.lat], index, marker);
        };

        element.addEventListener(
          'contextmenu',
          this.bindEvent[index]['contextmenu']
        );
      }
    });
  }
  reset() {
    this.markers.forEach((m) => {
      m.remove();
    });
    this.markers = [];
  }
  destroy() {
    this.reset();
  }
}
function getMarkerNode({
  color,
  draggable = false,
}: { color?: Color; draggable?: boolean } = {}) {
  const node = document.createElement('div');
  node.style.width = '12px';
  node.style.height = '12px';
  node.style.borderRadius = '50%';
  node.style.background = '#fff';
  node.style.boxSizing = 'border-box';
  node.style.border = `2px solid ${color}`;
  node.style.cursor = 'pointer';
  return new Marker({
    element: node,
    draggable,
  });
}
