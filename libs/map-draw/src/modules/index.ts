export { default as DrawControl } from './DrawControl/DrawControl.vue';
export const DrawingType = {
  POINT: 'draw_point',
  LINE_STRING: 'draw_line_string',
  POLYGON: 'draw_polygon',
};
export const DrawingTypeName = {
  [DrawingType.POINT]: 'draw point',
  [DrawingType.LINE_STRING]: 'draw line string',
  [DrawingType.POLYGON]: 'draw polygon',
};
