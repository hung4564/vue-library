import { describe, expect, it } from 'vitest';
import { DrawingType, DrawingTypeName } from './drawing-type';

describe('DrawingType', () => {
  it('exposes Mapbox Draw mode ids', () => {
    expect(DrawingType.POINT).toBe('draw_point');
    expect(DrawingType.LINE_STRING).toBe('draw_line_string');
    expect(DrawingType.POLYGON).toBe('draw_polygon');
  });

  it('maps each mode to a display name', () => {
    expect(DrawingTypeName[DrawingType.POINT]).toBe('draw point');
    expect(DrawingTypeName[DrawingType.LINE_STRING]).toBe('draw line string');
    expect(DrawingTypeName[DrawingType.POLYGON]).toBe('draw polygon');
  });

  it('covers every DrawingType key in DrawingTypeName', () => {
    for (const mode of Object.values(DrawingType)) {
      expect(DrawingTypeName[mode]).toBeTruthy();
    }
  });
});
