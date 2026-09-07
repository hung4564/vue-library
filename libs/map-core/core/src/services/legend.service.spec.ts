import { describe, expect, it, vi } from 'vitest';
import { LegendService } from './legend.service';

describe('LegendService', () => {
  it('generateLegendItems maps layer configs to legend items', () => {
    expect(
      LegendService.generateLegendItems([
        { id: 'roads', title: 'Roads', visible: true },
        { id: 'water', visible: false },
      ]),
    ).toEqual([
      { id: 'roads', title: 'Roads', visible: true },
      { id: 'water', title: 'water', visible: false },
    ]);
  });

  it('toggleLayerVisibility updates layout when layer exists', async () => {
    const map = {
      getLayer: vi.fn(() => ({ id: 'roads' })),
      setLayoutProperty: vi.fn(),
    };
    await LegendService.toggleLayerVisibility(map as any, 'roads', false);
    expect(map.setLayoutProperty).toHaveBeenCalledWith(
      'roads',
      'visibility',
      'none',
    );
  });

  it('toggleLayerVisibility no-ops when layer missing', async () => {
    const map = {
      getLayer: vi.fn(() => undefined),
      setLayoutProperty: vi.fn(),
    };
    await LegendService.toggleLayerVisibility(map as any, 'missing', true);
    expect(map.setLayoutProperty).not.toHaveBeenCalled();
  });
});
