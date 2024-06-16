import { Map } from 'mapbox-gl';

export type MapSimple = Map & {
  id: string;
};

export type MapFCOnUseMap<T = void> = (map: MapSimple) => T;

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

export type Color = RGB | RGBA | HEX;

export type Coordinates = {
  x: number;
  y: number;
};
export type CoordinatesNumber = [number, number];
