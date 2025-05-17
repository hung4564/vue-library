import { fitBounds } from './index';
import { point } from '@turf/turf';

describe('fillBound', () => {
  let mockMap: any;

  beforeEach(() => {
    mockMap = {
      easeTo: jest.fn(),
      fitBounds: jest.fn(),
    };
  });

  it('should handle point features correctly', () => {
    const pointFeature = point([100, 0]);
    fitBounds(mockMap, pointFeature.geometry, { zoom: 12 });

    expect(mockMap.easeTo).toHaveBeenCalledWith({
      center: pointFeature.geometry.coordinates,
      zoom: 12,
      duration: 0,
      padding: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });
  });

  it('should handle bbox array directly', () => {
    const bbox = [100, 0, 101, 1];
    fitBounds(mockMap, bbox);

    expect(mockMap.fitBounds).toHaveBeenCalledWith(bbox, {
      padding: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      duration: 100,
    });
  });

  it('should return early if no value or map is provided', () => {
    fitBounds(null as any, { type: 'Point', coordinates: [0, 0] });
    fitBounds(mockMap, null);

    expect(mockMap.easeTo).not.toHaveBeenCalled();
    expect(mockMap.fitBounds).not.toHaveBeenCalled();
  });
});
