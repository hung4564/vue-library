import type { MapSimple } from '../../types';

export function addCursorCrosshair(map: MapSimple) {
  if (!map) {
    return;
  }
  const canvas = map.getCanvas();
  canvas.classList.add('cursor-crosshair');
}

export function removeCursorCrosshair(map: MapSimple) {
  if (!map) {
    return;
  }
  const canvas = map.getCanvas();
  canvas.classList.remove('cursor-crosshair');
}
