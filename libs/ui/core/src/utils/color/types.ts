export type XYZ = [number, number, number];
export type LAB = [number, number, number];
export type HSV = { h: number; s: number; v: number; a?: number };
export type RGB = { r: number; g: number; b: number; a?: number };
export type HSL = { h: number; s: number; l: number; a?: number };
export type Hex = string & { __hexBrand: never };
export type Color = string | number | HSV | RGB | HSL;
