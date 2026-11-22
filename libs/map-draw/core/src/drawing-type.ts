export const DrawingType = {
  POINT: 'draw_point',
  LINE_STRING: 'draw_line_string',
  POLYGON: 'draw_polygon',
} as const;

export const DrawingTypeName = {
  [DrawingType.POINT]: 'draw point',
  [DrawingType.LINE_STRING]: 'draw line string',
  [DrawingType.POLYGON]: 'draw polygon',
} as const;
