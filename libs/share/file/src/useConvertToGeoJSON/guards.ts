export type Coord = [number, number]; // [lng, lat]

export interface InputFeature {
  geometry: any;
  [key: string]: any;
}

// Guard: Coord (lng, lat)
export function isCoord(value: any): value is Coord {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  );
}

// Guard: Coord[]
export function isCoordArray(value: any): value is Coord[] {
  return Array.isArray(value) && value.every(isCoord);
}

// Guard: Coord[][]
export function isCoord2DArray(value: any): value is Coord[][] {
  return Array.isArray(value) && value.every(isCoordArray);
}

// Guard: Coord[][][]
export function isCoord3DArray(value: any): value is Coord[][][] {
  return Array.isArray(value) && value.every(isCoord2DArray);
}

// Guard: InputFeature
export function isInputFeature(obj: any): obj is InputFeature {
  return obj && typeof obj === 'object' && 'geometry' in obj;
}
