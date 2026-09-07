export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Keep a rectangle fully inside the container; shrink if larger than the container. */
export function clampBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number,
): Bounds {
  const w = Math.max(0, Math.min(width, containerWidth || width));
  const h = Math.max(0, Math.min(height, containerHeight || height));
  const maxX = Math.max(0, (containerWidth || 0) - w);
  const maxY = Math.max(0, (containerHeight || 0) - h);
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
    width: w,
    height: h,
  };
}
