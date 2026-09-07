import { describe, expect, it } from 'vitest';
import { Measure } from './Measure';
import { MeasureArea } from './MeasureArea';
import { MeasureDistance } from './MeasureDistance';

describe('Measure', () => {
  it('add/init/reset manage coordinates and replace invalid slots', () => {
    const m = new Measure();
    m.add([10, 20]);
    m.add([null as any, null as any]);
    m.add([30, 40]);
    expect(m.value[1]).toEqual([30, 40]);
    expect(m.coordinates).toEqual([
      [10, 20],
      [30, 40],
    ]);
    m.init([[2, 2]]);
    expect(m.value).toEqual([[2, 2]]);
    m.reset();
    expect(m.value).toEqual([]);
  });
});

describe('MeasureDistance', () => {
  it('computes length for multi-point lines', () => {
    const m = new MeasureDistance();
    m.init([
      [0, 0],
      [1, 0],
    ]);
    const result = m.getResult();
    expect(typeof result.value).toBe('number');
    expect(result.value as number).toBeGreaterThan(0);
    expect(result.format).toBeTruthy();
    expect(result.features?.[0]?.geometry.type).toBe('LineString');
  });
});

describe('MeasureArea', () => {
  it('computes area for closed polygons', () => {
    const m = new MeasureArea();
    m.init([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
    const result = m.getResult();
    expect(result.value as number).toBeGreaterThan(0);
    expect(result.format).toBeTruthy();
    expect(result.features?.[0]?.geometry.type).toBe('Polygon');
  });
});
