import { describe, expect, it, beforeEach } from 'vitest';
import { Measure } from './Measure';
import { MeasureArea } from './MeasureArea';
import { MeasureAngle, angleAtVertexDegrees } from './MeasureAngle';
import { MeasureDistance } from './MeasureDistance';
import { MeasurePoint } from './MeasurePoint';
import { MeasureAzimuth } from './MeasureAzimuth';
import { MeasureRadius } from './MeasureRadius';
import { setMeasurementLabelPrefs } from '../utils';

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

  it('includes mid-edge labels and only area in settings fields', () => {
    const m = new MeasureArea();
    m.init([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
    const result = m.getResult();
    expect(result.fields).toHaveLength(1);
    expect(result.fields?.[0].trans).toContain('area');
    const edges =
      result.features_label?.filter((f) => f.properties?.is_edge) ?? [];
    expect(edges).toHaveLength(4);
    expect(typeof edges[0].properties?.text_rotate).toBe('number');
    expect(
      result.features_label?.some((f) => f.properties?.is_center),
    ).toBe(true);
  });
});

describe('MeasureRadius', () => {
  it('computes radius and circumference from center + edge', () => {
    const m = new MeasureRadius();
    m.init([
      [0, 0],
      [1, 0],
    ]);
    const result = m.getResult();
    expect(m.type).toBe('radius');
    expect(result.value as number).toBeGreaterThan(0);
    expect(result.fields?.some((f) => f.trans?.includes('radius'))).toBe(true);
    expect(result.fields?.some((f) => f.trans?.includes('circumference'))).toBe(
      true,
    );
    expect(result.features?.[0]?.geometry.type).toBe('Polygon');
  });
});

describe('MeasureAngle', () => {
  it('computes the angle at the middle of three points', () => {
    const right = angleAtVertexDegrees([0, 1], [0, 0], [1, 0]);
    expect(right).toBeCloseTo(90, 0);

    const m = new MeasureAngle();
    m.init([
      [0, 1],
      [0, 0],
      [1, 0],
    ]);
    const result = m.getResult();
    expect(m.type).toBe('angle');
    expect(result.value as number).toBeCloseTo(90, 0);
    expect(result.fields?.some((f) => f.trans?.endsWith('.angle'))).toBe(true);
    expect(result.features?.some((f) => f.geometry.type === 'LineString')).toBe(
      true,
    );
    // Arms + smaller-angle arc
    expect(result.features?.length).toBeGreaterThanOrEqual(2);
    expect(result.features_label?.[0]?.geometry.type).toBe('Point');
    // Label must not sit on the vertex
    expect(result.features_label?.[0]?.geometry).not.toEqual({
      type: 'Point',
      coordinates: [0, 0],
    });
  });
});

describe('MeasurePoint', () => {
  beforeEach(() => {
    setMeasurementLabelPrefs({
      showVertexLabels: true,
      showEdgeLabels: true,
      showResultLabel: true,
    });
  });

  it('includes a result label by default and honors showResultLabel', () => {
    const m = new MeasurePoint([
      { epsg: '4326', name: 'WGS84', default: true, unit: 'degree' },
    ]);
    m.init([[105, 21]]);
    const withLabel = m.getResult();
    expect(m.type).toBe('point');
    expect(withLabel.features_label).toHaveLength(1);
    expect(withLabel.features_label?.[0]?.properties?.is_result).toBe(true);

    setMeasurementLabelPrefs({ showResultLabel: false });
    const withoutLabel = m.getResult();
    expect(withoutLabel.features_label).toEqual([]);
    expect(withoutLabel.fields?.length).toBeGreaterThan(0);
  });
});

describe('MeasureAzimuth', () => {
  beforeEach(() => {
    setMeasurementLabelPrefs({ showResultLabel: true });
  });

  it('honors showResultLabel for the azimuth text', () => {
    const m = new MeasureAzimuth();
    m.init([
      [0, 0],
      [1, 0],
    ]);
    expect(m.getResult().features_label).toHaveLength(1);

    setMeasurementLabelPrefs({ showResultLabel: false });
    expect(m.getResult().features_label).toEqual([]);
  });
});
